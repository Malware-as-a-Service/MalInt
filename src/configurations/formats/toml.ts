// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Format } from ".";
import { Repository } from "../types";
import { FailToParse } from "../errors";
import { Result, safeTry, ok, err } from "neverthrow";
import { parse } from "smol-toml";
import { z, ZodError, safeParse } from "zod";

export class Toml implements Format {
	deserializeRepository(
		content: string,
	): Result<z.infer<typeof Repository>, FailToParse | ZodError> {
		return safeTry(function* () {
			const parsedContent = yield* Result.fromThrowable(
				parse,
				(error) => new FailToParse(error),
			)(content);

			const result = safeParse(Repository, parsedContent);

			if (!result.success) {
				return err(result.error);
			}

			return ok(result.data);
		});
	}
}
