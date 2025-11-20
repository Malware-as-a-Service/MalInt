// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { z } from "zod";

export interface HandlerDefinition {
	parametersSchema: z.ZodTuple;
	function: (...args: z.infer<z.ZodTuple>) => unknown;
}

export const registry = new Map<string, HandlerDefinition>();

export function Handler(name: string) {
	return (target: object, propertyKey: string) => {
		const handler = (target as Record<string, HandlerDefinition>)[propertyKey];
		registry.set(name, {
			parametersSchema: handler.parametersSchema,
			function: handler.function,
		});
	};
}
