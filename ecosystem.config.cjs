module.exports = {
  apps: [
    {
      name: 'ativebot-discord',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        CLIENTES_DATA_PATH: '/var/lib/ativebot/clientes.json',
      },
    },
  ],
};
