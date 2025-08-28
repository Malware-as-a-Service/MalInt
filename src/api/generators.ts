// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { ok, err, Result } from "neverthrow";
import { InvalidArgument } from "./errors";

export function randomPort(
	minimum: number,
	maximum: number,
): Result<number, InvalidArgument> {
	if (minimum < 1 || minimum > 65535) {
		return err({
			type: "invalidArgument",
			message: "Minimum port must be between 1 and 65535.",
			functionName: "randomPort",
			name: "minimum",
			expectedType: "number between 1 and 65535",
			value: minimum,
		});
	}

	if (maximum < 1 || maximum > 65535) {
		return err({
			type: "invalidArgument",
			message: "Maximum port must be between 1 and 65535.",
			functionName: "randomPort",
			name: "maximum",
			expectedType: "number between 1 and 65535",
			value: maximum,
		});
	}

	if (maximum < minimum) {
		return err({
			type: "invalidArgument",
			message: "Maximum port must be greater than or equal to minimum port.",
			functionName: "randomPort",
			name: "maximum",
			expectedType: "number greater than or equal to minimum",
			value: maximum,
		});
	}

	return ok(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
}

export function randomPath(
	minimumLength: number,
	maximumLength: number,
): Result<string, InvalidArgument> {
	if (minimumLength < 1) {
		return err({
			type: "invalidArgument",
			message: "Minimum path length must be greater than 0.",
			functionName: "randomPath",
			name: "minimumLength",
			expectedType: "number greater than 0",
			value: minimumLength,
		});
	}

	if (maximumLength < 1) {
		return err({
			type: "invalidArgument",
			message: "Maximum length must be greater than 0.",
			functionName: "randomPath",
			name: "maximumLength",
			expectedType: "number greater than 0",
			value: maximumLength,
		});
	}

	if (maximumLength < minimumLength) {
		return err({
			type: "invalidArgument",
			message:
				"Maximum length must be greater than or equal to minimum length.",
			functionName: "randomPath",
			name: "maximumLength",
			expectedType: "number greater than or equal to minimumLength",
			value: maximumLength,
		});
	}

	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const length =
		Math.floor(Math.random() * (maximumLength - minimumLength + 1)) +
		minimumLength;

	let path = "";

	for (let _ = 0; _ < length; _++) {
		path += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return ok(path);
}
