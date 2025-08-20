// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok } from "neverthrow";
import { Forge } from ".";
import { Api, forgejoApi } from "forgejo-js";
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

  async getContent(
    path: string,
  ): Promise<Result<string, FileNotFound | NotAFile | Error>> {
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

    return ok(Buffer.from(response.data.content!, "base64").toString());
  }

  async writeContent(
    path: string,
    branch: string,
    message: string,
    content: string,
  ): Promise<Result<void, FileNotFound | NotAFile | Error>> {
    let contentResponse = await this.client.repos.repoGetContents(
      this.repository.ownerUsername,
      this.repository.name,
      path,
    );

    if (!contentResponse.ok) {
      if (contentResponse.status === 404) {
        return err(new FileNotFound(path));
      }

      return err(new Error(contentResponse.error.message));
    }

    if (contentResponse.data.type !== "file") {
      return err(new NotAFile(path));
    }

    const sha = contentResponse.data.sha!;

    const updateResponse = await this.client.repos.repoUpdateFile(
      this.repository.ownerUsername,
      this.repository.name,
      path,
      {
        branch,
        content: Buffer.from(content, "binary").toString("base64"),
        message,
        sha,
      },
    );

    if (!updateResponse.ok) {
      if (updateResponse.status === 404) {
        return err(new FileNotFound(path));
      }

      return err(new Error(updateResponse.error.message));
    }

    return ok();
  }
}
