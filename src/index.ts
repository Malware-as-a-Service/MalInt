// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ok, Result, safeTry } from "neverthrow";
import { Forge, ForgeKind, getForge } from "./forges";
import { Repository } from "./repositories";
import { RepositoryConfiguration } from "./configurations/types";
import { getDeserializer } from "./configurations/deserializers";
import { z } from "zod";
import { MalIntError } from "./errors";

export class MalInt {
	forge: Forge;
	repository: Repository;
	repositoryConfiguration: z.infer<typeof RepositoryConfiguration>;

	private constructor(
		forge: Forge,
		repository: Repository,
		repositoryConfiguration: z.infer<typeof RepositoryConfiguration>,
	) {
		this.forge = forge;
		this.repository = repository;
		this.repositoryConfiguration = repositoryConfiguration;
	}

	static async createMalInt(
		repository: Repository,
		forgeKind: ForgeKind,
	): Promise<Result<MalInt, MalIntError>> {
		return safeTry(async function* () {
			const forge = yield* getForge(repository, forgeKind);
			const deserializer = yield* getDeserializer(repository.configurationPath);
			const repositoryConfiguration = yield* deserializer.deserializeRepository(
				yield* await forge.getContent(repository.configurationPath),
			);

			return ok(new MalInt(forge, repository, repositoryConfiguration));
		});
	}
}
