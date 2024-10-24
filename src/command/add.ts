import { Command } from "commander";
import { initializing } from "../utils/initializing.js";
import { installPackages } from "../utils/packageInstaller.js";
import { writeFilesWithLinks } from "../utils/function.js";
import { logger } from "../utils/logger.js";
import { componentsData } from "../utils/data.js";
import chalk from "chalk";

export const DEFAULT_STYLE = "default";
export const DEFAULT_COMPONENTS = "@/components";
export const DEFAULT_UTILS = "@/lib/utils";
export const DEFAULT_TAILWIND_CSS = "app/globals.css";
export const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js";
export const DEFAULT_TAILWIND_BASE_COLOR = "slate";

export const add = new Command()
  .name("add")
  .description("Add components to you nextjs app")
  .argument("[components...]", "To add components")

  .option("-o, --overwrite", "To overwrite existing files.", false)

  .option("-a, --all", "add all available components", false)

  .action(async (components, opts) => {
    try {
      await initializing("add");
      const packagesToInstall = new Set<string>();
      for (const itm of components) {
        const isMatch = componentsData.find((cmd) => itm === cmd.command);
        if (isMatch) {
          if (isMatch.packages && Array.isArray(isMatch.packages)) {
            isMatch.packages.forEach((pkg) => packagesToInstall.add(pkg));
          }
          await writeFilesWithLinks(isMatch.files);
        } else {
          logger.error(`Unknown component: ${itm}`);
        }
      }
      if (packagesToInstall.size > 0) {
        console.log(
          chalk.blue(
            `Installing packages: ${Array.from(packagesToInstall).join(", ")}`
          )
        );
        await installPackages(Array.from(packagesToInstall));
      } else {
        console.log(chalk.yellow("No packages to install."));
      }
    } catch (error) {
      console.log(error);
    }
  });
