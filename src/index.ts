// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ok, Result, safeTry } from "neverthrow";
import { Forge, ForgeKind, getForge } from "./forges";
import { Repository } from "./repositories";
import { RepositoryConfiguration } from "./configurations/types";
import {
	deserializeJsonSchema,
	deserializeUiSchema,
	getDeserializer,
} from "./configurations/deserializers";
import { z } from "zod";
import { CreateMalIntError, GetClientSideConfigurations } from "./errors";
import { ClientSideConfigurations } from "./types";

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
	): Promise<Result<MalInt, CreateMalIntError>> {
		return safeTry(async function* () {
			const forge = yield* getForge(repository, forgeKind);
			const deserializer = yield* getDeserializer(repository.configurationPath);
			const repositoryConfiguration = yield* deserializer.deserializeRepository(
				yield* await forge.getContent(repository.configurationPath),
			);

			return ok(new MalInt(forge, repository, repositoryConfiguration));
		});
	}

	async getClientSideConfigurations(): Promise<
		Result<ClientSideConfigurations, GetClientSideConfigurations>
	> {
		return safeTry(
			async function* (this: MalInt) {
				let configuration: ClientSideConfigurations = {};

				const { serverPath, serverUiPath, malwarePath, malwareUiPath } =
					this.repositoryConfiguration.configurations.clientSide;

				if (serverPath) {
					const schema = yield* deserializeJsonSchema(
						yield* await this.forge.getContent(serverPath),
					);
					const uiSchema = yield* deserializeUiSchema(
						yield* await this.forge.getContent(serverUiPath as string),
					);

					configuration.server = {
						schema,
						uiSchema,
					};
				}

				if (malwarePath) {
					const schema = yield* deserializeJsonSchema(
						yield* await this.forge.getContent(malwarePath),
					);
					const uiSchema = yield* deserializeUiSchema(
						yield* await this.forge.getContent(malwareUiPath as string),
					);

					configuration.malware = {
						schema,
						uiSchema,
					};
				}

				return ok(configuration);
			}.bind(this),
		);
	}
}
