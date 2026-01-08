// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";
import { Handler, registry } from "../../src/api/registry";

describe("Api registry", () => {
	beforeEach(() => {
		registry.clear();
	});

	test("Registers handler definitions", () => {
		const handler = Object.assign((value: string) => value.toUpperCase(), {
			parametersSchema: z.tuple([z.string()]),
		});
		Handler("uppercase")({ handler }, "handler");

		const definition = registry.get("uppercase");

		expect(definition?.parametersSchema).toBe(handler.parametersSchema);
		expect(definition?.function("value")).toBe("VALUE");
	});

	test("Overrides a handler when registering the same name", () => {
		const firstHandler = Object.assign(() => 1, {
			parametersSchema: z.tuple([]),
		});
		const secondHandler = Object.assign(() => 2, {
			parametersSchema: z.tuple([]),
		});
		Handler("constant")({ handler: firstHandler }, "handler");
		Handler("constant")({ handler: secondHandler }, "handler");

		const definition = registry.get("constant");

		expect(definition?.function()).toBe(2);
	});
});
