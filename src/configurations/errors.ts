// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export class FailToParse extends Error {
	constructor(error: unknown) {
		super(`${error}`);

		this.name = "FailToParse";
	}
}

export class InvalidExtension extends Error {
	constructor(extension: string, validExentensions: Set<string>) {
		super(
			`Invalid file extension "${extension}". Valid extensions are: ${[...validExentensions].join(", ")}`,
		);

		this.name = "InvalidExtension";
	}
}
