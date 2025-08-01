// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export type Repository = {
  forge: Forge;
  configurations: Configurations;
  server: Server;
  malware: Malware;
};

export type Forge = {
  buildingBranch: string;
  buildingBranchVariableName: string;
};

export type Configurations = {
  server: ServerConfigurations;
  client: ClientConfigurations;
};

export type ServerConfigurations = {
  serverConfigurationPath?: string;
  malwareConfigurationPath: string;
};

export type ClientConfigurations = {
  serverConfigurationPath?: string;
  serverUiPath?: string;
  malwareConfigurationPath: string;
  malwareUiPath: string;
};

export type Server = {
  containerfilePath: string;
};

export type Malware = {
  finalConfigurationPath: string;
};
