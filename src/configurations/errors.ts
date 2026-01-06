// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { ZodError } from "zod";

/** Errors returned while deserializing configuration content. */
export type DeserializeError = FailToParseError | ZodError;

/** Returned when a configuration file extension is not supported. */
export interface InvalidExtensionError {
	type: "invalidExtension";
	message: string;
	extension: string;
	validExtensions: string[];
}

/** Returned when raw configuration content cannot be parsed. */
export interface FailToParseError {
	type: "failToParse";
	message: string;
	error: Error;
}
