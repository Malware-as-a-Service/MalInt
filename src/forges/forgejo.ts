// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, safeTry } from "neverthrow";
import type { Forge } from ".";
import { type Api, type ContentsResponse, forgejoApi } from "forgejo-js";
import type {
	ConflictError,
	GetContentError,
	GetFileError,
	GetVariableError,
	NotFoundError,
	UnexpectedError,
	ValidationError,
	WriteContentError,
} from "./errors";
import type { Result } from "neverthrow";
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

	async getVariable(name: string): Promise<Result<string, GetVariableError>> {
		const response = await this.client.repos.getRepoVariable(
			this.repository.ownerUsername,
			this.repository.name,
			name,
		);

		if (!response.ok) {
			if (response.status === 404) {
				return err({
					type: "notFound",
					message: `Variable "${name}" not found.`,
					resource: name,
				});
			}

			return err({
				type: "unexpected",
				status: response.status,
				message: `Unexpected error while fetching variable "${name}".`,
				error: response.error as Error,
			});
		}

		return ok(response.data.data as string);
	}

	private async getFile(
		path: string,
	): Promise<Result<ContentsResponse, GetFileError>> {
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
				type: "unexpected",
				status: response.status,
				message: `Unexpected error while fetching file "${path}".`,
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
						case 422:
							return err({
								type: "validation",
								message: `Validation error while updating file "${path}".`,
								detail: response.error.message,
							} as ValidationError);
						default:
							return err({
								type: "unexpected",
								status: response.status,
								message: `Unexpected error while updating file "${path}".`,
								error: response.error as Error,
							} as UnexpectedError);
					}
				}

				return ok(response.data.commit?.sha as string);
			}.bind(this),
		);
	}
}
