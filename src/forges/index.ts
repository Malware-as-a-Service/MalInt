// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Result } from "neverthrow";
import { FileNotFound, NotAFile, VariableNotFound } from "./errors";
import { Forgejo } from "./forgejo";

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

export function getForge(repository: Repository): Forge {
  switch (repository.kind) {
    case ForgeKind.Forgejo:
      return new Forgejo(repository);
  }
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
