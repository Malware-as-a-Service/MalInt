// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { err, ok, Result } from "neverthrow";
import { Handler, registry } from "./registry";
import { InvokeError } from "./errors";
import { Networking } from "./handlers/networking";
import { z, ZodError } from "zod";
// Necessary if we want the registry to be populated
import "./handlers/generators";
import "./handlers/networking";

export class Api {
	constructor() {
		let handler = registry.get("serverHostname") as Handler;

		registry.set("serverHostname", {
			parametersSchema: z.tuple([]),
			function: handler.function.bind(null, "localhost"),
		});
	}

	invoke(
		functionName: string,
		...args: string[]
	): Result<unknown, InvokeError> {
		let handler = registry.get(functionName);

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

		let handler = registry.get("serverHostname") as Handler;

		registry.set("serverHostname", {
			...handler,
			function: Networking.serverHostname.bind(null, data),
		});

		return ok();
	}
}
