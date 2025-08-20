// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export class FailToParse extends Error {
  constructor(error: unknown) {
    super(`${error}`);

    this.name = "FailToParse";
  }
}
