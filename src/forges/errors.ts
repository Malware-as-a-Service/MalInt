// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ForgeKind } from ".";

export class InvalidForge extends Error {
	constructor(kind: ForgeKind) {
		super(
			`Invalid forge "${kind}". Valid forges are: ${Object.keys(ForgeKind).join(", ")}`,
		);

		this.name = "InvalidForge";
	}
}

export class VariableNotFound extends Error {
	constructor(name: string) {
		super(`Variable "${name}" not found.`);

		this.name = "VariableNotFound";
	}
}

export class FileNotFound extends Error {
	constructor(path: string) {
		super(`File "${path}" not found.`);

		this.name = "FileNotFound";
	}
}

export class NotAFile extends Error {
	constructor(path: string) {
		super(`File "${path}" is not a file.`);

		this.name = "NotAFile";
	}
}
