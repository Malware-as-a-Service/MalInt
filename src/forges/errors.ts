// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

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
