import chalk from "chalk";
import {
  appendFile,
  appendFileSync,
  existsSync,
  promises as fs,
  mkdirSync,
  writeFile,
} from "fs";
import path from "path";
import prompts from "prompts";
import * as https from "https";
import ora from "ora";
export const UIFOLDERPATH = "./components/ui";
export const UIFOLDER = "ui";
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
    const filePath = path.resolve(configPath, "components.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const configData = JSON.parse(fileContent);
    configData["loomui"] = true;
    const updatedContent = JSON.stringify(configData, null, 2);
    await fs.writeFile(filePath, updatedContent, "utf-8");
    console.log("Updated component.json successfully.");
  } catch (error) {
    console.error("Error updating component.json", error);
  }
}
// writing files to see if the component is already present and if we can use it
async function checkandWriteFile(
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
      message: `File ${name} already exists.Are you sure? You want to overwrite it?`,
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
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        writeFile(path, data, (err) => {
          if (err) {
            spinner.fail(chalk.red(`Falied to create ${action}`));
          } else {
            spinner.succeed(chalk.green(`File created ${name}`));
          }
        });
      });
    })
    .on("error", (err) => {
      console.error(chalk.red(`Failed to create ${action}`, err));
    });
}

export async function writeFiles(payloads: Array<any>) {
  for (const payload of payloads) {
    const { step, name, link, type } = payload;
    const action = `Creating ${name}${type}`;
    const path = getWriteComponentPath(payload.name);
    if (link) {
      const spinner = ora(chalk.cyan(action) as any).start();
      await checkandWriteFile(action, link, path, spinner, payload.name);
    } else {
      const spinner = ora(chalk.cyan(action)).start();
      const filePath = await findTargetFile(payload.write.fileName);
      if (filePath) {
        await appendFileSync(filePath as string, payload.write.data, "utf-8");
        spinner.succeed(chalk.green(`Data added to ${payload.write.fileName}`));
      } else {
        spinner.fail(
          chalk.green(`No File Found name ${payload.write.fileName}.`)
        );
      }
    }
  }
}

// get the component
export function getWriteComponentPath(component: string) {
  const path = "./src";
  if (existsSync(path)) {
    return `./src/components/${UIFOLDER}` + component + ".tsx";
  } else {
    return `./components/${UIFOLDER}` + component + ".tsx";
  }
}

//setting up loom ui if not installed before hand

export function setupLoomuiFolder() {
  const srcPath = `./src/components/${UIFOLDER}`;
  const rootPath = `./components/${UIFOLDER}`;
  if (!existsSync(srcPath) && !existsSync(rootPath)) {
    if (existsSync("./src/components")) {
      mkdirSync(srcPath, { recursive: true });
      console.log(chalk.green(`Created './src/components/${UIFOLDER}' ...`));
    } else if (existsSync("./components")) {
      mkdirSync(rootPath, { recursive: true });
      console.log(chalk.green.bold(`Created './components/${UIFOLDER}' ...`));
    } else {
      console.log(
        chalk.red.bold(
          `Neither './src/components' nor './components' directories exist.`
        )
      );
    }
  }
}
