// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from "vitest";
import { ZodError } from "zod";
import { Json } from "../../../src/configurations/deserializers/json";
import {
	repository,
	invalidRepository,
	invalidServerSideServer,
	serverSideServer,
	invalidServerSideMalware,
	serverSideMalware,
} from "../types";

const invalidJson = "{ forge: [}";

test("Return FailToParse error on invalid syntax", () => {
	const result = new Json().deserializeRepository(invalidJson);
	expect(result.isErr()).toBe(true);

	const error = result._unsafeUnwrapErr();
	expect(error.type).toBe("failToParse");
});

test("Return Validation error on invalid repository object", () => {
	const result = new Json().deserializeRepository(
		JSON.stringify(invalidRepository),
	);
	expect(result.isErr()).toBe(true);

	const error = result._unsafeUnwrapErr();
	expect(error).toBeInstanceOf(ZodError);
});

test("Deserialize repository configuration", () => {
	const result = new Json().deserializeRepository(JSON.stringify(repository));

	expect(result.isOk()).toBe(true);
	expect(result._unsafeUnwrap()).toStrictEqual(repository);
});

test("Return Validation error on invalid server side server object", () => {
	const result = new Json().deserializeServerSideServer(
		JSON.stringify(invalidServerSideServer),
	);
	expect(result.isErr()).toBe(true);

	const error = result._unsafeUnwrapErr();
	expect(error).toBeInstanceOf(ZodError);
});

test("Deserialize server side server configuration", () => {
	const result = new Json().deserializeServerSideServer(
		JSON.stringify(serverSideServer),
	);

	expect(result.isOk()).toBe(true);
	expect(result._unsafeUnwrap()).toStrictEqual(serverSideServer);
});

test("Return Validation error on invalid server side malware object", () => {
	const result = new Json().deserializeServerSideMalware(
		JSON.stringify(invalidServerSideMalware),
	);
	expect(result.isErr()).toBe(true);

	const error = result._unsafeUnwrapErr();
	expect(error).toBeInstanceOf(ZodError);
});

test("Deserialize server side malware configuration", () => {
	const result = new Json().deserializeServerSideMalware(
		JSON.stringify(serverSideMalware),
	);

	expect(result.isOk()).toBe(true);
	expect(result._unsafeUnwrap()).toStrictEqual(serverSideMalware);
});
