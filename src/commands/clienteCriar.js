const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cliente-criar')
    .setDescription('Cadastra um novo cliente no sistema')
    .addStringOption(option => 
      option.setName('slug')
        .setDescription('Identificador único (ex: pizzaria-estrela)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('nome')
        .setDescription('Nome da empresa')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('responsavel')
        .setDescription('Nome do responsável'))
    .addStringOption(option => 
      option.setName('status')
        .setDescription('Status atual (ex: ativo, pausa)'))
    .addStringOption(option => 
      option.setName('cidade')
        .setDescription('Cidade do cliente'))
    .addStringOption(option => 
      option.setName('plano')
        .setDescription('Plano contratado'))
    .addStringOption(option => 
      option.setName('observacoes')
        .setDescription('Observações gerais')),

  async execute(interaction) {
    const slug = interaction.options.getString('slug').toLowerCase();
    const nome = interaction.options.getString('nome');
    const responsavel = interaction.options.getString('responsavel');
    const status = interaction.options.getString('status');
    const cidade = interaction.options.getString('cidade');
    const plano = interaction.options.getString('plano');
    const observacoes = interaction.options.getString('observacoes');

    clientesService.create({
      slug,
      nome,
      responsavel,
      status,
      cidade,
      plano,
      observacoes
    });

    await interaction.reply(`✅ Cliente **${nome}** (slug: \`${slug}\`) criado com sucesso!`);
  },
};
