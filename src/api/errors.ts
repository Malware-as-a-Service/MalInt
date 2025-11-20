// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { ZodError } from "zod";

export type InvokeError = FunctionNotFoundError | ZodError;

export interface FunctionNotFoundError {
	type: "functionNotFound";
	message: string;
	name: string;
}
