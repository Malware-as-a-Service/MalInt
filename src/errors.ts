// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import {
	DeserializeError,
	InvalidExtensionError,
} from "./configurations/errors";
import { GetContentError, InvalidForgeKindError } from "./forges/errors";

export type MalIntError =
	| InvalidForgeKindError
	| InvalidExtensionError
	| GetContentError
	| DeserializeError;
