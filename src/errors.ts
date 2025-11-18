// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
	DeserializeError,
	InvalidExtensionError,
} from "./configurations/errors";
import type {
	DispatchWorkflowError,
	GetActiveRunError,
	GetContentError,
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
