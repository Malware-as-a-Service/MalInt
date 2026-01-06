// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { type Api, type ContentsResponse, forgejoApi } from "forgejo-js";
import { err, ok, type Result, ResultAsync, safeTry } from "neverthrow";
import type { Repository } from "../repositories";
import { type Forge, RunStatus } from ".";
import type {
	DispatchWorkflowError,
	DownloadArtifactError,
	GetActiveRunError,
	GetContentError,
	GetRunStatusError,
	SetSecretError,
	WriteContentError,
} from "./errors";

export class Forgejo implements Forge {
	private readonly client: Api<unknown>;
	private readonly repository: Repository;

	constructor(repository: Repository) {
		this.client = forgejoApi(repository.baseAddress, {
			token: repository.token,
		});
		this.repository = repository;
	}

	private async getFile(
		path: string,
	): Promise<Result<ContentsResponse, GetContentError>> {
		const response = await this.client.repos.repoGetContents(
			this.repository.ownerUsername,
			this.repository.name,
			path,
			{ ref: this.repository.buildingBranch },
		);

		if (!response.ok) {
			if (response.status === 404) {
				return err({
					type: "notFound",
					message: `File "${path}" not found.`,
					resource: path,
				});
			}

			return err({
				type: "generic",
				status: response.status,
				message: `Failed to fetch file "${path}".`,
				error: response.error as Error,
			});
		}

		if (response.data.type !== "file") {
			return err({
				type: "notFound",
				message: `File "${path}" not found.`,
				resource: path,
			});
		}

		return ok(response.data);
	}

	async getContent(path: string): Promise<Result<string, GetContentError>> {
		return safeTry(
			async function* (this: Forgejo) {
				const file = yield* await this.getFile(path);

				return ok(Buffer.from(file.content as string, "base64").toString());
			}.bind(this),
		);
	}

	async writeContent(
		path: string,
		message: string,
		content: string,
	): Promise<Result<string, WriteContentError>> {
		return safeTry(
			async function* (this: Forgejo) {
				const file = yield* await this.getFile(path);

				const response = await this.client.repos.repoUpdateFile(
					this.repository.ownerUsername,
					this.repository.name,
					path,
					{
						branch: this.repository.buildingBranch,
						content: Buffer.from(content).toString("base64"),
						message,
						sha: file.sha as string,
					},
				);

				if (!response.ok) {
					if (response.status === 404) {
						return err({
							type: "notFound" as const,
							message: `File "${path}" not found.`,
							resource: path,
						});
					}

					if (response.status === 409) {
						return err({
							type: "conflict" as const,
							message: `Conflict while updating file "${path}".`,
						});
					}

					return err({
						type: "generic" as const,
						status: response.status,
						message: `Failed to update file "${path}".`,
						error: response.error as Error,
					});
				}

				const commitSha =
					response.data.commit?.sha ?? response.data.content?.sha ?? null;

				if (!commitSha) {
					return err({
						type: "invalidResponse" as const,
						message: `Missing commit SHA after updating file "${path}".`,
						detail: "Expected commit.sha or content.sha in response.",
					});
				}

				return ok(commitSha);
			}.bind(this),
		);
	}

	async setSecret(
		name: string,
		value: string,
	): Promise<Result<void, SetSecretError>> {
		const response = await this.client.repos.updateRepoSecret(
			this.repository.ownerUsername,
			this.repository.name,
			name,
			{ data: value },
		);

		if (!response.ok) {
			return err({
				type: "generic",
				status: response.status,
				message: `Failed to set secret "${name}".`,
				error: response.error as Error,
			});
		}

		return ok(undefined);
	}

	async dispatchWorkflow(
		workflow: string,
		branch: string,
		inputs?: Record<string, string>,
	): Promise<Result<number, DispatchWorkflowError>> {
		const response = await this.client.repos.dispatchWorkflow(
			this.repository.ownerUsername,
			this.repository.name,
			workflow,
			{ ref: branch, inputs, return_run_info: true },
		);

		if (response.ok) {
			return ok(response.data.id as number);
		}

		if (response.status === 404) {
			return err({
				type: "notFound",
				message: `Workflow "${workflow}" not found.`,
				resource: workflow,
			});
		}

		return err({
			type: "generic",
			status: response.status,
			message: `Failed to dispatch workflow "${workflow}".`,
			error: response.error as Error,
		});
	}

	private mapStatusToRunStatus(status: string): RunStatus {
		const statusMap: Record<string, RunStatus> = {
			unknown: RunStatus.Unknown,
			waiting: RunStatus.Waiting,
			running: RunStatus.Running,
			success: RunStatus.Success,
			failure: RunStatus.Failure,
			cancelled: RunStatus.Cancelled,
			skipped: RunStatus.Skipped,
			blocked: RunStatus.Blocked,
		};

		return statusMap[status] ?? RunStatus.Unknown;
	}

	async getRunStatus(
		runIdentifier: number,
	): Promise<Result<RunStatus, GetRunStatusError>> {
		const response = await this.client.request<{ status: string }>({
			path: `/repos/${this.repository.ownerUsername}/${this.repository.name}/actions/runs/${runIdentifier}`,
			method: "GET",
			secure: true,
			format: "json",
		});

		if (!response.ok) {
			if (response.status === 404) {
				return err({
					type: "notFound",
					message: `Workflow run with identifier "${runIdentifier}" not found.`,
					resource: runIdentifier.toString(),
				});
			}

			return err({
				type: "generic",
				status: response.status,
				message: `Failed to get workflow run status for run identifier "${runIdentifier}".`,
				error: response.error as Error,
			});
		}

		return ok(this.mapStatusToRunStatus(response.data.status));
	}

	async getActiveRun(
		workflow: string,
		branch: string,
	): Promise<Result<number | null, GetActiveRunError>> {
		const response = await this.client.request<{
			workflow_runs: Array<{
				id: number;
				workflow_id: string;
				prettyref: string;
			}>;
		}>({
			path: `/repos/${this.repository.ownerUsername}/${this.repository.name}/actions/runs`,
			method: "GET",
			secure: true,
			format: "json",
			query: {
				status: ["waiting", "running"],
			},
		});

		if (!response.ok) {
			return err({
				type: "generic",
				status: response.status,
				message: `Failed to list workflow runs.`,
				error: response.error as Error,
			});
		}

		const activeRun = response.data.workflow_runs?.find(
			(run) => run.workflow_id === workflow && run.prettyref === branch,
		);

		return ok(activeRun?.id ?? null);
	}

	async downloadArtifact(
		runIdentifier: number,
		name: string,
	): Promise<Result<Buffer, DownloadArtifactError>> {
		const url = `${this.repository.baseAddress}/${this.repository.ownerUsername}/${this.repository.name}/actions/runs/${runIdentifier}/artifacts/${name}`;

		const fetchResult = await ResultAsync.fromPromise(
			fetch(url, {
				headers: {
					Authorization: `token ${this.repository.token}`,
				},
			}),
			(error) =>
				({
					type: "generic",
					status: 0,
					message: `Failed to fetch artifact "${name}".`,
					error: error as Error,
				}) as const,
		);

		if (fetchResult.isErr()) {
			return err(fetchResult.error);
		}

		const response = fetchResult.value;

		if (!response.ok) {
			if (response.status === 404) {
				return err({
					type: "notFound" as const,
					message: `Artifact "${name}" not found for run "${runIdentifier}".`,
					resource: name,
				});
			}

			return err({
				type: "generic" as const,
				status: response.status,
				message: `Failed to download artifact "${name}".`,
				error: new Error(`HTTP ${response.status}: ${response.statusText}`),
			});
		}

		const arrayBufferResult = await ResultAsync.fromPromise(
			response.arrayBuffer(),
			(error) =>
				({
					type: "generic",
					status: 0,
					message: `Failed to read artifact "${name}" data.`,
					error: error as Error,
				}) as const,
		);

		if (arrayBufferResult.isErr()) {
			return err(arrayBufferResult.error);
		}

		return ok(Buffer.from(arrayBufferResult.value));
	}
}
