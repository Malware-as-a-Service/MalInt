// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from "vitest";
import { getDeserializer } from "../../../src/configurations/deserializers";
import { Json } from "../../../src/configurations/deserializers/json";
import { Toml } from "../../../src/configurations/deserializers/toml";

test("Return InvalidExtension error for unsupported extension", () => {
	const result = getDeserializer("configuration.j");

	expect(result.isErr()).toBe(true);
	const error = result._unsafeUnwrapErr();
	expect(error.type).toBe("invalidExtension");
	expect(error.extension).toBe("j");
});

test("Return Json deserializer", () => {
	const result = getDeserializer("configuration.json");

	expect(result.isOk()).toBe(true);
	const deserializer = result._unsafeUnwrap();
	expect(deserializer).toBeInstanceOf(Json);
});

test("Return Toml deserializer", () => {
	const result = getDeserializer("configuration.toml");

	expect(result.isOk()).toBe(true);
	const deserializer = result._unsafeUnwrap();
	expect(deserializer).toBeInstanceOf(Toml);
});
