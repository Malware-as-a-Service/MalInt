// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export const repository = {
    forge: {
        buildingBranchVariableName: "BUILDING_BRANCH",
        configurationPathVariableName: "CONFIGURATION_PATH"
    },
    server: {
        containerfilePath: "Containerfile"
    },
    malware: {
        configurationPath: "malware.toml"
    },
    configurations: {
        serverSide: {
            serverPath: "configurations/server/server.toml",
            malwarePath: "configurations/server/malware.toml"
        },
        clientSide: {
            serverPath: "configurations/client/server.schema.json",
            serverUiPath: "configurations/client/server-ui.schema.json",
            malwarePath: "configurations/client/malware.schema.json",
            malwareUiPath: "configurations/client.malware-ui.schema.json"
        }
    }
};
export const invalidRepository = {
    forge: {
        buildingBranchVariableName: "FORGEJO_INVALID",
        configurationPathVariableName: "CONFIGURATION_PATH"
    },
    server: {
        containerfilePath: "Containerfile"
    },
    malware: {
        configurationPath: "malware.toml"
    },
    configurations: {
        serverSide: {
            malwarePath: "configurations/server/malware.toml"
        },
        clientSide: {
            serverPath: "configurations/client/server.schema.json"
        }
    }
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
        function: "@randomPath()",
    }
};
export const invalidServerSideMalware = {
    port: {
        from: 0,
    },
    urlPrefix: {
        function: "invalidFunction",
    },
};