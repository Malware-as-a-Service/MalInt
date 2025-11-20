// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { Handler } from "../registry";

// biome-ignore lint/complexity/noStaticOnlyClass: Class is used as a container for decorated handler methods
export class Networking {
	@Handler("serverHostname")
	static serverHostname = Object.assign(
		(hostname: string) => {
			return hostname;
		},
		{
			parametersSchema: z.tuple([z.hostname()]),
		},
	);
}
