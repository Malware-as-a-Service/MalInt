// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { JSONSchemaType } from "ajv";
import { UiSchema } from "./configurations/types";

export interface ClientSideConfigurations {
	server?: {
		schema: JSONSchemaType<unknown>;
		uiSchema: z.infer<typeof UiSchema>;
	};
	malware?: {
		schema: JSONSchemaType<unknown>;
		uiSchema: z.infer<typeof UiSchema>;
	};
}
