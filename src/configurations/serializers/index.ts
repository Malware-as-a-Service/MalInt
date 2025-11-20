// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import pathModule from "node:path";
import { err, ok, Result } from "neverthrow";
import type { z } from "zod";
import type {
	DeserializeError,
	InvalidExtensionError,
} from "../errors";
import { Json, extensions as jsonExtensions } from "./json";
import { Toml, extensions as tomlExtensions } from "./toml";

const validExtensions = Array.from(
	new Set([...jsonExtensions, ...tomlExtensions]),
);

export function getSerializer(
	path: string,
): Result<Serializer, InvalidExtensionError> {
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

export interface Serializer {
	deserialize<T>(
		schema: z.ZodType<T>,
		content: string,
	): Result<T, DeserializeError>;
	serialize(data: object): string;
}
