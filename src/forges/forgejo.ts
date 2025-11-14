// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result, safeTry } from "neverthrow";
import { RunStatus, type Forge } from ".";
import { type Api, type ContentsResponse, forgejoApi } from "forgejo-js";
import type {
	ConflictError,
	DispatchWorkflowError,
	GenericError,
	GetActiveRunError,
	GetContentError,
	GetRunStatusError,
	NotFoundError,
	SetSecretError,
	SetVariableError,
	WriteContentError,
} from "./errors";
import type { Repository } from "../repositories";

export class Forgejo implements Forge {
	client: Api<unknown>;
	repository: Repository;

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
				const sha = file.sha as string;

				const response = await this.client.repos.repoUpdateFile(
					this.repository.ownerUsername,
					this.repository.name,
					path,
					{
						branch: this.repository.buildingBranch,
						content: Buffer.from(content).toString("base64"),
						message,
						sha,
					},
				);

				if (!response.ok) {
					switch (response.status) {
						case 404:
							return err({
								type: "notFound",
								message: `File "${path}" not found.`,
								resource: path,
							} as NotFoundError);
						case 409:
							return err({
								type: "conflict",
								message: `Conflict while updating file "${path}".`,
							} as ConflictError);
						default:
							return err({
								type: "generic",
								status: response.status,
								message: `Failed to update file "${path}".`,
								error: response.error as Error,
							} as GenericError);
					}
				}

				return ok(response.data.commit?.sha as string);
			}.bind(this),
		);
	}

	async setVariable(
		name: string,
		value: string,
	): Promise<Result<void, SetVariableError>> {
		const response = await this.client.repos.createRepoVariable(
			this.repository.ownerUsername,
			this.repository.name,
			name,
			{ value },
		);

		if (!response.ok) {
			return err({
				type: "generic",
				status: response.status,
				message: `Failed to set variable "${name}".`,
				error: response.error as Error,
			});
		}

		return ok(undefined);
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
		workflowName: string,
		branch: string,
		inputs?: Record<string, string>,
	): Promise<Result<number, DispatchWorkflowError>> {
		const response = await this.client.repos.dispatchWorkflow(
			this.repository.ownerUsername,
			this.repository.name,
			workflowName,
			{ ref: branch, inputs },
		);

		if (!response.ok) {
			if (response.status === 404) {
				return err({
					type: "notFound",
					message: `Workflow "${workflowName}" not found.`,
					resource: workflowName,
				});
			}

			return err({
				type: "generic",
				status: response.status,
				message: `Failed to dispatch workflow "${workflowName}".`,
				error: response.error as Error,
			});
		}

		const runIdentifier = response.data.id as number;
		return ok(runIdentifier);
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

		const status = response.data.status;

		switch (status) {
			case "unknown":
				return ok(RunStatus.Unknown);
			case "waiting":
				return ok(RunStatus.Waiting);
			case "running":
				return ok(RunStatus.Running);
			case "success":
				return ok(RunStatus.Success);
			case "failure":
				return ok(RunStatus.Failure);
			case "cancelled":
				return ok(RunStatus.Cancelled);
			case "skipped":
				return ok(RunStatus.Skipped);
			case "blocked":
				return ok(RunStatus.Blocked);
			default:
				return ok(RunStatus.Unknown);
		}
	}

	async getActiveRun(
		workflowName: string,
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
				status: "running,waiting",
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
			(run) => run.workflow_id === workflowName && run.prettyref === branch,
		);

		return ok(activeRun?.id ?? null);
	}
}
