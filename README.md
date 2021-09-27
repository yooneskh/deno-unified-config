# Deno Config
Utility to streamline your deno app config management through cli, .env and json files.

## Installation

## Usage
deno-config accepts a config object as the source of truth and applies changes to it according to cli, env files or json files.

```
// config.ts

import { augmentConfiguration } from '...';

export const Config = {
  port: 8080,
  db: {
    host: 'localhost',
    port: 27017,
    name: 'my-db'
  },
  cors: {
    allowed: false,
    allowedHosts: []
  }
};

augmentConfiguration(config);
```
deno-config changes (augments) this object according to options passed through cli as described below.

**Note:** deno-config always follows this config objects structure. if a property does not exist in this object, deno-config will not add it.

### Cli
You can augment your config object using cli by giving arguments like this: `--config-{keyPath}={value}`. You can nest key path by using `-` like this `--config-db-port=3000`. One example of using cli is this.

```
// if you run your app like this
// deno run app.ts --config-port=3000 --config-db-host=127.0.0.1 --config-cors-allowed --config-cors-allowedHosts=khoshghadam.com --config-cors-allowedHosts=yooneskh.ir
// your config file will be this

{
  port: 3000,
  db: {
    host: '127.0.0.1',
    port: 27017,
    name: 'my-db'
  },
  cors: {
    allowed: true,
    allowedHosts: ['khoshghadam.com', 'yooneskh.ir']
  }
}
```
Note usage of arrays and booleans. If a property is array in your config object, specifing value for it through cli will add the value to the array. boolean values can be given with `true` and `false` but omitting `=true` will imply `true` as in `--config-cors-allowed`.

### JSON files
You can specify JSON file path like this `--json-config={json file path}` and deno-config will merge it with the config object.
```
// ./config/sample-config.json
{
  "port": 3000,
  "cors": {
    "allowed": true,
    "allowedHosts": ['khoshghadam.com', 'yooneskh.ir']
  }
}

// if you run your app like this
// deno run app.ts --json-config=./config/sample-config.json
// your config file will be this
{
  port: 3000,
  db: {
    host: 'localhost',
    port: 27017,
    name: 'my-db'
  },
  cors: {
    allowed: true,
    allowedHosts: ['khoshghadam.com', 'yooneskh.ir']
  }
}
```

### Env files
You can specify env file path like `--env-config={env file path}` and deno-config will augment you config object with it. each line must have this format `{keyPath}={value}`. you can nest keyPath with `.` as in `db.host=localhost`

```
// ./.env
port=3000

cors.allowed=true
cors.allowedHosts=khoshghadam.com
cors.allowedHosts=yooneskh.ir

// if you run your app like this
// deno run app.ts --env-config=./.env
// your config file will be this
{
  port: 3000,
  db: {
    host: 'localhost',
    port: 27017,
    name: 'my-db'
  },
  cors: {
    allowed: true,
    allowedHosts: ['khoshghadam.com', 'yooneskh.ir']
  }
}
```
Note usage of arrays and booleans. You cannot omit `=true` in env files and they must be explicitly specified.

further examples are in `./examples` directory.

## Licence
Use as you wish.