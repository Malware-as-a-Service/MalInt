// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { Generators } from "../../../src/api/handlers/generators";

describe("Generator handlers", () => {
	describe("randomPort", () => {
		test("Returns a number within range", () => {
			const result = Generators.randomPort(10, 10);

			expect(result).toBe(10);
		});

		test("Rejects a minimum out of range", () => {
			const schema = Generators.randomPort.parametersSchema;

			expect(schema.safeParse([0, 10]).success).toBe(false);
			expect(schema.safeParse([65536, 65537]).success).toBe(false);
		});

		test("Rejects a maximum out of range", () => {
			const schema = Generators.randomPort.parametersSchema;

			expect(schema.safeParse([1, 0]).success).toBe(false);
			expect(schema.safeParse([1, 65536]).success).toBe(false);
		});

		test("Rejects inverted ranges", () => {
			const schema = Generators.randomPort.parametersSchema;

			expect(schema.safeParse([10, 1]).success).toBe(false);
		});
	});

	describe("randomPathPrefix", () => {
		test("Returns the expected length", () => {
			const result = Generators.randomPathPrefix(5, 5);

			expect(result.length).toBe(5);
		});

		test("Rejects a negative minimum", () => {
			const schema = Generators.randomPathPrefix.parametersSchema;

			expect(schema.safeParse([-1, 5]).success).toBe(false);
		});

		test("Rejects a negative maximum", () => {
			const schema = Generators.randomPathPrefix.parametersSchema;

			expect(schema.safeParse([1, -5]).success).toBe(false);
		});

		test("Rejects inverted ranges", () => {
			const schema = Generators.randomPathPrefix.parametersSchema;

			expect(schema.safeParse([10, 1]).success).toBe(false);
		});
	});
});
