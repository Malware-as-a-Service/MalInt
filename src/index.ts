// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result, safeTry } from "neverthrow";
import type { z } from "zod";
import { getSerializer } from "./configurations/serializers";
import {
	JsonObject,
	RepositoryConfiguration,
	ServerSideMalwareConfiguration,
	ServerSideServerConfiguration,
} from "./configurations/types";
import type {
	BuildContainerError,
	BuildMalwareError,
	CreateMalIntError,
	GetConfigurationsError,
	WaitForContainerError,
	WaitForMalwareError,
} from "./errors";
import { type Forge, type ForgeKind, getForge, RunStatus } from "./forges";
import type { Repository } from "./repositories";
import type { Configurations } from "./types";

export class MalInt {
	forge: Forge;
	private repository: Repository;
	private repositoryConfiguration: z.infer<typeof RepositoryConfiguration>;
	private configurations: Configurations;

	private constructor(
		forge: Forge,
		repository: Repository,
		repositoryConfiguration: z.infer<typeof RepositoryConfiguration>,
	) {
		this.forge = forge;
		this.repository = repository;
		this.repositoryConfiguration = repositoryConfiguration;
		this.configurations = {};
	}

	static async createMalInt(
		repository: Repository,
		forgeKind: ForgeKind,
	): Promise<Result<MalInt, CreateMalIntError>> {
		return safeTry(async function* () {
			const forge = yield* getForge(repository, forgeKind);
			const serializer = yield* getSerializer(repository.configurationPath);
			const repositoryConfiguration = yield* serializer.deserialize(
				RepositoryConfiguration,
				yield* await forge.getContent(repository.configurationPath),
			);

			return ok(new MalInt(forge, repository, repositoryConfiguration));
		});
	}

	async buildContainer(registryCredentials: {
		url: string;
		username: string;
		password: string;
	}): Promise<Result<number, BuildContainerError>> {
		return safeTry(
			async function* (this: MalInt) {
				const { secrets } = this.repositoryConfiguration.forge;
				const { workflow, containerfilePath, containerName, containerVersion } =
					this.repositoryConfiguration.server;

				const activeRunId = yield* await this.forge.getActiveRun(
					workflow,
					this.repository.buildingBranch,
				);

				if (activeRunId !== null) {
					return ok(activeRunId);
				}

				yield* await this.forge.setSecret(
					secrets.registryUrl,
					registryCredentials.url,
				);
				yield* await this.forge.setSecret(
					secrets.registryUsername,
					registryCredentials.username,
				);
				yield* await this.forge.setSecret(
					secrets.registryPassword,
					registryCredentials.password,
				);

				const runIdentifier = yield* await this.forge.dispatchWorkflow(
					workflow,
					this.repository.buildingBranch,
					{
						[containerfilePath.name]: containerfilePath.value,
						[containerName.name]: containerName.value,
						[containerVersion.name]: containerVersion.value,
					},
				);

				return ok(runIdentifier);
			}.bind(this),
		);
	}

	async buildMalware(
		configuration: object,
	): Promise<Result<number, BuildMalwareError>> {
		return safeTry(
			async function* (this: MalInt) {
				const { configurationPath, workflow, artifactName } =
					this.repositoryConfiguration.malware;

				const serializer = yield* getSerializer(configurationPath);
				const serializedContent = serializer.serialize(configuration);

				yield* await this.forge.writeContent(
					configurationPath,
					"Update malware configuration",
					serializedContent,
				);

				const runIdentifier = yield* await this.forge.dispatchWorkflow(
					workflow,
					this.repository.buildingBranch,
					{
						[artifactName.name]: artifactName.value,
					},
				);

				return ok(runIdentifier);
			}.bind(this),
		);
	}

	async waitForContainer(
		runIdentifier: number,
		pollInterval = 5000,
	): Promise<Result<void, WaitForContainerError>> {
		return safeTry(
			async function* (this: MalInt) {
				while (true) {
					const status = yield* await this.forge.getRunStatus(runIdentifier);

					if (status === RunStatus.Success) {
						return ok(undefined);
					}

					if (
						status === RunStatus.Failure ||
						status === RunStatus.Cancelled ||
						status === RunStatus.Skipped
					) {
						return err({
							type: "buildFailed" as const,
							message: `Container build failed with status "${status}".`,
							runIdentifier,
							status,
						});
					}

					await new Promise((resolve) => setTimeout(resolve, pollInterval));
				}
			}.bind(this),
		);
	}

	async waitForMalware(
		runIdentifier: number,
		pollInterval = 5000,
	): Promise<Result<Buffer, WaitForMalwareError>> {
		return safeTry(
			async function* (this: MalInt) {
				while (true) {
					const status = yield* await this.forge.getRunStatus(runIdentifier);

					if (status === RunStatus.Success) {
						const { artifactName } = this.repositoryConfiguration.malware;
						const artifact = yield* await this.forge.downloadArtifact(
							runIdentifier,
							artifactName.value,
						);

						return ok(artifact);
					}

					if (
						status === RunStatus.Failure ||
						status === RunStatus.Cancelled ||
						status === RunStatus.Skipped
					) {
						return err({
							type: "buildFailed" as const,
							message: `Malware build failed with status "${status}".`,
							runIdentifier,
							status,
						});
					}

					await new Promise((resolve) => setTimeout(resolve, pollInterval));
				}
			}.bind(this),
		);
	}

	async getServerSideConfigurations(): Promise<
		Result<Configurations["serverSide"], GetConfigurationsError>
	> {
		if (this.configurations.serverSide) {
			return ok(this.configurations.serverSide);
		}

		return safeTry(
			async function* (this: MalInt) {
				const { serverSide } = this.repositoryConfiguration.configurations;

				const malwareSerializer = yield* getSerializer(serverSide.malware);
				const malwareContent = yield* await this.forge.getContent(
					serverSide.malware,
				);
				const malware = yield* malwareSerializer.deserialize(
					ServerSideMalwareConfiguration,
					malwareContent,
				);

				let server: object | undefined;

				if (serverSide.server) {
					const serverSerializer = yield* getSerializer(serverSide.server);
					const serverContent = yield* await this.forge.getContent(
						serverSide.server,
					);
					server = yield* serverSerializer.deserialize(
						ServerSideServerConfiguration,
						serverContent,
					);
				}

				const configurations = { malware, server };
				this.configurations.serverSide = configurations;

				return ok(configurations);
			}.bind(this),
		);
	}

	async getClientSideConfigurations(): Promise<
		Result<Configurations["clientSide"], GetConfigurationsError>
	> {
		if (this.configurations.clientSide) {
			return ok(this.configurations.clientSide);
		}

		return safeTry(
			async function* (this: MalInt) {
				const { clientSide } = this.repositoryConfiguration.configurations;

				if (!clientSide) {
					return ok(undefined);
				}

				const configurations: Configurations["clientSide"] = {};

				if (clientSide.server) {
					const schemaSerializer = yield* getSerializer(clientSide.server.schema);
					const schemaContent = yield* await this.forge.getContent(
						clientSide.server.schema,
					);
					const schema = yield* schemaSerializer.deserialize(
						JsonObject,
						schemaContent,
					);

					const uiSerializer = yield* getSerializer(clientSide.server.ui);
					const uiContent = yield* await this.forge.getContent(
						clientSide.server.ui,
					);
					const ui = yield* uiSerializer.deserialize(JsonObject, uiContent);

					configurations.server = { schema, ui };
				}

				if (clientSide.malware) {
					const schemaSerializer = yield* getSerializer(
						clientSide.malware.schema,
					);
					const schemaContent = yield* await this.forge.getContent(
						clientSide.malware.schema,
					);
					const schema = yield* schemaSerializer.deserialize(
						JsonObject,
						schemaContent,
					);

					const uiSerializer = yield* getSerializer(clientSide.malware.ui);
					const uiContent = yield* await this.forge.getContent(
						clientSide.malware.ui,
					);
					const ui = yield* uiSerializer.deserialize(JsonObject, uiContent);

					configurations.malware = { schema, ui };
				}

				this.configurations.clientSide = configurations;

				return ok(configurations);
			}.bind(this),
		);
	}

	async getOutputConfigurations(): Promise<
		Result<Configurations["outputs"], GetConfigurationsError>
	> {
		if (this.configurations.outputs) {
			return ok(this.configurations.outputs);
		}

		return safeTry(
			async function* (this: MalInt) {
				const { outputs } = this.repositoryConfiguration.configurations;

				if (!outputs) {
					return ok(undefined);
				}

				const configurations: Configurations["outputs"] = {};

				if (outputs.instance) {
					const schemaSerializer = yield* getSerializer(
						outputs.instance.schema,
					);
					const schemaContent = yield* await this.forge.getContent(
						outputs.instance.schema,
					);
					const schema = yield* schemaSerializer.deserialize(
						JsonObject,
						schemaContent,
					);

					const uiSerializer = yield* getSerializer(outputs.instance.ui);
					const uiContent = yield* await this.forge.getContent(
						outputs.instance.ui,
					);
					const ui = yield* uiSerializer.deserialize(JsonObject, uiContent);

					configurations.instance = { schema, ui };
				}

				if (outputs.victims) {
					const schemaSerializer = yield* getSerializer(outputs.victims.schema);
					const schemaContent = yield* await this.forge.getContent(
						outputs.victims.schema,
					);
					const schema = yield* schemaSerializer.deserialize(
						JsonObject,
						schemaContent,
					);

					const uiSerializer = yield* getSerializer(outputs.victims.ui);
					const uiContent = yield* await this.forge.getContent(
						outputs.victims.ui,
					);
					const ui = yield* uiSerializer.deserialize(JsonObject, uiContent);

					configurations.victims = { schema, ui };
				}

				this.configurations.outputs = configurations;

				return ok(configurations);
			}.bind(this),
		);
	}
}
