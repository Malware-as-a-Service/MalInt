// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Format } from ".";
import { Repository, ServerSideMalware, ServerSideServer, } from "../types";
import { FailToParse, Validation } from "../errors";
import { Result, safeTry, err, ok } from "neverthrow";
import { z, ZodType } from "zod";

export const extensions = new Set(["json"]);

export class Json implements Format {
	deserialize<Type>(schema: ZodType<Type>, content: string): Result<Type, FailToParse | Validation> {
		return safeTry(function* () {
			const parsedContent = yield* Result.fromThrowable(
				JSON.parse,
				(error): FailToParse => ({
					type: "failToParse",
					message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
					error: error instanceof Error ? error : new Error(String(error)),
				}),
			)(content);

			const result = schema.safeParse(parsedContent);

			if (!result.success) {
				return err({
					type: "validation",
					message: `Validation failed: "${result.error.message}"`,
					error: result.error,
				});
			}

			return ok(result.data);
		});
	}

	deserializeRepository(
		content: string,
	): Result<z.infer<typeof Repository>, FailToParse | Validation> {
		return this.deserialize(Repository, content);
	}

	deserializeServerSideServer(
		content: string,
	): Result<z.infer<typeof ServerSideServer>, FailToParse | Validation> {
		return this.deserialize(ServerSideServer, content);
	};

	deserializeServerSideMalware(
		content: string,
	): Result<z.infer<typeof ServerSideMalware>, FailToParse | Validation> {
		return this.deserialize(ServerSideMalware, content);
	}
}
