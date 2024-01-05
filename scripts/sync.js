/* eslint-disable no-console */
const command = 'pnpm m ls --json --depth=-1';
const { stdout } = require('child_process').spawnSync(command, { shell: true });

const json = JSON.parse(stdout);
json.forEach(async (element) => {
  if (element.private === true) {
    return;
  }
  const name = element.name;

  const { stdout } = require('child_process').spawnSync(`tnpm sync ${element.name}`, {
    shell: true,
  });
  console.log(stdout.toString());
});
