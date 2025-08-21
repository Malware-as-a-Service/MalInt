// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { extensions as tomlExtensions } from "./formats/toml";
import { extensions as jsonExtensions } from "./formats/json";

export class FailToParse extends Error {
	constructor(error: unknown) {
		super(`${error}`);

		this.name = "FailToParse";
	}
}

export class InvalidExtension extends Error {
	constructor(extension: string) {
		const validExentensions = [...jsonExtensions, ...tomlExtensions];

		super(
			`Invalid file extension "${extension}". Valid extensions are: ${validExentensions.join(", ")}`,
		);

		this.name = "InvalidExtension";
	}
}
