import { Command } from "commander";
import { initializing } from "../utils/initializing.js";
import { installPackages } from "../utils/packageInstaller.js";
import { writeFiles } from "../utils/function.js";
import { logger } from "../utils/logger.js";
import { componentData } from "../utils/data.js";

export const DEFAULT_STYLE = "default";
export const DEFAULT_COMPONENTS = "@/components";
export const DEFAULT_UTILS = "@/lib/utils";
export const DEFAULT_TAILWIND_CSS = "app/globals.css";
export const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js";
export const DEFAULT_TAILWIND_BASE_COLOR = "slate";

export const add = new Command()
  .name("add")
  .description("Add components to your react apps")
  .argument("[components...]", "To add components")
  .option("-o, --overwrite", "To overwrite existing files.", false)
  .option("-a, --all", "add all available components", false)
  .action(async (components, opts) => {
    try {
      await initializing("add");
      components.map(async (itm: any) => {
        const isMatch = componentData.find((cmd) => itm === cmd.command);
        if (isMatch) {
          if (isMatch.packages !== null) {
            installPackages(isMatch.packages)
              .then(() => writeFiles(isMatch.files))
              .catch((err) => {
                console.error(
                  "An error occured during package installation: ",
                  err
                );
              });
          } else {
            writeFiles(isMatch.files);
          }
        } else {
          return logger.error(`Unknown component: ${itm}`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
