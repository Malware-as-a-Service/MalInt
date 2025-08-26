// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from "vitest";
import { Validation } from "../../../src/configurations/errors";
import { stringify } from "smol-toml";
import { Toml } from "../../../src/configurations/deserializers/toml";
import { invalidRepository, invalidServerSideMalware, invalidServerSideServer, repository, serverSideMalware, serverSideServer } from "../types";

const invalidToml = "[forge";

test("Return FailToParse error on invalid syntax", () => {
    const result = new Toml().deserializeRepository(invalidToml);
    expect(result.isErr()).toBe(true);

    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("failToParse");
});


test("Return Validation error on invalid repository object", () => {
    const result = new Toml().deserializeRepository(stringify(invalidRepository));
    expect(result.isErr()).toBe(true);

    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("validation");
    expect((error as Validation).errors).toBeDefined();
});

test("Deserialize repository configuration", () => {
    const result = new Toml().deserializeRepository(stringify(repository));

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toStrictEqual(repository);
});

test("Return Validation error on invalid server side server object", () => {
    const result = new Toml().deserializeServerSideServer(stringify(invalidServerSideServer));
    expect(result.isErr()).toBe(true);

    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("validation");
    expect((error as Validation).errors).toBeDefined();
});

test("Deserialize server side server configuration", () => {
    const result = new Toml().deserializeServerSideServer(stringify(serverSideServer));

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toStrictEqual(serverSideServer);
});


test("Return Validation error on invalid server side malware object", () => {
    const result = new Toml().deserializeServerSideMalware(stringify(invalidServerSideMalware));
    expect(result.isErr()).toBe(true);

    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("validation");
    expect((error as Validation).errors).toBeDefined();
});

test("Deserialize server side malware configuration", () => {
    const result = new Toml().deserializeServerSideMalware(stringify(serverSideMalware));

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toStrictEqual(serverSideMalware);
});