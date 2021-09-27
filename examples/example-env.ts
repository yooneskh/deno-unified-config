import { augmentConfiguration } from '../mod.ts';

const config = {
  port: 8080,
  db: {
    host: 'localhost',
    port: 27017
  },
  cors: {
    allowedOrigins: [],
    config: {
      test: 0,
      allowed: false
    }
  },
  test: true
};

// run with
// deno run --allow-read=./ examples/01-basic-example.ts --json-config=./examples/json-config.json
augmentConfiguration(config);

console.log({ config });
