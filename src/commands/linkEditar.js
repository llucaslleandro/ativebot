const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-editar')
    .setDescription('Edita um link útil de um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('link_id')
        .setDescription('Selecione o link')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('nome')
        .setDescription('Novo nome do link'))
    .addStringOption(option => 
      option.setName('url')
        .setDescription('Nova URL')),

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
    const updateData = {
      nome: interaction.options.getString('nome'),
      url: interaction.options.getString('url'),
    };

    Object.keys(updateData).forEach(key => { if (updateData[key] === null) delete updateData[key]; });

    try {
      await clientesService.updateLink(slug, linkId, updateData);
      await interaction.reply(`✅ Link atualizado com sucesso!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
