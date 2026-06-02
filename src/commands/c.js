const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { handleClienteAutocomplete } = require('../utils/autocomplete');
const clientesService = require('../services/clientesService');
const { formatClientEmbed, createClientComponents } = require('../utils/formatters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('c')
    .setDescription('Busca rápida de cliente')
    .addStringOption(option => 
      option.setName('slug')
        .setDescription('Nome ou slug do cliente')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('slug').toLowerCase();
    const cliente = clientesService.getBySlug(slug);

    if (!cliente) {
      return interaction.reply({ content: `❌ Cliente \`${slug}\` não encontrado.`, flags: [MessageFlags.Ephemeral] });
    }

    const embed = formatClientEmbed(cliente);
    const components = createClientComponents(cliente);
    await interaction.reply({ embeds: [embed], components });
  },
};
