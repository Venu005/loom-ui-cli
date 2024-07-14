import { existsSync } from "fs"; //file already exiss iin given path or not
import ora from "ora";
import spawn from "cross-spawn";
import path from "path";
import chalk from "chalk";

type PackageManager = "npm" | "pnpm" | "yarn";

function detectPackageManager(): PackageManager {
  if (existsSync("pnpm-lock.yaml")) {
    return "pnpm";
  } else if (existsSync("yarn.lock")) {
    return "yarn";
  } else if (existsSync("package-lock.json")) {
    return "npm";
  } else {
    return "npm"; //default
  }
}
export function installPackages(packages: string[]): Promise<void> {
  return new Promise((res, rej) => {
    if (!Array.isArray(packages)) {
      rej("Packages should be an array");
      return;
    }
    const packageManager = detectPackageManager();
    const installComand = packageManager === "yarn" ? "add" : "install";
    const args = [installComand, ...packages];
    const spinner = ora(
      chalk.cyan(`Installing packages :${packages.join(",")}`)
    ).start();
    const process = spawn(packageManager, args, {
      stdio: "inherit",
      shell: true,
    });
    process.on("close", (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green("Packages installed successfully!"));
        res();
      } else {
        spinner.fail(chalk.red("Failed to install packages"));
        rej(new Error("Failed to install packages"));
      }
    });

    process.on("error", (err) => {
      spinner.fail(chalk.red("failed to install packages"));
      console.error(chalk.red(err));
      rej(err);
    });
  });
}
