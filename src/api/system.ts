// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Result, ok } from "neverthrow";

export function serverHostname(hostname: string): Result<string, never> {
	return ok(hostname);
}
