// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Result } from "neverthrow";

export type Repository = {
  baseAddress: URL;
  ownerUsername: string;
  name: string;
};

export interface Forge {
  getVariable(name: string): Promise<Result<string, Error>>;
  getSecret(name: string): Promise<Result<string, Error>>;
  getContent(path: string): Promise<Result<string, Error>>;
  writeContent(
    path: string,
    message: string,
    content: string,
  ): Promise<Result<string, Error>>;
}
