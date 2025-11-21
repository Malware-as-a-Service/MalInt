// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { Handler } from "../registry";

// biome-ignore lint/complexity/noStaticOnlyClass: Class is used as a container for decorated handler methods
export class Generators {
	@Handler("randomPort")
	static randomPort = Object.assign(
		(minimumPort: number, maximumPort: number) => {
			return (
				Math.floor(Math.random() * (maximumPort - minimumPort + 1)) +
				minimumPort
			);
		},
		{
			parametersSchema: z
				.tuple([
					z.coerce
						.number()
						.gte(1, "Minimum port must be between 1 and 65535.")
						.lte(65535, "Minimum port must be between 1 and 65535."),
					z.coerce
						.number()
						.gte(1, "Maximum port must be between and 65535.")
						.lte(65535, "Minimum port must be between 1 and 65535."),
				])
				.refine(
					([minimumPort, maximumPort]) => maximumPort >= minimumPort,
					"Maximum port must be greater or equal to the minimum port.",
				),
		},
	);

	@Handler("randomPathPrefix")
	static randomPathPrefix = Object.assign(
		(minimumLength: number, maximumLength: number) => {
			const characters =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			const length =
				Math.floor(Math.random() * (maximumLength - minimumLength + 1)) +
				minimumLength;

			let path = "";

			for (let _ = 0; _ < length; _++) {
				path += characters.charAt(
					Math.floor(Math.random() * characters.length),
				);
			}

			return path;
		},
		{
			parametersSchema: z
				.tuple([
					z.coerce
						.number()
						.nonnegative("Minimum path length should be greater than 0."),
					z.coerce
						.number()
						.nonnegative("Maximum path length should be greater than 0."),
				])
				.refine(
					([minimumLength, maximumLength]) => maximumLength >= minimumLength,
					"Maximum path length must be greater or equal to the minimum path length.",
				),
		},
	);
}
