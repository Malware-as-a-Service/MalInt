// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Result } from "neverthrow";
import { FileNotFound, NotAFile, VariableNotFound } from "./errors";
import { Forgejo } from "./forgejo";
import { Repository } from "../repositories";

export enum ForgeKind {
  Forgejo,
}

export function getForge(repository: Repository, kind: ForgeKind): Forge {
  switch (kind) {
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
