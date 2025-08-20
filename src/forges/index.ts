// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Result } from "neverthrow";
import { FileNotFound, NotAFile, VariableNotFound } from "./errors";

export type Repository = {
  baseAddress: string;
  ownerUsername: string;
  name: string;
  kind: ForgeKind;
  token?: string;
};

export enum ForgeKind {
  Forgejo,
}

export interface Forge {
  getVariable(name: string): Promise<Result<string, VariableNotFound | Error>>;
  getContent(
    path: string,
  ): Promise<Result<string, FileNotFound | NotAFile | Error>>;
  writeContent(
    path: string,
    branch: string,
    message: string,
    content: string,
  ): Promise<Result<void, FileNotFound | NotAFile | Error>>;
}
