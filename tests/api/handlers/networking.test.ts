// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { Networking } from "../../../src/api/handlers/networking";

describe("Networking handlers", () => {
	describe("serverHostname", () => {
		test("Returns the provided hostname", () => {
			const result = Networking.serverHostname("example.com");
			expect(result).toBe("example.com");
		});

		test("Rejects invalid hostnames", () => {
			const schema = Networking.serverHostname.parametersSchema;
			expect(schema.safeParse(["invalid hostname"]).success).toBe(false);
		});
	});
});
