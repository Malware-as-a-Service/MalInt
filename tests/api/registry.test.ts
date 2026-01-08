// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";
import { type HandlerDefinition, registry } from "../../src/api/registry";
import { registerHandler, restoreRegistry } from "./registry";

let registrySnapshot: Map<string, HandlerDefinition>;

describe("API registry", () => {
	beforeEach(() => {
		registrySnapshot = new Map(registry);
		registry.clear();
	});

	afterEach(() => {
		restoreRegistry(registrySnapshot);
	});

	test("Registers handler definitions", () => {
		registerHandler(
			"uppercase",
			(value: string) => value.toUpperCase(),
			z.tuple([z.string()]),
		);

		const definition = registry.get("uppercase");

		expect(definition?.parametersSchema).toBeDefined();
		expect(definition?.function("value")).toBe("VALUE");
	});

	test("Overrides a handler when registering the same name", () => {
		registerHandler("constant", () => 1, z.tuple([]));
		registerHandler("constant", () => 2, z.tuple([]));

		const definition = registry.get("constant");

		expect(definition?.function()).toBe(2);
	});
});
