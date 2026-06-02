const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cliente-remover')
    .setDescription('Remove permanentemente um cliente e todos os seus dados')
    .addStringOption(option => 
      option.setName('slug')
        .setDescription('Slug do cliente que deseja excluir')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('confirmacao')
        .setDescription('Digite "CONFIRMAR" para excluir permanentemente')
        .setRequired(true)),

  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('slug').toLowerCase();
    const confirmacao = interaction.options.getString('confirmacao');

    if (confirmacao !== 'CONFIRMAR') {
      return interaction.reply({ content: '⚠️ Para excluir, você deve digitar **CONFIRMAR** no campo de confirmação.', ephemeral: true });
    }

    try {
      clientesService.delete(slug);
      await interaction.reply(`🗑️ Cliente \`${slug}\` e todos os seus dados foram excluídos permanentemente.`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
