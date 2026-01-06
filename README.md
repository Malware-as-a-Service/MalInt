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

## :clipboard: Table of content

- [:clipboard: Table of content](#clipboard-table-of-content)
- [:warning: Disclaimer](#warning-disclaimer)
- [:eyes: About the project](#eyes-about-the-project)
  - [:question: Why](#question-why)
- [:rocket: Getting started](#rocket-getting-started)
  - [:gear: Prerequisites](#gear-prerequisites)
  - [:package: Installation](#package-installation)
  - [:ninja: Quick examples](#ninja-quick-examples)
- [:construction_worker: Contributing](#construction_worker-contributing)
- [:books: Licenses](#books-licenses)

## :warning: Disclaimer

This TypeScript library integrates a repository with the
[MaaS platform][platform]. It does not validate that a repository is safe,
correct, or buildable. You are responsible for reviewing your configuration and
build outputs. **I am not a TypeScript developer and did my best, so there is room
for improvement.**

## :eyes: About the project

[MalInt] is a TypeScript library that connects a [MaaS] repository to
an automation forge like [Forgejo]. It reads repository configuration files,
loads client and output schemas, generates server and malware configurations,
and dispatches build workflows. It also provides helpers to download build
artifacts and to classify server variables as secrets or plaintext.

### :question: Why

Integration logic is easy to duplicate and hard to keep consistent across
projects. MalInt centralizes that logic so you can:

- Reuse a single integration API across repositories
- Keep configuration parsing and generation consistent
- Standardize error handling and workflow interaction

## :rocket: Getting started

If you want to integrate a repository with the platform, follow the steps
below.

### :gear: Prerequisites

You only need [pnpm].

### :package: Installation

1. Install the library from Git

   ```sh
   pnpm add git+https://github.com/Malware-as-a-Service/MalInt.git
   ```

### :ninja: Quick examples

Here is a small script that fetches configurations and triggers a build:

```ts
import { MalInt } from "MalInt";
import { ForgeKind } from "MalInt/forges";
import type { Repository } from "MalInt/repositories";

const repository: Repository = {
  baseAddress: "https://forgejo.example/",
  ownerUsername: "Malware-as-a-Service",
  name: "SayWare",
  buildingBranch: "main",
  configurationPath: "repository.toml",
  token: "YOUR_FORGE_TOKEN",
};

const result = await MalInt.createMalInt(repository, ForgeKind.Forgejo);

if (result.isOk()) {
  const malInt = result.value;
  const serverConfigurations = await malInt.getServerSideConfigurations();
  const serverConfig = await malInt.generateServerConfiguration();
  const malwareConfig = await malInt.generateMalwareConfiguration();

  if (
    serverConfigurations.isOk() &&
    serverConfig.isOk() &&
    malwareConfig.isOk()
  ) {
    await malInt.buildMalware(malwareConfig.value);
  }
}
```

## :construction_worker: Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create.\
Any contributions you make are **greatly appreciated**.

If you want, you can help me with any kind of work, for example:

- Correct our English errors
- Licensing stuff

## :books: Licenses

Distributed under the [GPL 3.0 or later] license.

[forgejo]: https://forgejo.org/
[gpl 3.0 or later]: ./LICENSES/GPL-3.0-or-later.txt
[maas]: https://github.com/Malware-as-a-Service/
[malint]: https://github.com/Malware-as-a-Service/MalInt/
[platform]: https://github.com/Malware-as-a-Service/Platform/
[pnpm]: https://pnpm.io/
