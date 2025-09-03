// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ZodError } from "zod";

export type Invoke = FunctionNotFound | ZodError;

export interface FunctionNotFound {
  type: "functionNotFound";
  message: string;
  name: string;
}
