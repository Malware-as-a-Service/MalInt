// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import pathModule from "node:path";
import type { JSONSchemaType } from "ajv";
import Ajv from "ajv/dist/2020";
import { err, ok, Result, safeTry } from "neverthrow";
import type { z } from "zod";
import type {
	DeserializeError,
	DeserializeJsonSchemaError,
	FailToParseError,
	InvalidExtensionError,
} from "../errors";
import { UiSchema } from "../types";
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

export interface Serializer {
	deserialize<T>(
		schema: z.ZodType<T>,
		content: string,
	): Result<T, DeserializeError>;
	serialize(data: object): string;
}
