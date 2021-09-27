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
// deno run examples/01-basic-example.ts --config-port=8081 --config-db-host=127.0.0.1 --config-db-port=19222 --config-cors-config-allowed --config-cors-allowedOrigins=api.yooneskh.ir --config-cors-allowedOrigins=api.khoshghadam.com --config-test=false
augmentConfiguration(config);

console.log({ config });
