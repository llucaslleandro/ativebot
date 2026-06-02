const clientesService = require('../services/clientesService');

async function handleClienteAutocomplete(interaction) {
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const clientes = clientesService.getAll();
  
  const choices = Object.values(clientes).map(c => ({
    name: `${c.nome} (${c.slug})`,
    value: c.slug
  }));

  const filtered = choices.filter(choice => 
    choice.name.toLowerCase().includes(focusedValue) || 
    choice.value.toLowerCase().includes(focusedValue)
  ).slice(0, 25);

  await interaction.respond(filtered);
}

async function handleAcessoAutocomplete(interaction) {
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const clienteSlug = interaction.options.getString('cliente');
  
  if (!clienteSlug) {
    return interaction.respond([]);
  }

  const cliente = clientesService.getBySlug(clienteSlug);
  if (!cliente || !cliente.acessos) {
    return interaction.respond([]);
  }

  const choices = cliente.acessos.map(a => ({
    name: `${a.plataforma} (${a.login || 'sem login'})`,
    value: a.id
  }));

  const filtered = choices.filter(choice => 
    choice.name.toLowerCase().includes(focusedValue)
  ).slice(0, 25);

  await interaction.respond(filtered);
}

module.exports = {
  handleClienteAutocomplete,
  handleAcessoAutocomplete
};
