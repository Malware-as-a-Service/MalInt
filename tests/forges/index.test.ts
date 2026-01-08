// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { ForgeKind, getForge } from "../../src/forges";
import { Repository } from "../../src/repositories";
import { Forgejo } from "../../src/forges/forgejo";

const repository: Repository = {
	baseAddress: "https://forgejo.example/",
	ownerUsername: "Malware-as-a-Service",
	name: "SayWare",
	buildingBranch: "main",
	configurationPath: "repository.toml",
	token: "token",
};

describe("getForge", () => {
	test("Returns the Forgejo forge", () => {
		const result = getForge(repository, ForgeKind.Forgejo);

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toBeInstanceOf(Forgejo);
	});

	test("Rejects unsuported forges", () => {
		const result = getForge(repository, "forge" as ForgeKind);

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr().type).toBe("invalidForgeKind");
	});
});
