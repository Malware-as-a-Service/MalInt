// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";

const variableNameRegex = /^(?!FORGEJO_|GITHUB_)[A-Za-z0-9_]+$/;
const variableNameErrorMessage =
	'Variable name must not start with "FORGEJO_" or "GITHUB_" and can only contain alphanumeric characters and underscores.';

export const Repository = z.object({
	forge: z.object({
		buildingBranchVariableName: z
			.string()
			.regex(variableNameRegex, variableNameErrorMessage),
		configurationPathVariableName: z
			.string()
			.regex(variableNameRegex, variableNameErrorMessage),
	}),
	server: z.object({
		containerfilePath: z.string(),
	}),
	malware: z.object({
		configurationPath: z.string(),
	}),
	configurations: z.object({
		serverSide: z.object({
			serverPath: z.string().optional(),
			malwarePath: z.string(),
		}),
		clientSide: z
			.object({
				serverPath: z.string().optional(),
				serverUiPath: z.string().optional(),
				malwarePath: z.string().optional(),
				malwareUiPath: z.string().optional(),
			})
			.refine(
				(configuration) =>
					(configuration.serverPath === undefined &&
						configuration.serverUiPath === undefined) ||
					(configuration.serverPath !== undefined &&
						configuration.serverUiPath !== undefined),
				{
					message:
						'The "serverPath" and "serverUiPath" fields must be present, or both undefined.',
					path: ["serverPath", "serverUiPath"],
				},
			)
			.refine(
				(configuration) =>
					(configuration.malwarePath === undefined &&
						configuration.malwareUiPath === undefined) ||
					(configuration.malwarePath !== undefined &&
						configuration.malwareUiPath !== undefined),
				{
					message:
						'Fields "The "malwarePath" and "malwareUiPath" fields must be present, or both undefined.',
					path: ["malwarePath", "malwareUiPath"],
				},
			),
	}),
});

const functionRegex = /@(\w+)\(([^)]*)\)/;
const functionErrorMessage =
	"Function must match format: @functionName(firstParameter, secondParameter, ...)";

export const ServerSideServer = z.object().catchall(
	z.object({
		function: z.string().regex(functionRegex, functionErrorMessage),
		type: z.enum(["secret", "plaintext"]),
	}),
);

export const ServerSideMalware = z.object().catchall(
	z.union([
		z.object({
			function: z.string().regex(functionRegex, functionErrorMessage),
		}),
		z.object({
			from: z.string(),
		}),
	]),
);
