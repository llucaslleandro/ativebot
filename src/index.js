require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

client.commands = new Collection();

// Carregar comandos e formatador
const { formatClientEmbed, createClientComponents } = require('./utils/formatters');
const clientesService = require('./services/clientesService');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
  }
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Pronto! Logado como ${readyClient.user.tag}`);
});

// Listener para detecção automática de slug
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  let query = message.content.trim().toLowerCase();
  
  if (query.startsWith('/')) {
    query = query.substring(1);
  }

  if (!query) return;
  
  // Tenta encontrar o cliente pela slug exata
  const clienteExato = clientesService.getBySlug(query);

  if (clienteExato) {
    try {
      const embed = formatClientEmbed(clienteExato);
      const components = createClientComponents(clienteExato);
      return await message.reply({ embeds: [embed], components });
    } catch (error) {
      console.error('Erro ao enviar embed:', error);
    }
  }

  // Se não encontrou exato, tenta busca parcial por slug ou nome
  const todosClientes = Object.values(clientesService.getAll());
  const matches = todosClientes.filter(c => 
    c.slug.toLowerCase().includes(query) || 
    c.nome.toLowerCase().includes(query)
  );

  if (matches.length === 1) {
    // Se encontrou apenas um, mostra direto
    try {
      const embed = formatClientEmbed(matches[0]);
      const components = createClientComponents(matches[0]);
      await message.reply({ embeds: [embed], components });
    } catch (error) {
      console.error('Erro ao enviar embed parcial:', error);
    }
  } else if (matches.length > 1 && matches.length <= 5) {
    // Se encontrou alguns, sugere
    const sugestoes = matches.map(c => `• \`${c.slug}\` (${c.nome})`).join('\n');
    await message.reply(`🔍 Encontrei vários clientes que combinam com **${query}**:\n${sugestoes}\n\n*Digite a slug exata para ver os detalhes.*`);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    const customId = interaction.customId;
    if (customId.startsWith('copy_access_')) {
      const slug = customId.replace('copy_access_', '');
      const cliente = clientesService.getBySlug(slug);
      
      if (!cliente || !cliente.acessos || cliente.acessos.length === 0) {
        return interaction.reply({ content: 'Este cliente não possui acessos cadastrados.', flags: [MessageFlags.Ephemeral] });
      }

      let text = `### 📋 Acessos de **${cliente.nome}**\n\n`;
      cliente.acessos.forEach(a => {
        text += `**${a.plataforma}**\n`;
        if (a.login) text += `Login:\n\`\`\`\n${a.login}\n\`\`\`\n`;
        if (a.senha) text += `Senha:\n\`\`\`\n${a.senha}\n\`\`\`\n`;
        if (!a.login && !a.senha) text += `*Sem credenciais cadastradas.*\n`;
        text += `\n`;
      });

      await interaction.reply({ content: text, flags: [MessageFlags.Ephemeral] });
    }
    return;
  }

  if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Erro ao executar comando:', error);
    
    const errorMessage = error.message && !error.message.includes('Unknown interaction') 
      ? `❌ Erro: ${error.message}` 
      : 'Houve um erro ao executar este comando!';

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, flags: [MessageFlags.Ephemeral] });
      } else {
        await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] });
      }
    } catch (replyError) {
      console.error('Erro ao enviar mensagem de erro secundária (interação expirada):', replyError.message);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
