module.exports = {
  apps: [
    {
      name: 'newtab-front',
      script: 'npm',
      args: 'run dev:frontend',
      cwd: __dirname
    },
    {
      name: 'newtab-api',
      script: 'npm',
      args: 'run dev:backend',
      cwd: __dirname
    }
  ]
};
