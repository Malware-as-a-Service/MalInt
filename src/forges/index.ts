// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result } from "neverthrow";
import type { Repository } from "../repositories";
import type {
	DispatchWorkflowError,
	DownloadArtifactError,
	GetActiveRunError,
	GetContentError,
	GetRunStatusError,
	InvalidForgeKindError,
	SetSecretError,
	WriteContentError,
} from "./errors";
import { Forgejo } from "./forgejo";

/**
 * Supported forge providers.
 */
export enum ForgeKind {
	Forgejo = "forgejo",
}

/**
 * Workflow run status values.
 */
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

/**
 * Create a forge client instance for the given repository and provider.
 */
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

/**
 * Minimal forge client used by MalInt.
 */
export interface Forge {
	/**
	 * Create or update a secret in the forge.
	 */
	setSecret(name: string, value: string): Promise<Result<void, SetSecretError>>;
	/**
	 * Read a file from the repository.
	 */
	getContent(path: string): Promise<Result<string, GetContentError>>;
	/**
	 * Update a repository file and return the commit SHA.
	 */
	writeContent(
		path: string,
		message: string,
		content: string,
	): Promise<Result<string, WriteContentError>>;
	/**
	 * Dispatch a workflow and return the run identifier.
	 */
	dispatchWorkflow(
		workflow: string,
		branch: string,
		inputs?: Record<string, string>,
	): Promise<Result<number, DispatchWorkflowError>>;
	/**
	 * Get the status of a workflow run.
	 */
	getRunStatus(
		runIdentifier: number,
	): Promise<Result<RunStatus, GetRunStatusError>>;
	/**
	 * Return the active run identifier if any is queued or running.
	 */
	getActiveRun(
		workflow: string,
		branch: string,
	): Promise<Result<number | null, GetActiveRunError>>;
	/**
	 * Download an artifact from a workflow run.
	 */
	downloadArtifact(
		runIdentifier: number,
		name: string,
	): Promise<Result<Buffer, DownloadArtifactError>>;
}
