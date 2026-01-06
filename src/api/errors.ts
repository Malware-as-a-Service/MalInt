// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { ZodError } from "zod";

/** Errors returned when invoking an API handler. */
export type InvokeError = FunctionNotFoundError | ZodError;

/** Returned when a requested handler function is not registered. */
export interface FunctionNotFoundError {
	type: "functionNotFound";
	message: string;
	name: string;
}
