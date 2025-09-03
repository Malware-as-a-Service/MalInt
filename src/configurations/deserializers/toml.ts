// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Deserializer } from ".";
import { Repository, ServerSideMalware, ServerSideServer } from "../types";
import type { DeserializeError, FailToParseError } from "../errors";
import { Result, safeTry, ok, err } from "neverthrow";
import { parse } from "smol-toml";
import type { z, ZodType } from "zod";

export const extensions = new Set(["toml"]);

export class Toml implements Deserializer {
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

	deserializeRepository(
		content: string,
	): Result<z.infer<typeof Repository>, DeserializeError> {
		return this.deserialize(Repository, content);
	}

	deserializeServerSideServer(
		content: string,
	): Result<z.infer<typeof ServerSideServer>, DeserializeError> {
		return this.deserialize(ServerSideServer, content);
	}

	deserializeServerSideMalware(
		content: string,
	): Result<z.infer<typeof ServerSideMalware>, DeserializeError> {
		return this.deserialize(ServerSideMalware, content);
	}
}
