// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";

interface Handler {
  parametersSchema: z.ZodTuple;
  function: (...args: z.infer<z.ZodTuple>) => unknown;
}

export const registry = new Map<string, Handler>();

export function Function(name: string) {
  return function (target: any, propertyKey: string | symbol) {
    registry.set(name, {
      parametersSchema: target[propertyKey].parametersSchema,
      function: target[propertyKey],
    });
  };
}
