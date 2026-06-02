const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const clientesService = require('../services/clientesService');
const { formatClientEmbed, createClientComponents } = require('../utils/formatters');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cliente-info')
    .setDescription('Consulta informações de um cliente')
    .addStringOption(option => 
      option.setName('slug')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('slug').toLowerCase();
    const cliente = clientesService.getBySlug(slug);

    if (!cliente) {
      return interaction.reply({ content: `❌ Cliente com slug \`${slug}\` não encontrado.`, flags: [MessageFlags.Ephemeral] });
    }

    const embed = formatClientEmbed(cliente);
    const components = createClientComponents(cliente);
    await interaction.reply({ embeds: [embed], components });
  },
};
