const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_PATH = process.env.CLIENTES_DATA_PATH
  ? path.resolve(process.env.CLIENTES_DATA_PATH)
  : path.join(__dirname, '../data/clientes.json');

let cachedData = null;

function readData() {
  if (cachedData) return cachedData;
  try {
    if (!fs.existsSync(DATA_PATH)) {
      cachedData = {};
      return cachedData;
    }
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    cachedData = JSON.parse(data);
    return cachedData;
  } catch (error) {
    console.error('Erro ao ler o banco de dados:', error);
    return {};
  }
}

function saveData(data) {
  try {
    cachedData = data;
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar o banco de dados:', error);
  }
}

const clientesService = {
  getAll: () => {
    return readData();
  },

  getBySlug: (slug) => {
    const data = readData();
    const s = slug.toLowerCase();
    
    // Tenta busca direta por chave (mais rápido)
    if (data[s]) return data[s];

    // Busca exaustiva pela propriedade 'slug' caso a chave seja diferente
    return Object.values(data).find(c => c.slug && c.slug.toLowerCase() === s) || null;
  },

  create: (clientData) => {
    const data = readData();
    const slug = clientData.slug.toLowerCase();

    if (data[slug]) {
      throw new Error(`Já existe um cliente com o slug "${slug}".`);
    }

    const now = new Date().toISOString();
    
    data[slug] = {
      ...clientData,
      slug,
      acessos: [],
      links: [],
      notas: [],
      criadoEm: now,
      atualizadoEm: now
    };

    saveData(data);
    return data[slug];
  },

  addAcesso: (slug, acesso) => {
    const data = readData();
    const s = slug.toLowerCase();
    
    // Encontrar a chave real no objeto (pode ser o slug ou o nome antigo)
    let key = s;
    if (!data[s]) {
      key = Object.keys(data).find(k => data[k].slug && data[k].slug.toLowerCase() === s);
    }

    if (!key || !data[key]) {
      throw new Error(`Cliente "${slug}" não encontrado.`);
    }

    const novoAcesso = {
      id: crypto.randomUUID(),
      ...acesso,
      criadoEm: new Date().toISOString()
    };

    data[key].acessos.push(novoAcesso);
    data[key].atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return novoAcesso;
  },

  addLink: (slug, link) => {
    const data = readData();
    const s = slug.toLowerCase();
    
    let key = s;
    if (!data[s]) {
      key = Object.keys(data).find(k => data[k].slug && data[k].slug.toLowerCase() === s);
    }

    if (!key || !data[key]) {
      throw new Error(`Cliente "${slug}" não encontrado.`);
    }

    const novoLink = {
      id: crypto.randomUUID(),
      ...link,
      criadoEm: new Date().toISOString()
    };

    data[key].links.push(novoLink);
    data[key].atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return novoLink;
  },

  addNota: (slug, texto) => {
    const data = readData();
    const s = slug.toLowerCase();
    
    let key = s;
    if (!data[s]) {
      key = Object.keys(data).find(k => data[k].slug && data[k].slug.toLowerCase() === s);
    }

    if (!key || !data[key]) {
      throw new Error(`Cliente "${slug}" não encontrado.`);
    }

    const novaNota = {
      id: crypto.randomUUID(),
      texto,
      criadoEm: new Date().toISOString()
    };

    data[key].notas.push(novaNota);
    data[key].atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return novaNota;
  },

  update: (slug, updateData) => {
    const data = readData();
    const s = slug.toLowerCase();
    
    let key = s;
    if (!data[s]) {
      key = Object.keys(data).find(k => data[k].slug && data[k].slug.toLowerCase() === s);
    }

    if (!key || !data[key]) {
      throw new Error(`Cliente "${slug}" não encontrado.`);
    }

    // Atualiza apenas os campos fornecidos, exceto listas e campos protegidos
    const protectedFields = ['slug', 'acessos', 'links', 'notas', 'criadoEm'];
    
    Object.keys(updateData).forEach(field => {
      if (!protectedFields.includes(field) && updateData[field] !== undefined && updateData[field] !== null) {
        data[key][field] = updateData[field];
      }
    });

    data[key].atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return data[key];
  },

  updateAcesso: (slug, acessoId, updateData) => {
    const data = readData();
    const cliente = data[slug.toLowerCase()];
    if (!cliente) throw new Error('Cliente não encontrado.');
    
    const index = cliente.acessos.findIndex(a => a.id === acessoId);
    if (index === -1) throw new Error('Acesso não encontrado.');
    
    cliente.acessos[index] = { ...cliente.acessos[index], ...updateData, atualizadoEm: new Date().toISOString() };
    cliente.atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return cliente.acessos[index];
  },

  deleteAcesso: (slug, acessoId) => {
    const data = readData();
    const cliente = data[slug.toLowerCase()];
    if (!cliente) throw new Error('Cliente não encontrado.');
    
    cliente.acessos = cliente.acessos.filter(a => a.id !== acessoId);
    cliente.atualizadoEm = new Date().toISOString();
    
    saveData(data);
  },

  updateLink: (slug, linkId, updateData) => {
    const data = readData();
    const cliente = data[slug.toLowerCase()];
    if (!cliente) throw new Error('Cliente não encontrado.');
    
    const index = cliente.links.findIndex(l => l.id === linkId);
    if (index === -1) throw new Error('Link não encontrado.');
    
    cliente.links[index] = { ...cliente.links[index], ...updateData };
    cliente.atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return cliente.links[index];
  },

  deleteLink: (slug, linkId) => {
    const data = readData();
    const cliente = data[slug.toLowerCase()];
    if (!cliente) throw new Error('Cliente não encontrado.');
    
    cliente.links = cliente.links.filter(l => l.id !== linkId);
    cliente.atualizadoEm = new Date().toISOString();
    
    saveData(data);
  },

  updateNota: (slug, notaId, texto) => {
    const data = readData();
    const cliente = data[slug.toLowerCase()];
    if (!cliente) throw new Error('Cliente não encontrado.');
    
    const index = cliente.notas.findIndex(n => n.id === notaId);
    if (index === -1) throw new Error('Nota não encontrada.');
    
    cliente.notas[index].texto = texto;
    cliente.atualizadoEm = new Date().toISOString();
    
    saveData(data);
    return cliente.notas[index];
  },

  deleteNota: (slug, notaId) => {
    const data = readData();
    const cliente = data[slug.toLowerCase()];
    if (!cliente) throw new Error('Cliente não encontrado.');
    
    cliente.notas = cliente.notas.filter(n => n.id !== notaId);
    cliente.atualizadoEm = new Date().toISOString();
    
    saveData(data);
  },

  delete: (slug) => {
    const data = readData();
    const s = slug.toLowerCase();
    
    let key = s;
    if (!data[s]) {
      key = Object.keys(data).find(k => data[k].slug && data[k].slug.toLowerCase() === s);
    }

    if (!key || !data[key]) {
      throw new Error(`Cliente "${slug}" não encontrado.`);
    }

    delete data[key];
    saveData(data);
  }
};

module.exports = clientesService;
