// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Result } from "neverthrow";
import { Repository } from "../types";
import { FailToParse } from "../errors";
import { z, ZodError } from "zod";

export interface Format {
	deserializeRepository(
		content: string,
	): Result<z.infer<typeof Repository>, FailToParse | ZodError>;
}
