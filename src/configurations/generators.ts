// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result, safeTry } from "neverthrow";
import { FunctionLeaf, ServerLeaf, VariableLeaf } from "./types";
import type { GenerateConfigurationError } from "../errors";

export function generateConfiguration(
	configuration: object,
	allowVariableReferences: boolean,
	handlers: {
		executeFunction: (
			functionString: string,
		) => Result<unknown, GenerateConfigurationError>;
		resolveVariable: (
			variablePath: string,
		) => Result<unknown, GenerateConfigurationError>;
	},
): Result<object, GenerateConfigurationError> {
	return safeTry(function* () {
		const stack: Array<{
			source: object;
			target: Record<string, unknown>;
			path: string[];
		}> = [];
		const generatedConfiguration: Record<string, unknown> = {};

		stack.push({
			source: configuration,
			target: generatedConfiguration,
			path: [],
		});

		while (true) {
			const item = stack.pop();

			if (!item) {
				break;
			}

			const { source, target, path } = item;

			for (const [key, value] of Object.entries(source)) {
				const nextPath = [...path, key];

				if (!allowVariableReferences) {
					const serverResult = ServerLeaf.safeParse(value);

					if (serverResult.success) {
						target[key] = yield* handlers.executeFunction(
							serverResult.data.function,
						);
						continue;
					}

					const functionLeafResult = FunctionLeaf.safeParse(value);
					const variableLeafResult = VariableLeaf.safeParse(value);

					if (functionLeafResult.success || variableLeafResult.success) {
						return err({
							type: "invalidConfigurationValue",
							message:
								"Server configuration values must use { function, type } leaves.",
							path: nextPath,
							valueType: "object",
						});
					}
				} else {
					const functionResult = FunctionLeaf.safeParse(value);

					if (functionResult.success) {
						target[key] = yield* handlers.executeFunction(
							functionResult.data.function,
						);
						continue;
					}

					const variableResult = VariableLeaf.safeParse(value);

					if (variableResult.success) {
						target[key] = yield* handlers.resolveVariable(
							variableResult.data.from,
						);
						continue;
					}
				}

				const isObject =
					value !== null && typeof value === "object" && !Array.isArray(value);

				if (!isObject) {
					const valueType = value === null ? "null" : typeof value;

					return err({
						type: "invalidConfigurationValue",
						message:
							"Configuration values must be objects or valid leaf definitions.",
						path: nextPath,
						valueType,
					});
				}

				const nestedTarget: Record<string, unknown> = {};
				target[key] = nestedTarget;
				stack.push({
					source: value as object,
					target: nestedTarget,
					path: nextPath,
				});
			}
		}

		return ok(generatedConfiguration);
	});
}
