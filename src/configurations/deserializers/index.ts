// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, Result } from "neverthrow";
import { Repository, ServerSideMalware, ServerSideServer } from "../types";
import { Deserialize, InvalidExtension } from "../errors";
import { Toml, extensions as tomlExtensions } from "./toml";
import { Json, extensions as jsonExtensions } from "./json";
import { z } from "zod";
import pathModule from "path";

const validExtensions = Array.from(new Set([...jsonExtensions, ...tomlExtensions]));

export function getDeserializer(path: string): Result<Deserializer, InvalidExtension> {
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
	): Result<z.infer<typeof Repository>, Deserialize>;
	deserializeServerSideServer(
		content: string,
	): Result<z.infer<typeof ServerSideServer>, Deserialize>;
	deserializeServerSideMalware(
		content: string,
	): Result<z.infer<typeof ServerSideMalware>, Deserialize>;
}
