// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result, safeTry } from "neverthrow";
import type { z } from "zod";
import { Api } from "./api";
import type { InvokeError } from "./api/errors";
import { generateConfiguration } from "./configurations/generators";
import { getSerializer } from "./configurations/serializers";
import {
	JsonObject,
	RepositoryConfiguration,
	ServerLeaf,
	ServerSideMalwareConfiguration,
	ServerSideServerConfiguration,
	functionRegex,
} from "./configurations/types";
import type {
	BuildContainerError,
	BuildMalwareError,
	CreateMalIntError,
	GenerateConfigurationError,
	GenerateMalwareConfigurationError,
	GenerateServerConfigurationError,
	GetConfigurationsError,
	VariableNotFoundError,
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
	private api: Api;
	private generatedServerConfiguration?: object;

	private constructor(
		forge: Forge,
		repository: Repository,
		repositoryConfiguration: z.infer<typeof RepositoryConfiguration>,
	) {
		this.forge = forge;
		this.repository = repository;
		this.repositoryConfiguration = repositoryConfiguration;
		this.configurations = {};
		this.api = new Api();
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
				const { configurationPath, workflow, artifactName, commitShaName } =
					this.repositoryConfiguration.malware;

				const serializer = yield* getSerializer(configurationPath);
				const serializedContent = serializer.serialize(configuration);

				const commitSha = yield* await this.forge.writeContent(
					configurationPath,
					"Update malware configuration",
					serializedContent,
				);

				const runIdentifier = yield* await this.forge.dispatchWorkflow(
					workflow,
					this.repository.buildingBranch,
					{
						[artifactName.name]: artifactName.value,
						[commitShaName]: commitSha,
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
					const serverConfigurations = yield* await this.getSchemaUiPair(
						clientSide.server,
					);
					configurations.server = serverConfigurations;
				}

				if (clientSide.malware) {
					const malwareConfigurations = yield* await this.getSchemaUiPair(
						clientSide.malware,
					);
					configurations.malware = malwareConfigurations;
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
					const instanceConfigurations = yield* await this.getSchemaUiPair(
						outputs.instance,
					);
					configurations.instance = instanceConfigurations;
				}

				if (outputs.victims) {
					const victimsConfigurations = yield* await this.getSchemaUiPair(
						outputs.victims,
					);
					configurations.victims = victimsConfigurations;
				}

				this.configurations.outputs = configurations;

				return ok(configurations);
			}.bind(this),
		);
	}

	async generateServerConfiguration(): Promise<
		Result<object, GenerateServerConfigurationError>
	> {
		return safeTry(
			async function* (this: MalInt) {
				const configurations =
					this.configurations.serverSide ||
					(yield* await this.getServerSideConfigurations());

				if (!configurations.server) {
					return err({
						type: "serverConfigurationRequired",
						message: "Server configuration is required",
					});
				}

				const generated = yield* this.generateConfiguration(
					configurations.server,
					false,
				);
				this.generatedServerConfiguration = generated;

				return ok(generated);
			}.bind(this),
		);
	}

	async generateMalwareConfiguration(): Promise<
		Result<object, GenerateMalwareConfigurationError>
	> {
		return safeTry(
			async function* (this: MalInt) {
				const configurations =
					this.configurations.serverSide ||
					(yield* await this.getServerSideConfigurations());

				return ok(
					yield* this.generateConfiguration(configurations.malware, true),
				);
			}.bind(this),
		);
	}

	async getServerSecrets(): Promise<
		Result<
			Array<{ name: string; path: string[]; value: unknown }>,
			GenerateServerConfigurationError
		>
	> {
		return safeTry(
			async function* (this: MalInt) {
				const variables = yield* await this.getServerVariables();
				const secrets = variables
					.filter((variable) => variable.type === "secret")
					.map(({ name, path, value }) => ({ name, path, value }));

				return ok(secrets);
			}.bind(this),
		);
	}

	async getServerPlainText(): Promise<
		Result<
			Array<{ name: string; path: string[]; value: unknown }>,
			GenerateServerConfigurationError
		>
	> {
		return safeTry(
			async function* (this: MalInt) {
				const variables = yield* await this.getServerVariables();
				const plainText = variables
					.filter((variable) => variable.type === "plaintext")
					.map(({ name, path, value }) => ({ name, path, value }));

				return ok(plainText);
			}.bind(this),
		);
	}

	setServerHostname(hostname: string): Result<void, z.ZodError> {
		return this.api.setServerHostname(hostname);
	}

	private getServerVariables(): Promise<
		Result<
			Array<{
				name: string;
				path: string[];
				value: unknown;
				type: "secret" | "plaintext";
			}>,
			GenerateServerConfigurationError
		>
	> {
		return safeTry(
			async function* (this: MalInt) {
				const configurations =
					this.configurations.serverSide ||
					(yield* await this.getServerSideConfigurations());
				const generatedConfiguration =
					this.generatedServerConfiguration ||
					(yield* await this.generateServerConfiguration());

				const serverConfiguration = configurations.server;

				if (!serverConfiguration) {
					return err({
						type: "serverConfigurationRequired",
						message: "Server configuration is required",
					});
				}

				this.generatedServerConfiguration = generatedConfiguration;

				const variables =
					this.getServerVariableDefinitions(serverConfiguration);

				const resolvedVariables: Array<{
					name: string;
					path: string[];
					value: unknown;
					type: "secret" | "plaintext";
				}> = [];

				for (const variable of variables) {
					const value = yield* this.resolveVariable(variable.path);
					const segments = variable.path.split(".");
					const name = segments.at(-1) ?? variable.path;
					const path = segments.slice(0, -1);
					resolvedVariables.push({
						name,
						path,
						value,
						type: variable.type,
					});
				}

				return ok(resolvedVariables);
			}.bind(this),
		);
	}

	private getServerVariableDefinitions(
		configuration: object,
	): Array<{ path: string; type: "secret" | "plaintext" }> {
		const stack: Array<{ source: object; path: string }> = [];
		const variables: Array<{ path: string; type: "secret" | "plaintext" }> = [];

		stack.push({ source: configuration, path: "" });

		while (true) {
			const item = stack.pop();

			if (!item) {
				break;
			}

			for (const [key, value] of Object.entries(item.source)) {
				const path = item.path ? `${item.path}.${key}` : key;
				const leafResult = ServerLeaf.safeParse(value);

				if (leafResult.success) {
					variables.push({ path, type: leafResult.data.type });

					continue;
				}

				if (value && typeof value === "object" && !Array.isArray(value)) {
					stack.push({ source: value as object, path });
				}
			}
		}

		return variables;
	}

	private getSchemaUiPair(paths: {
		schema: string;
		ui: string;
	}): Promise<Result<{ schema: object; ui: object }, GetConfigurationsError>> {
		return safeTry(
			async function* (this: MalInt) {
				const schemaSerializer = yield* getSerializer(paths.schema);
				const schemaContent = yield* await this.forge.getContent(paths.schema);
				const schema = yield* schemaSerializer.deserialize(
					JsonObject,
					schemaContent,
				);

				const uiSerializer = yield* getSerializer(paths.ui);
				const uiContent = yield* await this.forge.getContent(paths.ui);
				const ui = yield* uiSerializer.deserialize(JsonObject, uiContent);

				return ok({ schema, ui });
			}.bind(this),
		);
	}

	private generateConfiguration(
		configuration: object,
		allowVariableReferences: boolean,
	): Result<object, GenerateConfigurationError> {
		return generateConfiguration(configuration, allowVariableReferences, {
			executeFunction: (functionString) =>
				this.executeFunction(functionString),
			resolveVariable: (variablePath) => this.resolveVariable(variablePath),
		});
	}

	private resolveVariable(
		variablePath: string,
	): Result<unknown, VariableNotFoundError> {
		if (!this.generatedServerConfiguration) {
			return err({
				type: "variableNotFound",
				message: "Server configuration not generated yet",
				path: variablePath,
			});
		}

		const pathParts = variablePath.split(".");
		let value: unknown = this.generatedServerConfiguration;

		for (const part of pathParts) {
			if (!value || typeof value !== "object") {
				return err({
					type: "variableNotFound",
					message: `Variable "${variablePath}" not found`,
					path: variablePath,
				});
			}

			value = (value as Record<string, unknown>)[part];
		}

		if (value === undefined) {
			return err({
				type: "variableNotFound",
				message: `Variable "${variablePath}" not found`,
				path: variablePath,
			});
		}

		return ok(value);
	}

	private executeFunction(
		functionString: string,
	): Result<unknown, InvokeError> {
		const [, functionName, argumentsString] = functionString.match(
			functionRegex,
		) as RegExpMatchArray;
		const arguments_ = argumentsString
			? argumentsString.split(",").map((argument) => argument.trim())
			: [];

		return this.api.invoke(functionName, ...arguments_);
	}
}
