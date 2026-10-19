const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const env = { ...process.env };
const backendDir = path.join(root, 'apps', 'backend');
const frontendDir = path.join(root, 'apps', 'frontend');

const defaults = {
  NODE_ENV: 'local',
  PORT: '3000',
  DB_TYPE: 'postgres',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: env.POSTGRES_USER,
  DB_PASSWORD: env.POSTGRES_PASSWORD,
  DB_NAME: env.POSTGRES_DB,
  DB_SCHEMA: 'ngine',
};

for (const [key, value] of Object.entries(defaults)) {
  if (!env[key] && value) {
    env[key] = value;
  }
}

const frontendUrl = new URL(env.FRONTEND_URL || 'http://localhost:4200');
const frontendPort = frontendUrl.port || '8080';
const processes = [
  {
    name: 'backend',
    cwd: backendDir,
    entry: require.resolve('@nestjs/cli/bin/nest.js', {
      paths: [backendDir],
    }),
    args: ['start', '--watch'],
  },
  {
    name: 'frontend',
    cwd: frontendDir,
    entry: require.resolve('@angular/cli/bin/ng.js', {
      paths: [frontendDir],
    }),
    args: ['serve', '--host', '0.0.0.0', '--port', frontendPort],
  },
];

let stopping = false;
let exitCode = 0;
const children = [];

function stop(code) {
  if (stopping) {
    return;
  }

  stopping = true;
  exitCode = code;

  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM');
    }
  }

  if (
    children.every(
      (child) => child.exitCode !== null || child.signalCode !== null,
    )
  ) {
    process.exitCode = exitCode;
  }
}

for (const processConfig of processes) {
  const child = spawn(process.execPath, [processConfig.entry, ...processConfig.args], {
    cwd: processConfig.cwd,
    env,
    stdio: 'inherit',
  });
  children.push(child);

  child.on('error', (error) => {
    console.error(`Could not start ${processConfig.name}: ${error.message}`);
    stop(1);
  });

  child.on('close', (code, signal) => {
    if (!stopping) {
      console.error(
        `${processConfig.name} stopped${signal ? ` after ${signal}` : ` with exit code ${code}`}.`,
      );
      stop(code || 1);
    }

    if (
      children.every(
        (runningChild) =>
          runningChild.exitCode !== null || runningChild.signalCode !== null,
      )
    ) {
      process.exitCode = exitCode;
    }
  });
}

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
