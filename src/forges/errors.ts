// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { ForgeKind } from ".";

/** Errors returned when setting a secret via the forge client. */
export type SetSecretError = GenericError;
/** Errors returned when reading repository contents via the forge client. */
export type GetContentError = NotFoundError | GenericError;
/** Errors returned when updating repository contents via the forge client. */
export type WriteContentError =
	| NotFoundError
	| ConflictError
	| GenericError
	| InvalidResponseError;
/** Errors returned when dispatching a workflow via the forge client. */
export type DispatchWorkflowError = NotFoundError | GenericError;
/** Errors returned when fetching a workflow run status via the forge client. */
export type GetRunStatusError = NotFoundError | GenericError;
/** Errors returned when checking for an active run via the forge client. */
export type GetActiveRunError = GenericError;
/** Errors returned when downloading an artifact via the forge client. */
export type DownloadArtifactError = NotFoundError | GenericError;

/** Returned when an unknown forge kind is requested. */
export interface InvalidForgeKindError {
	type: "invalidForgeKind";
	message: string;
	kind: ForgeKind;
	validKinds: ForgeKind[];
}

/** Returned when a requested resource is not found. */
export interface NotFoundError {
	type: "notFound";
	message: string;
	resource: string;
}

/** Returned when a write conflicts with the current repository state. */
export interface ConflictError {
	type: "conflict";
	message: string;
	detail?: string;
}

/** Returned for generic HTTP or API failures. */
export interface GenericError {
	type: "generic";
	status: number;
	message: string;
	error?: Error;
}

/** Returned when the forge API response is missing expected fields. */
export interface InvalidResponseError {
	type: "invalidResponse";
	message: string;
	detail?: string;
}
