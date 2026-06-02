const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete, handleAcessoAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acesso-remover')
    .setDescription('Remove um acesso específico de um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('acesso_id')
        .setDescription('Selecione o acesso que deseja remover')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    
    if (focusedOption.name === 'cliente') {
      await handleClienteAutocomplete(interaction);
    } else if (focusedOption.name === 'acesso_id') {
      await handleAcessoAutocomplete(interaction);
    }
  },

  async execute(interaction) {
    const slug = interaction.options.getString('cliente');
    const acessoId = interaction.options.getString('acesso_id');

    try {
      await clientesService.deleteAcesso(slug, acessoId);
      await interaction.reply(`✅ Acesso removido com sucesso do cliente \`${slug}\`!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
