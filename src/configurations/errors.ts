// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export class FailToParse extends Error {
  constructor() {
    super(`Fail to parse the content.`);

    this.name = "FailToParse";
  }
}

export class MissingSection extends Error {
  constructor(section: string) {
    super(`Section "${section}" is missing.`);

    this.name = "SectionMissing";
  }
}

export class MissingKey extends Error {
  constructor(key: string) {
    super(`Key "${key}" is missing.`);

    this.name = "KeyMissing";
  }
}

export class WrongKeyType extends Error {
  constructor(key: string, expectedType: string, currentType: string) {
    super(
      `Key "${key}" is of the wrong type, expected ${expectedType} but found ${currentType}.`,
    );

    this.name = "WrongKeyType";
  }
}
