// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";

const variableNameRegex = /^(?!FORGEJO_|GITHUB_)[A-Za-z0-9_]+$/;
const variableNameErrorMessage =
	'Variable name must not start with "FORGEJO_" or "GITHUB_" and can only contain alphanumeric characters and underscores.';

export const RepositoryConfiguration = z.object({
	forge: z.object({
		secrets: z.object({
			registryUrl: z
				.string()
				.regex(variableNameRegex, variableNameErrorMessage),
			registryUsername: z
				.string()
				.regex(variableNameRegex, variableNameErrorMessage),
			registryPassword: z
				.string()
				.regex(variableNameRegex, variableNameErrorMessage),
		}),
	}),
	server: z.object({
		workflow: z.string(),
		containerfilePath: z.object({
			name: z.string(),
			value: z.string(),
		}),
		containerName: z.object({
			name: z.string(),
			value: z.string(),
		}),
		containerVersion: z.object({
			name: z.string(),
			value: z.string(),
		}),
	}),
	malware: z.object({
		configurationPath: z.string(),
		workflow: z.string(),
		artifactName: z.object({
			name: z.string(),
			value: z.string(),
		}),
	}),
	configurations: z.object({
		serverSide: z.object({
			server: z.string().optional(),
			malware: z.string(),
		}),
		clientSide: z
			.object({
				server: z
					.object({
						schema: z.string(),
						ui: z.string(),
					})
					.optional(),
				malware: z
					.object({
						schema: z.string(),
						ui: z.string(),
					})
					.optional(),
			})
			.optional(),
		outputs: z
			.object({
				instance: z
					.object({
						schema: z.string(),
						ui: z.string(),
					})
					.optional(),
				victims: z
					.object({
						schema: z.string(),
						ui: z.string(),
					})
					.optional(),
			})
			.optional(),
	}),
});

const functionRegex = /@(\w+)\(([^)]*)\)/;
const functionErrorMessage =
	"Function must match format: @functionName(firstParameter, secondParameter, ...)";

const ServerSideServerConfigurationValueLeaf = z.object({
	function: z.string().regex(functionRegex, functionErrorMessage),
	type: z.enum(["secret", "plaintext"]),
});

export const ServerSideServerConfiguration: z.ZodType<{
	[key: string]: unknown;
}> = z.lazy(() =>
	z
		.object()
		.catchall(
			z.union([
				ServerSideServerConfigurationValueLeaf,
				ServerSideServerConfiguration,
			]),
		),
);

const ServerSideMalwareConfigurationValueLeaf = z.union([
	z.object({
		function: z.string().regex(functionRegex, functionErrorMessage),
	}),
	z.object({
		from: z.string(),
	}),
]);

export const ServerSideMalwareConfiguration: z.ZodType<{
	[key: string]: unknown;
}> = z.lazy(() =>
	z
		.object()
		.catchall(
			z.union([
				ServerSideMalwareConfigurationValueLeaf,
				ServerSideMalwareConfiguration,
			]),
		),
);

// Needs to be done
export const UiSchema = z.any();
export const JsonObject = z.object({}).catchall(z.any());
