// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";

export const schema = z.object({ number: z.number() });
export const validValue = { number: 0 };
export const invalidValue = { number: "two" };
