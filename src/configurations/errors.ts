// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ErrorObject } from "ajv";
import type { ZodError } from "zod";

export type DeserializeError = FailToParseError | ZodError;
export type DeserializeJsonSchemaError = FailToParseError | ErrorObject[];

export interface InvalidExtensionError {
	type: "invalidExtension";
	message: string;
	extension: string;
	validExtensions: string[];
}

export interface FailToParseError {
	type: "failToParse";
	message: string;
	error: Error;
}
