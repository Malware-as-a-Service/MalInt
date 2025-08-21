// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, Result } from "neverthrow";
import { Repository } from "../types";
import { FailToParse, InvalidExtension } from "../errors";
import { Toml, extensions as tomlExtensions } from "./toml";
import { Json, extensions as jsonExtensions } from "./json";
import { z, ZodError } from "zod";

export function getFormat(path: string): Result<Format, InvalidExtension> {
	const extension = path.split(".").pop() ?? "";

	if (jsonExtensions.has(extension)) {
		return ok(new Json());
	}

	if (tomlExtensions.has(extension)) {
		return ok(new Toml());
	}

	return err(new InvalidExtension(extension));
}

export interface Format {
	deserializeRepository(
		content: string,
	): Result<z.infer<typeof Repository>, FailToParse | ZodError>;
}
