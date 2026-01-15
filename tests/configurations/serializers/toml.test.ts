// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { ZodError } from "zod";
import { Toml } from "../../../src/configurations/serializers/toml";
import { schema, validValue } from "./samples";

const validToml = "number = 0";
const invalidToml = "number =";
const invalidTomlValue = 'number = "two"';
const serializer = new Toml();

describe("TOML serializer", () => {
	describe("deserialize", () => {
		test("Deserializes valid objects", () => {
			const result = serializer.deserialize(schema, validToml);

			expect(result.isOk()).toBe(true);
			expect(result._unsafeUnwrap()).toStrictEqual(validValue);
		});

		test("Rejects invalid syntax", () => {
			const result = serializer.deserialize(schema, invalidToml);

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr().type).toBe("failToParse");
		});

		test("Rejects invalid objects", () => {
			const result = serializer.deserialize(schema, invalidTomlValue);

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr()).toBeInstanceOf(ZodError);
		});
	});

	describe("serialize", () => {
		test("Serializes TOML content", () => {
			const serializedData = serializer.serialize(validValue);

			expect(serializedData).toContain(validToml);
		});
	});
});
