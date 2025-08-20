// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export class FailToParse extends Error {
  constructor() {
    super("Fail to parse the content.");

    this.name = "FailToParse";
  }
}
