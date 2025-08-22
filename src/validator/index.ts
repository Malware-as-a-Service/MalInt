// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, safeTry, Result } from "neverthrow";
import { Forge, ForgeKind, getForge } from "../forges";
import { Repository } from "../repositories";
import { getFormat } from "../configurations/formats";
import { InvalidVariable } from "./errors";
import { FailToParse, InvalidExtension } from "../configurations/errors";
import z, { ZodError } from "zod";
import { FileNotFound, InvalidForge, NotAFile } from "../forges/errors";
import { Repository as RepositoryConfiguration } from "../configurations/types";

export class Validator {
  forge: Forge;
  repository: Repository;

  private constructor(forge: Forge, repository: Repository) {
    this.forge = forge;
    this.repository = repository;
  }

  static createValidator(
    repository: Repository,
    forgeKind: ForgeKind,
  ): Result<Validator, InvalidForge> {
    return safeTry(function* () {
      return ok(
        new Validator(yield* getForge(repository, forgeKind), repository),
      );
    });
  }

  async validateRepository(): Promise<
    Result<
      void,
      | InvalidExtension
      | FileNotFound
      | NotAFile
      | Error
      | FailToParse
      | ZodError
      | InvalidVariable[]
    >
  > {
    const self = this;

    return safeTry(async function* () {
      const repositoryFormat = yield* getFormat(
        self.repository.configurationPath,
      );
      const repository = yield* repositoryFormat.deserializeRepository(
        yield* await self.forge.getContent(self.repository.configurationPath),
      );

      yield* await self.validateForge(repository);

      return ok();
    });
  }

  async validateForge(
    repository: z.infer<typeof RepositoryConfiguration>,
  ): Promise<Result<void, InvalidVariable[]>> {
    const variables = [
      [
        repository.forge.buildingBranchVariableName,
        this.repository.buildingBranch,
      ],
      [
        repository.forge.configurationPathVariableName,
        repository.malware.configurationPath,
      ],
    ];

    const result = Result.combineWithAllErrors(
      await Promise.all(
        variables.map(async (variable) => {
          const self = this;
          const [name, value] = variable;

          return await self.validateVariable(name, value);
        }),
      ),
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok();
  }

  private async validateVariable(
    name: string,
    value: string,
  ): Promise<Result<void, InvalidVariable>> {
    const self = this;

    return safeTry(async function* () {
      let remoteValue = yield* await self.forge.getVariable(name);

      if (remoteValue !== value) {
        return err(new InvalidVariable(name));
      }

      return ok();
    });
  }
}
