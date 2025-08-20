// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: GPL-3.0-or-later

export type Repository = {
  baseAddress: string;
  ownerUsername: string;
  name: string;
  configurationPath: string;
  token?: string;
};
