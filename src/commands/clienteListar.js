const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cliente-listar')
    .setDescription('Lista todos os clientes cadastrados'),

  async execute(interaction) {
    const clientes = clientesService.getAll();
    const slugs = Object.keys(clientes);

    if (slugs.length === 0) {
      return interaction.reply('Nenhum cliente cadastrado ainda.');
    }

    let response = '### 📋 Lista de Clientes\n';
    response += '| Slug | Nome | Status | Responsável |\n';
    response += '| :--- | :--- | :--- | :--- |\n';

    slugs.forEach(slug => {
      const c = clientes[slug];
      response += `| \`${c.slug}\` | ${c.nome} | ${c.status || '-'} | ${c.responsavel || '-'} |\n`;
    });

    await interaction.reply(response);
  },
};
