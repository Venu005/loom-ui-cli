import path from "path";
import z from "zod";
import {
  createMatchPath,
  loadConfig,
  type ConfigLoaderSuccessResult,
} from "tsconfig-paths";
import { cosmiconfig } from "cosmiconfig";
//Pick is a utility type in TypeScript that constructs a new type by picking the set of properties K from T. Pick<T,K>

//* chore: it is to import the components.json and then resolve thte paths in config.json

export async function resolveImport(
  importPath: string,
  config: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths">
) {
  //createMatchPath returns other fucntion()()
  return createMatchPath(config.absoluteBaseUrl, config.paths)(
    importPath,
    undefined,
    () => true,
    [".ts", ".tsx"]
  );
}

const explorer = cosmiconfig("components", {
  searchPlaces: ["components.json"],
});

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    style: z.string(),
    rsc: z.coerce.boolean().default(false),
    tsx: z.coerce.boolean().default(true),
    tailwind: z.object({
      config: z.string(),
      css: z.string(),
      baseColor: z.string(),
      cssVariables: z.boolean().default(true),
      prefix: z.string().default("").optional(),
    }),
    aliases: z.object({
      components: z.string(),
      utils: z.string(),
      ui: z.string().optional(),
    }),
  })
  .strict();
//* exporting raw config as type
export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
    utils: z.string(),
    components: z.string(),
    ui: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

export async function getConfig(cwd: string) {
  const config = await getRawConfig(cwd);
  if (!config) {
    throw new Error("No configuration found.");
  }
  return await resolveConfigPaths(cwd, config);
}

export async function resolveConfigPaths(cwd: string, config: RawConfig) {
  //load config
  const tsConfig = await loadConfig(cwd);
  if (tsConfig.resultType === "failed") {
    throw new Error(
      `Failed to load ${config.tsx ? "tsconfig" : "jsconfig"}.json. ${
        tsConfig.message ?? ""
      }`.trim()
    );
  }
  return configSchema.parse({
    ...config,
    resovedPaths: {
      tailwindConfig: path.resolve(cwd, config.tailwind.config),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      utils: await resolveImport(config.aliases["utils"], tsConfig),
      components: await resolveImport(config.aliases["components"], tsConfig),
      ui: config.aliases["ui"]
        ? await resolveImport(config.aliases["ui"], tsConfig)
        : await resolveImport(config.aliases["components"], tsConfig),
    },
  });
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd);
    if (!configResult) {
      return null;
    }
    return rawConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Invalid configuration found in ${cwd}/components.json.`);
  }
}
