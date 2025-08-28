// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Result } from "neverthrow";

export type OkType<T> = T extends Result<infer U, unknown> ? U : never;
export type ErrorType<T> = T extends Result<unknown, infer U> ? U : never;
export type Invoke<T> = (
	| FunctionNotFound
	| WrongNumberOfArguments
	| InvalidArgumentType
	| ErrorType<T>
)[];

export interface FunctionNotFound {
	type: "functionNotFound";
	message: string;
	name: string;
}

export interface WrongNumberOfArguments {
	type: "wrongNumberOfArguments";
	message: string;
	functionName: string;
	provided: number;
	expected: number;
}

export interface InvalidArgumentType {
	type: "invalidArgumentType";
	message: string;
	functionName: string;
	expected: string;
}

export interface InvalidArgument {
	type: "invalidArgument";
	message: string;
	functionName: string;
	name: string;
	expectedType: string;
	value: unknown;
}
