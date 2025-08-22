// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export class InvalidVariable extends Error {
  constructor(name: string) {
    super(
      `The value of the "${name}" variable is different from the value specified in the repository configuration file.`,
    );

    this.name = "InvalidVariable";
  }
}
