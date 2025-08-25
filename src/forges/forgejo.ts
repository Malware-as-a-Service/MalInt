// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, safeTry } from "neverthrow";
import { Forge } from ".";
import { Api, ContentsResponse, forgejoApi } from "forgejo-js";
import { Conflict, GetContent, GetFile, GetVariable, NotFound, Unexpected, Validation, WriteContent } from "./errors";
import { Result } from "neverthrow";
import { Repository } from "../repositories";

export class Forgejo implements Forge {
  client: Api<unknown>;
  repository: Repository;

  constructor(repository: Repository) {
    this.client = forgejoApi(repository.baseAddress, {
      token: repository.token,
    });
    this.repository = repository;
  }

  async getVariable(
    name: string,
  ): Promise<Result<string, GetVariable>> {
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

    return ok(response.data.data!);
  }

  async getFile(
    path: string,
  ): Promise<Result<ContentsResponse, GetFile>> {
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

  async getContent(
    path: string,
  ): Promise<Result<string, GetContent>> {
    const getFile = this.getFile;

    return safeTry(async function* () {
      const file = yield* await getFile(path);

      return ok(Buffer.from(file.content!, "base64").toString());
    });
  }

  async writeContent(
    path: string,
    message: string,
    content: string,
  ): Promise<Result<void, WriteContent>> {
    const getFile = this.getFile;
    const client = this.client;
    const repository = this.repository;

    return safeTry(async function* () {
      const file = yield* await getFile(path);
      const sha = file.sha!;

      const response = await client.repos.repoUpdateFile(
        repository.ownerUsername,
        repository.name,
        path,
        {
          branch: repository.buildingBranch,
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
            } as NotFound);
          case 409:
            return err({
              type: "conflict",
              message: `Conflict while updating file "${path}".`,
            } as Conflict);
          case 422:
            return err({
              type: "validation",
              message: `Validation error while updating file "${path}".`,
              detail: response.error.message,
            } as Validation);
          default:
            return err({
              type: "unexpected",
              status: response.status,
              message: `Unexpected error while updating file "${path}".`,
              error: response.error as Error,
            } as Unexpected);
        }
      }

      return ok();
    });
  }
}
