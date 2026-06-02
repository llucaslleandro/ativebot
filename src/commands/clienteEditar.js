const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cliente-editar')
    .setDescription('Edita informações de um cliente existente')
    .addStringOption(option => 
      option.setName('slug')
        .setDescription('Slug do cliente que deseja editar')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('nome')
        .setDescription('Novo nome da empresa'))
    .addStringOption(option => 
      option.setName('responsavel')
        .setDescription('Novo nome do responsável'))
    .addStringOption(option => 
      option.setName('status')
        .setDescription('Novo status (ex: ativo, pausa)'))
    .addStringOption(option => 
      option.setName('cidade')
        .setDescription('Nova cidade'))
    .addStringOption(option => 
      option.setName('plano')
        .setDescription('Novo plano contratado'))
    .addStringOption(option => 
      option.setName('observacoes')
        .setDescription('Novas observações gerais')),

  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('slug').toLowerCase();
    
    const updateData = {
      nome: interaction.options.getString('nome'),
      responsavel: interaction.options.getString('responsavel'),
      status: interaction.options.getString('status'),
      cidade: interaction.options.getString('cidade'),
      plano: interaction.options.getString('plano'),
      observacoes: interaction.options.getString('observacoes'),
    };

    // Remove campos nulos (não informados no comando)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null) delete updateData[key];
    });

    if (Object.keys(updateData).length === 0) {
      return interaction.reply({ content: '⚠️ Você precisa informar pelo menos um campo para editar.', ephemeral: true });
    }

    try {
      const clienteAtualizado = clientesService.update(slug, updateData);
      await interaction.reply(`✅ Cliente **${clienteAtualizado.nome}** atualizado com sucesso!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
