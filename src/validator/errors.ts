// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { GetContentError, GetVariableError } from "../forges/errors";

export type ValidateForgeError = ValidateVariableError[];
export type ValidateVariableError = GetVariableError | InvalidVariableError;
export type ValidateMalwareError = GetContentError;

export interface InvalidVariableError {
	type: "invalidVariable";
	message: string;
	value: string;
	expectedValue: string;
}
