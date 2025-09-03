// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result } from "neverthrow";
import type {
	GetContentError,
	GetVariableError,
	InvalidForgeKindError,
	WriteContentError,
} from "./errors";
import { Forgejo } from "./forgejo";
import type { Repository } from "../repositories";

export enum ForgeKind {
	Forgejo = "forgejo",
}

const validKinds = Object.values(ForgeKind);

export function getForge(
	repository: Repository,
	kind: ForgeKind,
): Result<Forge, InvalidForgeKindError> {
	switch (kind) {
		case ForgeKind.Forgejo:
			return ok(new Forgejo(repository));
		default:
			return err({
				type: "invalidForgeKind",
				message: `Invalid forge "${kind}". Valid forges are: ${validKinds.join(", ")}`,
				kind,
				validKinds,
			});
	}
}

export interface Forge {
	getVariable(name: string): Promise<Result<string, GetVariableError>>;
	getContent(path: string): Promise<Result<string, GetContentError>>;
	writeContent(
		path: string,
		message: string,
		content: string,
	): Promise<Result<string, WriteContentError>>;
}
