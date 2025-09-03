// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { ForgeKind } from ".";

export type GetVariableError = NotFoundError | UnexpectedError;
export type GetFileError = NotFoundError | UnexpectedError;
export type GetContentError = GetFileError;
export type WriteContentError =
	| GetFileError
	| NotFoundError
	| ConflictError
	| ValidationError
	| UnexpectedError;

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

export interface ValidationError {
	type: "validation";
	message: string;
	detail?: string;
}

export interface UnexpectedError {
	type: "unexpected";
	status: number;
	message: string;
	error: Error;
}
