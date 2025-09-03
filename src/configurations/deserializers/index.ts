// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, safeTry, Result } from "neverthrow";
import {
	UiSchema,
	type RepositoryConfiguration,
	type ServerSideMalwareConfiguration,
	type ServerSideServerConfiguration,
} from "../types";
import type {
	DeserializeError,
	DeserializeJsonSchemaError,
	FailToParseError,
	InvalidExtensionError,
} from "../errors";
import { Toml, extensions as tomlExtensions } from "./toml";
import { Json, extensions as jsonExtensions } from "./json";
import type { z } from "zod";
import { JSONSchemaType } from "ajv";
import Ajv from "ajv/dist/2020";
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

export function deserializeJsonSchema(
	content: string,
): Result<JSONSchemaType<unknown>, DeserializeJsonSchemaError> {
	return safeTry(function* () {
		const parsedContent = yield* Result.fromThrowable(
			JSON.parse,
			(error): FailToParseError => ({
				type: "failToParse",
				message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
				error: error instanceof Error ? error : new Error(String(error)),
			}),
		)(content);

		const { errors } = new Ajv().compile(parsedContent);

		if (errors) {
			return err(errors);
		}

		return ok(parsedContent);
	});
}

export function deserializeUiSchema(
	content: string,
): Result<z.infer<typeof UiSchema>, DeserializeError> {
	return safeTry(function* () {
		const parsedContent = yield* Result.fromThrowable(
			JSON.parse,
			(error): FailToParseError => ({
				type: "failToParse",
				message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
				error: error instanceof Error ? error : new Error(String(error)),
			}),
		)(content);

		const result = UiSchema.safeParse(parsedContent);

		if (!result.success) {
			return err(result.error);
		}

		return ok(result.data);
	});
}

export interface Deserializer {
	deserializeRepository(
		content: string,
	): Result<z.infer<typeof RepositoryConfiguration>, DeserializeError>;
	deserializeServerSideServer(
		content: string,
	): Result<z.infer<typeof ServerSideServerConfiguration>, DeserializeError>;
	deserializeServerSideMalware(
		content: string,
	): Result<z.infer<typeof ServerSideMalwareConfiguration>, DeserializeError>;
}
