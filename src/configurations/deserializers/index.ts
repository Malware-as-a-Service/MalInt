// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result } from "neverthrow";
import type { Repository, ServerSideMalware, ServerSideServer } from "../types";
import type { DeserializeError, InvalidExtensionError } from "../errors";
import { Toml, extensions as tomlExtensions } from "./toml";
import { Json, extensions as jsonExtensions } from "./json";
import type { z } from "zod";
import pathModule from "node:path";

const validExtensions = Array.from(
	new Set([...jsonExtensions, ...tomlExtensions]),
);

export function getDeserializer(
	path: string,
): Result<Deserializer, InvalidExtensionError> {
	const extension = pathModule.extname(path).slice(1);

	if (jsonExtensions.has(extension)) {
		return ok(new Json());
	}

	if (tomlExtensions.has(extension)) {
		return ok(new Toml());
	}

	return err({
		type: "invalidExtension",
		message: `Invalid file extension "${extension}". Valid extensions are: ${validExtensions.join(", ")}`,
		extension,
		validExtensions: validExtensions,
	});
}

export interface Deserializer {
	deserializeRepository(
		content: string,
	): Result<z.infer<typeof Repository>, DeserializeError>;
	deserializeServerSideServer(
		content: string,
	): Result<z.infer<typeof ServerSideServer>, DeserializeError>;
	deserializeServerSideMalware(
		content: string,
	): Result<z.infer<typeof ServerSideMalware>, DeserializeError>;
}
