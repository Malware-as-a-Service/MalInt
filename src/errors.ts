// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
	DeserializeError,
	InvalidExtensionError,
} from "./configurations/errors";
import type { InvokeError } from "./api/errors";
import type { RunStatus } from "./forges";
import type {
	DispatchWorkflowError,
	DownloadArtifactError,
	GetActiveRunError,
	GetContentError,
	GetRunStatusError,
	InvalidForgeKindError,
	SetSecretError,
	WriteContentError,
} from "./forges/errors";

/**
 * Errors returned by createMalInt.
 */
export type CreateMalIntError =
	| InvalidForgeKindError
	| InvalidExtensionError
	| GetContentError
	| DeserializeError;
/**
 * Errors returned by buildContainer.
 */
export type BuildContainerError =
	| SetSecretError
	| DispatchWorkflowError
	| GetActiveRunError;
/**
 * Errors returned by buildMalware.
 */
export type BuildMalwareError =
	| InvalidExtensionError
	| WriteContentError
	| DispatchWorkflowError
	| GetContentError
	| DeserializeError;
/**
 * Errors returned by waitForContainer.
 */
export type WaitForContainerError = GetRunStatusError | BuildFailedError;
/**
 * Errors returned by waitForMalware.
 */
export type WaitForMalwareError =
	| GetRunStatusError
	| DownloadArtifactError
	| BuildFailedError;
/**
 * Errors returned when loading configuration documents.
 */
export type GetConfigurationsError =
	| GetContentError
	| DeserializeError
	| InvalidExtensionError;
/**
 * Errors returned when generating server or malware configurations.
 */
export type GenerateConfigurationError =
	| InvokeError
	| VariableNotFoundError
	| InvalidConfigurationValueError;
/**
 * Errors returned by generateServerConfiguration.
 */
export type GenerateServerConfigurationError =
	| GetConfigurationsError
	| GenerateConfigurationError
	| ServerConfigurationRequiredError;
/**
 * Errors returned by generateMalwareConfiguration.
 */
export type GenerateMalwareConfigurationError =
	| GetConfigurationsError
	| GenerateConfigurationError;

/**
 * Returned when a workflow run fails.
 */
export interface BuildFailedError {
	type: "buildFailed";
	message: string;
	runIdentifier: number;
	status: RunStatus;
}

/**
 * Returned when a referenced variable is missing.
 */
export interface VariableNotFoundError {
	type: "variableNotFound";
	message: string;
	path: string;
}

/**
 * Returned when a server configuration is required but missing.
 */
export interface ServerConfigurationRequiredError {
	type: "serverConfigurationRequired";
	message: string;
}

/**
 * Returned when a configuration value has an invalid type or shape.
 */
export interface InvalidConfigurationValueError {
	type: "invalidConfigurationValue";
	message: string;
	path: string[];
	valueType: string;
}
