// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Repository connection details for a forge instance.
 */
export type Repository = {
	/**
	 * Base URL of the forge instance.
	 */
	baseAddress: string;
	/**
	 * Repository owner or namespace.
	 */
	ownerUsername: string;
	/**
	 * Repository name.
	 */
	name: string;
	/**
	 * Branch used to build the container and malware.
	 */
	buildingBranch: string;
	/**
	 * Path to the repository configuration file.
	 */
	configurationPath: string;
	/**
	 * Access token for the forge API.
	 */
	token?: string;
};
