// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Serializer } from ".";
import {
	RepositoryConfiguration,
	ServerSideMalwareConfiguration,
	ServerSideServerConfiguration,
} from "../types";
import type { DeserializeError, FailToParseError } from "../errors";
import { Result, safeTry, ok, err } from "neverthrow";
import { parse, stringify } from "smol-toml";
import type { z, ZodType } from "zod";

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
