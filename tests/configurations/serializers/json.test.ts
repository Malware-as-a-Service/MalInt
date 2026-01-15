// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { ZodError } from "zod";
import { Json } from "../../../src/configurations/serializers/json";
import { schema, validValue } from "./samples";

const validJson = '{"number":0}';
const invalidJson = "{ number: 0";
const invalidJsonValue = '{"number":"two"}';
const serializer = new Json();

describe("JSON serializer", () => {
	describe("deserialize", () => {
		test("Deserializes valid objects", () => {
			const result = serializer.deserialize(schema, validJson);

			expect(result.isOk()).toBe(true);
			expect(result._unsafeUnwrap()).toStrictEqual(validValue);
		});

		test("Rejects invalid syntax", () => {
			const result = serializer.deserialize(schema, invalidJson);

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr().type).toBe("failToParse");
		});

		test("Rejects invalid objects", () => {
			const result = serializer.deserialize(schema, invalidJsonValue);

			expect(result.isErr()).toBe(true);
			expect(result._unsafeUnwrapErr()).toBeInstanceOf(ZodError);
		});
	});

	describe("serialize", () => {
		test("Serializes JSON content", () => {
			const serializedData = serializer.serialize(validValue);

			expect(serializedData).toBe(validJson);
		});
	});
});
