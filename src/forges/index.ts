// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ResultAsync } from "neverthrow";

export type Repository = {
  baseAddress: URL;
  ownerUsername: string;
  name: string;
};

export interface Forge {
  new(repository: Repository, token?: string): Forge;
  getVariable(name: string): ResultAsync<string, Error>;
  getSecret(name: string): ResultAsync<string, Error>;
  getContent(path: string): ResultAsync<string, Error>;
  writeContent(
    path: string,
    message: string,
    content: string,
  ): ResultAsync<string, Error>;
}
