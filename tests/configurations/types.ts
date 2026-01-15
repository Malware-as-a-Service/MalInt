// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export const repository = {
	forge: {
		secrets: {
			registryUrl: "REGISTRY_URL",
			registryUsername: "REGISTRY_USERNAME",
			registryPassword: "REGISTRY_PASSWORD",
		},
	},
	server: {
		workflow: "server.yml",
		containerfilePath: {
			name: "CONTAINERFILE_PATH",
			value: "Containerfile",
		},
		containerName: {
			name: "CONTAINER_NAME",
			value: "malint-server",
		},
		containerVersion: {
			name: "CONTAINER_VERSION",
			value: "1.0.0",
		},
	},
	malware: {
		configurationPath: "malware.toml",
		workflow: "malware.yml",
		artifactName: {
			name: "ARTIFACT_NAME",
			value: "malware",
		},
		commitShaName: "commit_sha",
	},
	configurations: {
		serverSide: {
			server: "configurations/server/server.toml",
			malware: "configurations/server/malware.toml",
		},
		clientSide: {
			server: {
				schema: "configurations/client/server.schema.json",
				ui: "configurations/client/server-ui.schema.json",
			},
			malware: {
				schema: "configurations/client/malware.schema.json",
				ui: "configurations/client/malware-ui.schema.json",
			},
		},
		states: {
			instance: {
				schema: "configurations/states/instance.schema.json",
				ui: "configurations/states/instance-ui.schema.json",
			},
			victims: {
				schema: "configurations/states/victims.schema.json",
				ui: "configurations/states/victims-ui.schema.json",
			},
		},
	},
};
export const invalidRepository = {
	forge: {
		secrets: {
			registryUrl: "FORGEJO_INVALID",
			registryUsername: "REGISTRY_USERNAME",
			registryPassword: "REGISTRY_PASSWORD",
		},
	},
	server: {
		workflow: "server.yml",
		containerfilePath: {
			name: "CONTAINERFILE_PATH",
			value: "Containerfile",
		},
		containerName: {
			name: "CONTAINER_NAME",
			value: "malint-server",
		},
		containerVersion: {
			name: "CONTAINER_VERSION",
			value: "1.0.0",
		},
	},
	malware: {
		configurationPath: "malware.toml",
		workflow: "malware.yml",
		artifactName: {
			name: "ARTIFACT_NAME",
			value: "malware",
		},
		commitShaName: "commit_sha",
	},
	configurations: {
		serverSide: {
			malware: "configurations/server/malware.toml",
		},
		clientSide: {
			server: {
				schema: "configurations/client/server.schema.json",
				ui: "configurations/client/server-ui.schema.json",
			},
		},
	},
};

export const serverSideServer = {
	port: {
		function: "@randomPort()",
		type: "plaintext",
	},
	secret: {
		function: "@generateSecret()",
		type: "secret",
	},
};
export const invalidServerSideServer = {
	port: {
		function: "noPrefix()",
		type: "invalid",
	},
};

export const serverSideMalware = {
	port: {
		from: "port",
	},
	urlPrefix: {
		function: "@randomPathPrefix()",
	},
};
export const invalidServerSideMalware = {
	port: {
		from: 0,
	},
	urlPrefix: {
		function: "invalidFunction",
	},
};
