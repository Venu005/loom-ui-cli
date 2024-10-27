import chalk from "chalk";
import {
  appendFile,
  appendFileSync,
  existsSync,
  promises as fs,
  mkdirSync,
  writeFile,
  writeFileSync,
} from "fs";
import path from "path";
import prompts from "prompts";
import * as https from "https";
import ora from "ora";
import { execSync } from "child_process";
import { installPackages } from "./packageInstaller.js";

export const UIFOLDERPATH = "./components/loomui";
export const UIFOLDER = "loomui";
export const COMPONENTSFILE = "components.json";

//finding the path of target file
export async function findTargetFile(
  targetFileName: string,
  startDir: string = process.cwd()
): Promise<string | null> {
  async function searchDirectory(directory: string): Promise<string | null> {
    const files = await fs.readdir(directory);
    if (files) {
      for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = await fs.stat(fullPath);
        if (stat.isFile() && path.basename(fullPath) === targetFileName) {
          return fullPath;
        } else if (stat.isDirectory()) {
          const result = await searchDirectory(fullPath);
          if (result) {
            return result;
          }
        }
      }
    }

    return null;
  }

  return searchDirectory(startDir);
}
export async function addLoomuiToConfig(configPath: string) {
  try {
    // Read the existing component.json file
    const filePath = path.resolve(configPath, "component.json");
    const fileContent = await fs.readFile(filePath, "utf-8");

    // Parse the JSON content
    const configData = JSON.parse(fileContent);

    // Add the new key-value pair
    configData["loomui"] = true;

    // Convert the updated data back to JSON
    const updatedContent = JSON.stringify(configData, null, 2);

    // Write the updated JSON back to the component.json file
    await fs.writeFile(filePath, updatedContent, "utf-8");

    console.log("Updated component.json successfully.");
  } catch (error) {
    console.error("Error updating component.json:", error);
  }
}

async function checkAndWriteFile(
  action: any,
  url: any,
  path: any,
  spinner: any,
  name: string
) {
  if (existsSync(path)) {
    spinner.stop();
    const response = await prompts({
      type: "toggle",
      name: "overwrite",
      message: `File ${name} already exists. Are you sure to overwrite it?`,
      initial: true,
      active: "yes",
      inactive: "no",
    });

    if (!response.overwrite) {
      spinner.info(chalk.cyan(`Skipped creating ${name}`));
      return;
    }
    spinner.start();
  }

  https
    .get(url, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        writeFile(path, data, (err) => {
          if (err) {
            spinner.fail(chalk.red(`Fail to create ${action}`));
          } else {
            spinner.succeed(chalk.green(`File created ${name}.`));
          }
        });
      });
    })
    .on("error", (err) => {
      console.error(chalk.red(`Fail to create ${action}`, err));
    });
}

export async function writeFilesWithLinks(payloads: Array<any>) {
  for (const payload of payloads) {
    const { step, name, link, type } = payload;
    const action = ` Creating ${name}${type}`;
    const path = getWriteComponentPath(payload.name);

    if (link) {
      const spinner = ora(chalk.cyan(action) as any).start();
      await checkAndWriteFile(action, link, path, spinner, payload.name);
    } else {
      const spinner = ora(chalk.cyan(action)).start();
      const filePath = await findTargetFile(payload.write.fileName);
      if (filePath) {
        await appendFileSync(filePath as string, payload.write.data, "utf8");
        spinner.succeed(
          chalk.green(`Data added to ${payload.write.fileName}.`)
        );
      } else {
        spinner.fail(
          chalk.green(`No File Found name ${payload.write.fileName}.`)
        );
      }
    }
  }
}

export function getWriteComponentPath(component: string) {
  const basePath = existsSync("src") ? "src" : ".";
  return path.join(basePath, "components", UIFOLDER, `${component}.tsx`);
}

export async function setupLoomuiFolder() {
  const libPath = "lib";
  const utilsFilePath = path.join(libPath, "utils.ts");

  let basePath = existsSync("src") ? "src" : ".";

  // Create components directory
  const componentsPath = path.join(basePath, "components");
  if (!existsSync(componentsPath)) {
    mkdirSync(componentsPath, { recursive: true });
    console.log(chalk.green.bold(`Created '${componentsPath}' directory`));
  }

  // Create loomui folder
  const loomuiPath = path.join(componentsPath, UIFOLDER);
  if (!existsSync(loomuiPath)) {
    mkdirSync(loomuiPath, { recursive: true });
    console.log(chalk.green.bold(`Created '${loomuiPath}' directory`));
  }

  // Create lib directory and utils.ts file
  const fullLibPath = path.join(basePath, libPath);
  if (!existsSync(fullLibPath)) {
    mkdirSync(fullLibPath, { recursive: true });
    console.log(chalk.green.bold(`Created '${fullLibPath}' directory`));
  }

  const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

  const fullUtilsPath = path.join(basePath, utilsFilePath);
  writeFileSync(fullUtilsPath, utilsContent);
  console.log(chalk.green.bold(`Created '${fullUtilsPath}' file`));

  // Install tailwind-merge and clsx
  try {
    console.log(chalk.cyan("Installing tailwind-merge and clsx..."));
    await installPackages(["tailwind-merge", "clsx"]);
    console.log(
      chalk.green.bold("Successfully installed tailwind-merge and clsx")
    );
  } catch (error) {
    console.error(
      chalk.red("Failed to install tailwind-merge and clsx:"),
      error
    );
  }
}
