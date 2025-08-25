// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { GetVariable } from "../forges/errors";

export type ValidateForge = ValidateVariable[];
export type ValidateVariable = GetVariable | InvalidVariable;

export interface InvalidVariable {
  type: "invalidVariable";
  message: string;
  value: string;
  expectedValue: string;
}