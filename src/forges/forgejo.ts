// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, safeTry } from "neverthrow";
import { Forge } from ".";
import { Api, ContentsResponse, forgejoApi } from "forgejo-js";
import { FileNotFound, NotAFile, VariableNotFound } from "./errors";
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
  ): Promise<Result<string, VariableNotFound | Error>> {
    const response = await this.client.repos.getRepoVariable(
      this.repository.ownerUsername,
      this.repository.name,
      name,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return err(new VariableNotFound(name));
      }

      return err(new Error(response.error.message));
    }

    return ok(response.data.data!);
  }

  async getFile(
    path: string,
  ): Promise<Result<ContentsResponse, FileNotFound | NotAFile | Error>> {
    const response = await this.client.repos.repoGetContents(
      this.repository.ownerUsername,
      this.repository.name,
      path,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return err(new FileNotFound(path));
      }

      return err(new Error(response.error.message));
    }

    if (response.data.type !== "file") {
      return err(new NotAFile(path));
    }

    return ok(response.data);
  }

  async getContent(
    path: string,
  ): Promise<Result<string, FileNotFound | NotAFile | Error>> {
    const self = this;

    return safeTry(async function* () {
      const file = yield* await self.getFile(path);

      return ok(Buffer.from(file.content!, "base64").toString());
    });
  }

  async writeContent(
    path: string,
    branch: string,
    message: string,
    content: string,
  ): Promise<Result<void, FileNotFound | NotAFile | Error>> {
    const self = this;

    return safeTry(async function* () {
      const file = yield* await self.getFile(path);

      const sha = file.sha!;

      const response = await self.client.repos.repoUpdateFile(
        self.repository.ownerUsername,
        self.repository.name,
        path,
        {
          branch,
          content: Buffer.from(content, "binary").toString("base64"),
          message,
          sha,
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return err(new FileNotFound(path));
        }

        return err(new Error(response.error.message));
      }

      return ok();
    });
  }
}
