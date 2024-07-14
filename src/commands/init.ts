import { Command } from "commander";
import { initializing } from "../utils/initializing.js";

export const init = new Command()
  .name("init")
  .description("initialize your project and install dependecies")
  .action(async (opts) => {
    try {
      await initializing("init");
    } catch (error) {
      console.log(error);
    }
  });
