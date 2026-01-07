<!--
SPDX-FileCopyrightText: 2025 The MalInt development team

SPDX-License-Identifier: GPL-3.0-or-later
-->

<div align="center">
  <a href="https://github.com/Malware-as-a-Service/MalInt/">
      <!-- markdownlint-disable-next-line line-length -->
    <img src="./assets/images/logo.svg" alt="Logo"/>
  </a>

<h3 align="center">MalInt</h3>

<p align="center">
    A library to integrate a repository for the MaaS platform
    <br />
    <a href="https://github.com/Malware-as-a-Service/MalInt/issues/">
      Report Bug
    </a>
    ·
    <a href="https://github.com/Malware-as-a-Service/MalInt/issues/">
      Request Feature
    </a>
    <br />
    <br />
    <a href="https://github.com/">
      <!-- markdownlint-disable-next-line line-length -->
      <img src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=fff&style=for-the-badge" alt="Github badge" />
    </a>
    <a href="./LICENSES/GPL-3.0-or-later.txt">
      <!-- markdownlint-disable-next-line line-length -->
      <img src="https://img.shields.io/badge/License-GPL%203.0%20or%20later-green.svg?style=for-the-badge" alt="GPL 3.0 or later badge" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <!-- markdownlint-disable-next-line line-length -->
      <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=for-the-badge" alt="Typescript badge" />
    </a>
    <a href="https://reuse.software/">
      <!-- markdownlint-disable-next-line line-length -->
      <img src="https://img.shields.io/reuse/compliance/github.com/Malware-as-a-Service/MalInt?style=for-the-badge" alt="Reuse badge" />
    </a>
  </p>
</div>

## 📋 Table of content

- [📋 Table of content](#-table-of-content)
- [⚠️ Disclaimer](#%EF%B8%8F-disclaimer)
- [👀 About the project](#-about-the-project)
  - [❓ Why](#-why)
- [🚀 Getting started](#-getting-started)
  - [⚙️ Prerequisites](#%EF%B8%8F-prerequisites)
  - [📦 Installation](#-installation)
  - [🥷 Quick examples](#-quick-examples)
- [👷 Contributing](#-contributing)
- [📚 Licenses](#-licenses)

## ⚠️ Disclaimer

This TypeScript library integrates a repository with the
[MaaS platform][platform]. It does not validate that a repository is safe,
correct, or buildable. You are responsible for reviewing your configuration and
build outputs. **I am not a TypeScript developer and did my best, so there is room
for improvement.**

## 👀 About the project

[MalInt] is a TypeScript library that connects a [MaaS] repository to
an automation forge like [Forgejo]. It reads repository configuration files,
loads client and output schemas, generates server and malware configurations,
and dispatches build workflows. It also provides helpers to download build
artifacts and to classify server variables as secrets or plaintext.

### ❓ Why

Integration logic is easy to duplicate and hard to keep consistent across
projects. MalInt centralizes that logic so you can:

- Reuse a single integration API across repositories
- Keep configuration parsing and generation consistent
- Standardize error handling and workflow interaction

## 🚀 Getting started

If you want to integrate a repository with the platform, follow the steps
below.

### ⚙️ Prerequisites

You only need [pnpm].

### 📦 Installation

1. Install the library from Git

   ```sh
   pnpm add git+https://github.com/Malware-as-a-Service/MalInt.git
   ```

### 🥷 Quick examples

Here is a small script that fetches configurations and triggers a build:

```ts
import { MalInt, ForgeKind } from "MalInt";
import type { Repository } from "MalInt/repositories";

const repository: Repository = {
  baseAddress: "https://forgejo.example/",
  ownerUsername: "Malware-as-a-Service",
  name: "SayWare",
  buildingBranch: "main",
  configurationPath: "repository.toml",
  token: "YOUR_FORGE_TOKEN",
};

const malIntResult = await MalInt.createMalInt(repository, ForgeKind.Forgejo);

if (malIntResult.isErr()) {
  throw malIntResult.error;
}

const malInt = malIntResult.value;

// Generate the server configuration first if malware configuration references
// server values. Otherwise, you will get undefined reference errors.
// You can also fetch generated secrets or plaintext variables for your server
// environment, using the dedicated helper methods.
const serverConfigurationResult = await malInt.generateServerConfiguration();

if (serverConfigurationResult.isErr()) {
  throw serverConfigurationResult.error;
}

// Set the server hostname after provisioning the server (ECS, VM, or similar).
// The malware needs to know the server hostname, so we generate the server
// configuration first and keep references from malware to server.
const hostnameResult = malInt.setServerHostname("c2.example.com");

if (hostnameResult.isErr()) {
  throw hostnameResult.error;
}

const malwareConfigurationResult = await malInt.generateMalwareConfiguration();

if (malwareConfigurationResult.isErr()) {
  throw malwareConfigurationResult.error;
}

// If your registry does not have the server image, build it before deployment
// so the hosting platform knows where to pull it from.
const buildResult = await malInt.buildMalware(malwareConfigurationResult.value);

if (buildResult.isErr()) {
  throw buildResult.error;
}

const runIdentifier = buildResult.value;

// Poll at a regular interval until the build completes.
const artifactResult = await malInt.waitForMalware(runIdentifier);

if (artifactResult.isErr()) {
  throw artifactResult.error;
}

// This is usually a zip buffer.
const malwareBuffer = artifactResult.value;
}
```

## 👷 Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create.\
Any contributions you make are **greatly appreciated**.

If you want, you can help me with any kind of work, for example:

- Correct our English errors
- Licensing stuff

## 📚 Licenses

Distributed under the [GPL 3.0 or later] license.

[forgejo]: https://forgejo.org/
[gpl 3.0 or later]: ./LICENSES/GPL-3.0-or-later.txt
[maas]: https://github.com/Malware-as-a-Service/
[malint]: https://github.com/Malware-as-a-Service/MalInt/
[platform]: https://github.com/Malware-as-a-Service/Platform/
[pnpm]: https://pnpm.io/
