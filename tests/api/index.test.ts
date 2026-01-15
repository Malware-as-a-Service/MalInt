// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { z, ZodError } from "zod";
import { Api } from "../../src/api";
import { registerHandler, restoreRegistry } from "./registry";
import { HandlerDefinition, registry } from "../../src/api/registry";

let registrySnapshot: Map<string, HandlerDefinition>;

function withEmptyRegistry() {
	const serverHostnameDefinition = registry.get(
		"serverHostname",
	) as HandlerDefinition;

	registry.clear();
	// Keep the handler required by Api's constructor after clearing the registry.
	registerHandler(
		"serverHostname",
		serverHostnameDefinition.function,
		serverHostnameDefinition.parametersSchema,
	);
}

describe("API", () => {
	beforeEach(() => {
		registrySnapshot = new Map(registry);
	});

	afterEach(() => {
		restoreRegistry(registrySnapshot);
	});

	describe("constructor", () => {
		test("Overrides the serverHostname handler with a default value", () => {
			const api = new Api();
			const result = api.invoke("serverHostname");

			expect(result.isOk()).toBe(true);
			expect(result._unsafeUnwrap()).toBe("localhost");
		});
	});

	describe("invoke", () => {
		test("Invokes registered handlers with validated parameters", () => {
			withEmptyRegistry();
			registerHandler(
				"uppercase",
				(value: string) => value.toUpperCase(),
				z.tuple([z.string()]),
			);

			const api = new Api();
			const result = api.invoke("uppercase", "value");

			expect(result.isOk()).toBe(true);
			expect(result._unsafeUnwrap()).toBe("VALUE");
		});

		test("Rejects invalid parameter counts", () => {
			withEmptyRegistry();
			registerHandler(
				"singleParameter",
				(value: string) => value,
				z.tuple([z.string()]),
			);

			const api = new Api();
			const result = api.invoke("singleParameter", "value", "extra");

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr()).toBeInstanceOf(ZodError);
		});

		test("Rejects unknown handlers", () => {
			withEmptyRegistry();

			const api = new Api();
			const result = api.invoke("unknownFunction");

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr().type).toBe("functionNotFound");
		});

		test("Rejects invalid parameter values", () => {
			withEmptyRegistry();
			registerHandler(
				"positiveNumber",
				(value: number) => value,
				z.tuple([z.coerce.number().min(1)]),
			);

			const api = new Api();
			const result = api.invoke("positiveNumber", "0");

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr()).toBeInstanceOf(ZodError);
		});

		test("Rejects invalid parameter types", () => {
			withEmptyRegistry();
			registerHandler(
				"booleanOnly",
				(value: boolean) => value,
				z.tuple([z.boolean()]),
			);

			const api = new Api();
			const result = api.invoke("booleanOnly", "not-a-boolean");

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr()).toBeInstanceOf(ZodError);
		});
	});

	describe("setServerHostname", () => {
		test("Updates the hostname returned by the underlying handler", () => {
			const api = new Api();
			const setResult = api.setServerHostname("example.com");

			expect(setResult.isOk()).toBe(true);

			const invokeResult = api.invoke("serverHostname");

			expect(invokeResult.isOk()).toBe(true);
			expect(invokeResult._unsafeUnwrap()).toBe("example.com");
		});

		test("Rejects invalid hostnames", () => {
			const api = new Api();
			const result = api.setServerHostname("invalid hostname");

			expect(result.isErr()).toBe(true);
		});

		test("Keeps hostname values isolated per API instance", () => {
			const firstApi = new Api();
			const secondApi = new Api();

			const setResult = firstApi.setServerHostname("first.example.com");

			expect(setResult.isOk()).toBe(true);

			const firstResult = firstApi.invoke("serverHostname");
			const secondResult = secondApi.invoke("serverHostname");

			expect(firstResult.isOk()).toBe(true);
			expect(firstResult._unsafeUnwrap()).toBe("first.example.com");
			expect(secondResult.isOk()).toBe(true);
			expect(secondResult._unsafeUnwrap()).toBe("localhost");
		});
	});
});
