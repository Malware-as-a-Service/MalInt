// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result } from "neverthrow";
import type {
	DispatchWorkflowError,
	GetActiveRunError,
	GetContentError,
	GetRunStatusError,
	InvalidForgeKindError,
	SetSecretError,
	SetVariableError,
	WriteContentError,
} from "./errors";
import { Forgejo } from "./forgejo";
import type { Repository } from "../repositories";

export enum ForgeKind {
	Forgejo = "forgejo",
}

export enum RunStatus {
	Unknown = "unknown",
	Waiting = "waiting",
	Running = "running",
	Success = "success",
	Failure = "failure",
	Cancelled = "cancelled",
	Skipped = "skipped",
	Blocked = "blocked",
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
	setVariable(
		name: string,
		value: string,
	): Promise<Result<void, SetVariableError>>;
	setSecret(name: string, value: string): Promise<Result<void, SetSecretError>>;
	getContent(path: string): Promise<Result<string, GetContentError>>;
	writeContent(
		path: string,
		message: string,
		content: string,
	): Promise<Result<string, WriteContentError>>;
	dispatchWorkflow(
		workflowName: string,
		branch: string,
		inputs?: Record<string, string>,
	): Promise<Result<number, DispatchWorkflowError>>;
	getRunStatus(
		runIdentifier: number,
	): Promise<Result<RunStatus, GetRunStatusError>>;
	getActiveRun(
		workflowName: string,
		branch: string,
	): Promise<Result<number | null, GetActiveRunError>>;
}
