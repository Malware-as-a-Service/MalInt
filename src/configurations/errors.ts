// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ZodError } from "zod";

export type Deserialize = FailToParse | Validation;

export interface InvalidExtension {
	type: "invalidExtension";
	message: string;
	extension: string;
	validExtensions: string[];
}

export interface FailToParse {
	type: "failToParse";
	message: string;
	error: Error;
}

export interface Validation {
	type: "validation";
	message: string;
	errors: ZodError;
}
