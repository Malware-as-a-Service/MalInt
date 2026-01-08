// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import {
	Handler,
	type HandlerDefinition,
	registry,
} from "../../src/api/registry";

export function restoreRegistry(
	snapshot: Map<string, HandlerDefinition>,
): void {
	registry.clear();

	for (const [key, value] of snapshot.entries()) {
		registry.set(key, value);
	}
}

export function registerHandler<TSchema extends z.ZodTuple>(
	name: string,
	handler: (...args: z.infer<TSchema>) => unknown,
	parametersSchema: TSchema,
): void {
	const definition = Object.assign(handler as (...args: unknown[]) => unknown, {
		parametersSchema,
	});
	Handler(name)({ handler: definition }, "handler");
}
