// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { Function } from "../registry";

export class Networking {
	@Function("serverHostname")
	static serverHostname = Object.assign(
		(hostname: string) => {
			return hostname;
		},
		{
			parametersSchema: z.tuple([z.hostname()]),
		},
	);
}
