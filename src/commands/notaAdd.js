const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nota-add')
    .setDescription('Adiciona uma nota interna a um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('texto')
        .setDescription('O conteúdo da nota')
        .setRequired(true)),

  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('cliente').toLowerCase();
    const texto = interaction.options.getString('texto');

    try {
      clientesService.addNota(slug, texto);
      await interaction.reply(`✅ Nota adicionada ao cliente \`${slug}\`!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
