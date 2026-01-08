// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { getSerializer } from "../../../src/configurations/serializers";
import { Json } from "../../../src/configurations/serializers/json";
import { Toml } from "../../../src/configurations/serializers/toml";

describe("getSerializer", () => {
	test("Returns the JSON serializer for .json files", () => {
		const result = getSerializer("configuration.json");

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBeInstanceOf(Json);
	});

	test("Returns the TOML serializer for .toml files", () => {
		const result = getSerializer("configuration.toml");

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBeInstanceOf(Toml);
	});

	test("Rejects unsupported extensions", () => {
		const result = getSerializer("configuration.configuration");

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr()).toBe("invalidExtension");
	});
});
