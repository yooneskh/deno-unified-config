

const ENV_ARGUMENT_PREFIX = '--env-config';
const CLI_ARGUMENT_PREFIX = '--config';

type GObject = Record<string, unknown>


function isPrimitive(value: unknown): boolean {
  return (typeof value === 'string') || (typeof value === 'number') || (typeof value === 'boolean') || value === undefined || value === null;
}

function tryParse(value: unknown) {

  if (value === 'true' || value === 'false') {
    return value === 'true';
  }

  return Number(value) || value;

}

function relativeAugment(previous: unknown, value: unknown): unknown {
  if (previous === undefined || previous === null) {
    return tryParse(value);
  }
  else if (typeof previous === 'string') {
    return String(value);
  }
  else if (typeof previous === 'number') {
    return parseFloat(String(value));
  }
  else if (typeof previous === 'boolean') {
    return value === 'true' || value === true;
  }
  else {
    return tryParse(value);
  }
}

function augmentValueOnPrevious(previous: unknown, value: unknown): unknown {

  if (Array.isArray(previous)) {
    return [...previous, value]
  }

  if (previous) {
    return [previous, value];
  }

  return value;

}

function applyValueOnPath(object: GObject, path: string[], value: string) {
  if (!path || path.length === 0) return;

  if (path.length === 1) {
    object[path[0]] = augmentValueOnPrevious(object[path[0]], value);
  }
  else {

    if (!( path[0] in object )) {
      object[path[0]] = {};
    }

    applyValueOnPath(object[path[0]] as GObject, path.slice(1), value);

  }

}


export function smartAugment(source: GObject, target: GObject) {
  for (const key in source) {
    if (!( key in target )) continue;

    if (isPrimitive(source[key]) && isPrimitive(target[key])) {
      source[key] = relativeAugment(source[key], target[key]);
    }
    else if (Array.isArray(source[key]) && isPrimitive(target[key])) {
      source[key] = [...(source[key] as unknown[]), relativeAugment( (source[key] as unknown[])[0], target[key])];
    }
    else if (isPrimitive(source[key]) && Array.isArray(target[key])) {
      source[key] = relativeAugment(source[key], (target[key] as unknown[]).slice(-1)[0]);
    }
    else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      source[key] = [ ...(source[key] as unknown[]), ...(target[key] as unknown[]) ];
    }
    else if (source[key] === null) {
      source[key] = target[key];
    }
    else if (target[key] === null) {
      continue;
    }
    else if (typeof source[key] === 'object' && typeof target[key] === 'object') {
      smartAugment(source[key] as GObject, target[key] as GObject)
    }

  }
}


export function gatherEnvConfigs(): GObject {

  const envFiles = (
    Deno.args
      .filter(it => it.startsWith(ENV_ARGUMENT_PREFIX))
      .map(it => it.slice(ENV_ARGUMENT_PREFIX.length + 1))
  );

  const result: GObject = {};

  for (const filePath of envFiles) {
    try {

      const fileContent = Deno.readTextFileSync(filePath);

      for (const fileLine of fileContent.split('\n')) {
        if (!fileLine.trim()) continue;

        const [keyPath, value] = fileLine.trim().split('=');
        if (!keyPath || !value) continue;

        applyValueOnPath(result, keyPath.split('.'), value);

      }

    }
    catch (error) {
      throw new Error(`could not parse env file ${filePath} :: ${error.message}`);
    }

  }

  return result;

}

export function gatherCliConfigs(): GObject {

  const configArguments = (
    Deno.args
      .filter(it => it.startsWith(CLI_ARGUMENT_PREFIX))
      .map(it => it.slice(CLI_ARGUMENT_PREFIX.length + 1))
  );

  const result: GObject = {};

  for (const argument of configArguments) {

    let [keyPath, value] = argument.split('=');
    if (value === undefined) value = 'true';

    applyValueOnPath(result, keyPath.split('-'), value);

  }

  return result;

}


export function augmentConfiguration<T extends GObject>(config: T): T {

  if (typeof config !== 'object' || !config) {
    throw new Error('config is not an object.');
  }

  const envConfig = gatherEnvConfigs();
  smartAugment(config, envConfig);

  const cliConfig = gatherCliConfigs();
  smartAugment(config, cliConfig);

  return config;

}
