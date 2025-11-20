// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, Result, safeTry } from "neverthrow";
import { parse, stringify } from "smol-toml";
import type { ZodType } from "zod";
import type { DeserializeError, FailToParseError } from "../errors";
import type { Serializer } from ".";

export const extensions = new Set(["toml"]);

export class Toml implements Serializer {
	deserialize<Type>(
		schema: ZodType<Type>,
		content: string,
	): Result<Type, DeserializeError> {
		return safeTry(function* () {
			const parsedContent = yield* Result.fromThrowable(
				parse,
				(error): FailToParseError => ({
					type: "failToParse",
					message: `Failed to parse TOML: ${error instanceof Error ? error.message : String(error)}`,
					error: error instanceof Error ? error : new Error(String(error)),
				}),
			)(content);

			const result = schema.safeParse(parsedContent);

			if (!result.success) {
				return err(result.error);
			}

			return ok(result.data);
		});
	}

	serialize(data: object): string {
		return stringify(data);
	}
}
