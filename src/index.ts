// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result, safeTry } from "neverthrow";
import { type Forge, type ForgeKind, getForge, RunStatus } from "./forges";
import type { Repository } from "./repositories";
import type { RepositoryConfiguration } from "./configurations/types";
import { getSerializer } from "./configurations/serializers";
import type { z } from "zod";
import type {
	BuildContainerError,
	BuildMalwareError,
	CreateMalIntError,
	WaitForContainerError,
	WaitForMalwareError,
} from "./errors";

export class MalInt {
	forge: Forge;
	private repository: Repository;
	private repositoryConfiguration: z.infer<typeof RepositoryConfiguration>;

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
			const serializer = yield* getSerializer(repository.configurationPath);
			const repositoryConfiguration = yield* serializer.deserializeRepository(
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
}
