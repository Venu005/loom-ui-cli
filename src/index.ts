#!/usr/bin/env node

import { Command } from "commander";
import { getPackageInfo } from "./utils/get-package-info.js";
import { init } from "./command/init.js";
import { add } from "./command/add.js";

async function main() {
  const packageInfo = await getPackageInfo();
  const program = new Command()
    .name("loom-ui")
    .description("add customizable components to your projects")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "output the current version"
    );
  program.addCommand(init).addCommand(add);
  program.parse();
}

main();
