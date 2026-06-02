const { SlashCommandBuilder } = require('discord.js');
const clientesService = require('../services/clientesService');
const { handleClienteAutocomplete } = require('../utils/autocomplete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acesso-add')
    .setDescription('Adiciona um acesso (login/senha) a um cliente')
    .addStringOption(option => 
      option.setName('cliente')
        .setDescription('Slug do cliente')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('plataforma')
        .setDescription('Ex: Instagram, Facebook, Meta Business')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('login')
        .setDescription('Usuário ou email'))
    .addStringOption(option => 
      option.setName('senha')
        .setDescription('Senha de acesso'))
    .addStringOption(option => 
      option.setName('link')
        .setDescription('URL de login'))
    .addStringOption(option => 
      option.setName('observacao')
        .setDescription('Notas sobre este acesso')),
  
  async autocomplete(interaction) {
    await handleClienteAutocomplete(interaction);
  },

  async execute(interaction) {
    const slug = interaction.options.getString('cliente').toLowerCase();
    const plataforma = interaction.options.getString('plataforma');
    const login = interaction.options.getString('login');
    const senha = interaction.options.getString('senha');
    const link = interaction.options.getString('link');
    const observacao = interaction.options.getString('observacao');

    try {
      clientesService.addAcesso(slug, {
        plataforma,
        login,
        senha,
        link,
        observacao
      });

      await interaction.reply(`✅ Acesso **${plataforma}** adicionado ao cliente \`${slug}\`!`);
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  },
};
