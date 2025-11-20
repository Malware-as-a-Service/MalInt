// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, type Result } from "neverthrow";
import { type ZodError, z } from "zod";
import type { InvokeError } from "./errors";
import { Networking } from "./handlers/networking";
import { HandlerDefinition, registry } from "./registry";
// Necessary if we want the registry to be populated
import "./handlers/generators";
import "./handlers/networking";

export class Api {
	constructor() {
		const handler = registry.get("serverHostname");

		if (handler) {
			registry.set("serverHostname", {
				parametersSchema: z.tuple([]),
				function: handler.function.bind(null, "localhost"),
			});
		}
	}

	invoke(
		functionName: string,
		...args: string[]
	): Result<unknown, InvokeError> {
		const handler = registry.get(functionName);

		if (handler === undefined) {
			return err({
				type: "functionNotFound",
				message: `Function "${functionName}" not found.`,
				name: functionName,
			});
		}

		const { data, error } = handler.parametersSchema.safeParse(args);

		if (error) {
			return err(error);
		}

		return ok(handler.function.apply(this, data));
	}

	setServerHostname(hostname: string): Result<void, ZodError> {
		const { data, error } = z.hostname().safeParse(hostname);

		if (error) {
			return err(error);
		}

		const handler = registry.get("serverHostname") as HandlerDefinition;

		registry.set("serverHostname", {
			...handler,
			function: Networking.serverHostname.bind(null, data),
		});

		return ok();
	}
}
