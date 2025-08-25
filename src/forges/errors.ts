// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ForgeKind } from ".";

export type GetVariable = NotFound | Unexpected;
export type GetFile = NotFound | Unexpected;
export type GetContent = GetFile;
export type WriteContent = GetFile | NotFound | Conflict | Validation | Unexpected;

export interface InvalidForgeKind {
	type: "invalidForgeKind";
	message: string;
	kind: ForgeKind;
	validKinds: ForgeKind[];
}

export interface NotFound {
	type: "notFound";
	message: string;
	resource: string;
}

export interface Conflict {
	type: "conflict";
	message: string;
	detail?: string;
}

export interface Validation {
	type: "validation";
	message: string;
	detail?: string;
}

export interface Unexpected {
	type: "unexpected";
	status: number;
	message: string;
	error: Error;
}