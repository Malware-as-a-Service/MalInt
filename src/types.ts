// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Loaded configuration definitions grouped by category.
 */
export interface Configurations {
	serverSide: {
		server?: object;
		malware: object;
	};
	clientSide?: {
		server?: {
			schema: object;
			ui: object;
		};
		malware?: {
			schema: object;
			ui: object;
		};
	};
	outputs?: {
		instance?: {
			schema: object;
			ui: object;
		};
		victims?: {
			schema: object;
			ui: object;
		};
	};
}
