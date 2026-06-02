const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete, handleAcessoAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acesso-editar')
    .setDescription('Edita um acesso existente de um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('acesso_id')
        .setDescription('Selecione o acesso que deseja editar')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('plataforma')
        .setDescription('Nova plataforma (ex: Instagram, Facebook)'))
    .addStringOption(option => 
      option.setName('login')
        .setDescription('Novo usuário ou email'))
    .addStringOption(option => 
      option.setName('senha')
        .setDescription('Nova senha'))
    .addStringOption(option => 
      option.setName('link')
        .setDescription('Nova URL de login'))
    .addStringOption(option => 
      option.setName('observacao')
        .setDescription('Novas notas sobre este acesso')),

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
    
    const updateData = {
      plataforma: interaction.options.getString('plataforma'),
      login: interaction.options.getString('login'),
      senha: interaction.options.getString('senha'),
      link: interaction.options.getString('link'),
      observacao: interaction.options.getString('observacao'),
    };

    // Remove campos nulos
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null) delete updateData[key];
    });

    if (Object.keys(updateData).length === 0) {
      return interaction.reply({ content: '⚠️ Informe pelo menos um campo para editar.', ephemeral: true });
    }

    try {
      await clientesService.updateAcesso(slug, acessoId, updateData);
      await interaction.reply(`✅ Acesso atualizado com sucesso para o cliente \`${slug}\`!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
