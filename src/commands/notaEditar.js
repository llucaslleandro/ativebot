const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nota-editar')
    .setDescription('Edita uma nota interna de um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('nota_id')
        .setDescription('Selecione a nota')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('texto')
        .setDescription('Novo conteúdo da nota')
        .setRequired(true)),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    
    if (focusedOption.name === 'cliente') {
      await handleClienteAutocomplete(interaction);
    } else if (focusedOption.name === 'nota_id') {
      const clienteSlug = interaction.options.getString('cliente');
      if (!clienteSlug) return interaction.respond([]);
      
      const cliente = clientesService.getBySlug(clienteSlug);
      if (!cliente || !cliente.notas) return interaction.respond([]);

      const choices = cliente.notas.map(n => ({ 
        name: n.texto.length > 50 ? n.texto.substring(0, 47) + '...' : n.texto, 
        value: n.id 
      }));
      const filtered = choices.filter(c => c.name.toLowerCase().includes(focusedOption.value.toLowerCase())).slice(0, 25);
      await interaction.respond(filtered);
    }
  },

  async execute(interaction) {
    const slug = interaction.options.getString('cliente');
    const notaId = interaction.options.getString('nota_id');
    const texto = interaction.options.getString('texto');

    try {
      await clientesService.updateNota(slug, notaId, texto);
      await interaction.reply(`✅ Nota atualizada com sucesso!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
