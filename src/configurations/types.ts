// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";

const variableNameRegex = /^(?!FORGEJO_|GITHUB_)[A-Za-z0-9_]+$/;
const variableNameErrorMessage =
	'Variable name must not start with "FORGEJO_" or "GITHUB_" and can only contain alphanumeric characters and underscores.';

export const Forge = z.object({
	buildingBranchVariableName: z
		.string()
		.uppercase()
		.regex(variableNameRegex, variableNameErrorMessage),
	configurationPathVariableName: z
		.string()
		.regex(variableNameRegex, variableNameErrorMessage),
});

export const ServerConfigurations = z.object({
	serverConfigurationPath: z.string().optional(),
	malwareConfigurationPath: z.string(),
});

export const ClientConfigurations = z
	.object({
		serverConfigurationPath: z.string().optional(),
		serverUiPath: z.string().optional(),
		malwareConfigurationPath: z.string().optional(),
		malwareUiPath: z.string().optional(),
	})
	.refine(
		(configuration) =>
			(configuration.serverConfigurationPath === undefined &&
				configuration.serverUiPath === undefined) ||
			(configuration.serverConfigurationPath !== undefined &&
				configuration.serverUiPath !== undefined),
		{
			message:
				'The "serverConfigurationPath" and "serverUiPath" fields must be present, or both undefined.',
			path: ["serverConfigurationPath", "serverUiPath"],
		},
	)
	.refine(
		(configuration) =>
			(configuration.malwareConfigurationPath === undefined &&
				configuration.malwareUiPath === undefined) ||
			(configuration.malwareConfigurationPath !== undefined &&
				configuration.malwareUiPath !== undefined),
		{
			message:
				'Fields "The "malwareConfigurationPath" and "malwareUiPath" fields must be present, or both undefined.',
			path: ["mawlareConfigurationPath", "malwareUiPath"],
		},
	);

export const Configurations = z.object({
	server: ServerConfigurations,
	client: ClientConfigurations,
});

export const Server = z.object({
	containerfilePath: z.string(),
});

export const Malware = z.object({
	configurationPath: z.string(),
});

export const Repository = z.object({
	forge: Forge,
	configurations: Configurations,
	server: Server,
	malware: Malware,
});
