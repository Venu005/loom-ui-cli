import chalk from "chalk";
import {
  COMPONENTSFILE,
  findTargetFile,
  setupLoomuiFolder,
  UIFOLDER,
  UIFOLDERPATH,
} from "./function.js";
import { logger } from "./logger.js";
import ora from "ora";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { mkdirSync, writeFileSync } from "fs";

export const initializing = async (type: string) => {
  const spinner = ora(chalk.cyan("initializing...")).start();
  console.log(chalk.blue("Starting initialization..."));

  const componentFile = await findTargetFile(COMPONENTSFILE);

  if (!componentFile) {
    console.log(chalk.yellow("components.json not found, creating it..."));
    // Create components.json if it doesn't exist
    const defaultConfig = {
      style: "default",
      tailwind: {
        config: "tailwind.config.js",
        css: "app/globals.css",
        baseColor: "slate",
        cssVariables: true,
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    };

    await fs.writeFile(
      "components.json",
      JSON.stringify(defaultConfig, null, 2)
    );
    logger.success("Created components.json with default configuration.");
  }

  console.log(chalk.blue("Setting up Loomui folder..."));
  setupLoomuiFolder();

  if (type === "init") {
    spinner.succeed(chalk.green(`Project is initialized.`));
    logger.success("Now You can add components.");
  } else {
    spinner.stop();
  }
  console.log(chalk.blue("Initialization complete."));
};
