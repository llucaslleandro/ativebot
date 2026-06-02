const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-add')
    .setDescription('Adiciona um link útil a um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('nome')
        .setDescription('Nome do link (ex: BM, Site, Drive)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('url')
        .setDescription('A URL completa')
        .setRequired(true)),

  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('cliente').toLowerCase();
    const nome = interaction.options.getString('nome');
    const url = interaction.options.getString('url');

    clientesService.addLink(slug, { nome, url });
    await interaction.reply(`✅ Link **${nome}** adicionado ao cliente \`${slug}\`!`);
  },
};
