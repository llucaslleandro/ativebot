const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-remover')
    .setDescription('Remove um link útil de um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('link_id')
        .setDescription('Selecione o link')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    
    if (focusedOption.name === 'cliente') {
      await handleClienteAutocomplete(interaction);
    } else if (focusedOption.name === 'link_id') {
      const clienteSlug = interaction.options.getString('cliente');
      if (!clienteSlug) return interaction.respond([]);
      
      const cliente = clientesService.getBySlug(clienteSlug);
      if (!cliente || !cliente.links) return interaction.respond([]);

      const choices = cliente.links.map(l => ({ name: l.nome, value: l.id }));
      const filtered = choices.filter(c => c.name.toLowerCase().includes(focusedOption.value.toLowerCase())).slice(0, 25);
      await interaction.respond(filtered);
    }
  },

  async execute(interaction) {
    const slug = interaction.options.getString('cliente');
    const linkId = interaction.options.getString('link_id');

    await clientesService.deleteLink(slug, linkId);
    await interaction.reply(`✅ Link removido com sucesso!`);
  },
};
