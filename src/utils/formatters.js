const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function formatClientEmbed(cliente) {
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`📦 ${cliente.nome}`)
    .setDescription(cliente.observacoes || 'Sem observações.')
    .addFields(
      { name: 'Status', value: cliente.status || 'N/A', inline: true },
      { name: 'Responsável', value: cliente.responsavel || 'N/A', inline: true },
      { name: 'Cidade', value: cliente.cidade || 'N/A', inline: true },
      { name: 'Plano', value: cliente.plano || 'N/A', inline: true },
      { name: 'Slug', value: `\`${cliente.slug}\``, inline: true }
    )
    .setTimestamp();

  // Acessos
  if (cliente.acessos && cliente.acessos.length > 0) {
    const acessosList = cliente.acessos.map(a => 
      `**${a.plataforma}**\n👤 Login: \`${a.login || '-'}\`\n🔑 Senha: \`${a.senha || '-'}\`\n🔗 Link: ${a.link || '-'}${a.observacao ? `\n📝 *${a.observacao}*` : ''}`
    ).join('\n\n');
    embed.addFields({ name: '🔐 Acessos cadastrados', value: acessosList });
  } else {
    embed.addFields({ name: '🔐 Acessos cadastrados', value: 'Nenhum acesso cadastrado.' });
  }

  // Links
  if (cliente.links && cliente.links.length > 0) {
    const linksList = cliente.links.map(l => 
      `[${l.nome}](${l.url})`
    ).join(' | ');
    embed.addFields({ name: '🔗 Links úteis', value: linksList });
  } else {
    embed.addFields({ name: '🔗 Links úteis', value: 'Nenhum link cadastrado.' });
  }

  // Notas
  if (cliente.notas && cliente.notas.length > 0) {
    const notasList = cliente.notas.map(n => 
      `• ${n.texto} (${new Date(n.criadoEm).toLocaleDateString('pt-BR')})`
    ).join('\n');
    embed.addFields({ name: '🧾 Notas internas', value: notasList });
  } else {
    embed.addFields({ name: '🧾 Notas internas', value: 'Nenhuma nota cadastrada.' });
  }

  return embed;
}

function createClientComponents(cliente) {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`copy_access_${cliente.slug}`)
        .setLabel('📋 Copiar Acessos')
        .setStyle(ButtonStyle.Secondary),
    );

  return [row];
}

module.exports = {
  formatClientEmbed,
  createClientComponents
};
