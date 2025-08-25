// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, safeTry, Result } from "neverthrow";
import { Forge, ForgeKind, getForge } from "../forges";
import { Repository } from "../repositories";
import { getDeserializer } from "../configurations/deserializers";
import { InvalidVariable, ValidateForge, ValidateVariable } from "./errors";
import { Repository as RepositoryConfiguration } from "../configurations/types";
import { InvalidForgeKind } from "../forges/errors";
import z from "zod";

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
  ): Result<Validator, InvalidForgeKind> {
    return safeTry(function* () {
      return ok(
        new Validator(yield* getForge(repository, forgeKind), repository),
      );
    });
  }

  async validateRepository(): Promise<Result<void, unknown>> {
    return safeTry(async function* (this: Validator) {
      const repositoryDeserializer = yield* getDeserializer(
        this.repository.configurationPath,
      );
      const repository = yield* repositoryDeserializer.deserializeRepository(
        yield* await this.forge.getContent(this.repository.configurationPath),
      );

      const errors = [];

      const validateForgeResult = await this.validateForge(repository);

      if (validateForgeResult.isErr()) {
        errors.push(...validateForgeResult.error);
      }

      if (errors.length > 0) {
        return err(errors);
      }

      return ok();
    }.bind(this));
  }

  async validateForge(
    repository: z.infer<typeof RepositoryConfiguration>,
  ): Promise<Result<void, ValidateForge>> {
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
          const [name, value] = variable;

          return await this.validateVariable(name, value);
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
  ): Promise<Result<void, ValidateVariable>> {
    return safeTry(async function* (this: Validator) {
      let remoteValue = yield* await this.forge.getVariable(name);

      if (remoteValue !== value) {
        return err({
          type: "invalidVariable",
          message: `The value of the "${name}" variable is different from the value specified in the repository configuration file.`,
          value,
          expectedValue: remoteValue,
        } as InvalidVariable);
      }

      return ok();
    }.bind(this));
  }
}
