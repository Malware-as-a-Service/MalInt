// SPDX-FileCopyrightText: 2025 The MalInt development team
//
// SPDX-License-Identifier: CC0-1.0

import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "src/index.ts",
	dts: true,
	clean: true,
	format: ["esm", "cjs"],
});
