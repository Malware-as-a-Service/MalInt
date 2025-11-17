// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { ForgeKind } from ".";

export type SetSecretError = GenericError;
export type GetContentError = NotFoundError | GenericError;
export type WriteContentError = NotFoundError | ConflictError | GenericError;
export type DispatchWorkflowError = NotFoundError | GenericError;
export type GetRunStatusError = NotFoundError | GenericError;
export type GetActiveRunError = GenericError;
export type DownloadArtifactError = NotFoundError | GenericError;

export interface InvalidForgeKindError {
	type: "invalidForgeKind";
	message: string;
	kind: ForgeKind;
	validKinds: ForgeKind[];
}

export interface NotFoundError {
	type: "notFound";
	message: string;
	resource: string;
}

export interface ConflictError {
	type: "conflict";
	message: string;
	detail?: string;
}

export interface GenericError {
	type: "generic";
	status: number;
	message: string;
	error?: Error;
}
