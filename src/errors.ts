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

export type CreateMalIntError =
	| InvalidForgeKindError
	| InvalidExtensionError
	| GetContentError
	| DeserializeError;
export type BuildContainerError =
	| SetSecretError
	| DispatchWorkflowError
	| GetActiveRunError;
export type BuildMalwareError =
	| InvalidExtensionError
	| WriteContentError
	| DispatchWorkflowError
	| GetContentError
	| DeserializeError;
export type WaitForContainerError = GetRunStatusError | BuildFailedError;
export type WaitForMalwareError =
	| GetRunStatusError
	| DownloadArtifactError
	| BuildFailedError;
export type GetConfigurationsError =
	| GetContentError
	| DeserializeError
	| InvalidExtensionError;
export type GenerateConfigurationError = InvokeError | VariableNotFoundError;
export type GenerateServerConfigurationError =
	| GetConfigurationsError
	| GenerateConfigurationError
	| ServerConfigurationRequiredError;
export type GenerateMalwareConfigurationError =
	| GetConfigurationsError
	| GenerateConfigurationError;

export interface BuildFailedError {
	type: "buildFailed";
	message: string;
	runIdentifier: number;
	status: RunStatus;
}

export interface VariableNotFoundError {
	type: "variableNotFound";
	message: string;
	path: string;
}

export interface ServerConfigurationRequiredError {
	type: "serverConfigurationRequired";
	message: string;
}
