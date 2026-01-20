/**
 * SIMULAÇÃO DE BANCO DE DADOS JSON
 * Gerencia persistência via localStorage e operações CRUD
 */

const STORAGE_KEY = 'balancete_condominio_db';

/**
 * Estrutura inicial do banco de dados
 */
function criarDatabaseInicial() {
    return {
        condominios: [],
        categorias: [
            'Condomínio',
            'Água',
            'Luz',
            'Gás',
            'Manutenção',
            'Salários',
            'Segurança',
            'Limpeza',
            'Administração',
            'Multas',
            'Outros'
        ],
        nextCondominioId: 1,
        nextMovimentacaoId: 1
    };
}

/**
 * Carrega o banco de dados do localStorage
 * @returns {Database} Banco de dados carregado ou inicial
 */
function carregarDatabase() {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (!dados) {
            return criarDatabaseInicial();
        }
        
        const db = JSON.parse(dados);
        
        // Garante que a estrutura está completa
        if (!db.condominios) db.condominios = [];
        if (!db.categorias) db.categorias = criarDatabaseInicial().categorias;
        if (!db.nextCondominioId) db.nextCondominioId = 1;
        if (!db.nextMovimentacaoId) db.nextMovimentacaoId = 1;
        
        return db;
    } catch (error) {
        console.error('Erro ao carregar banco de dados:', error);
        return criarDatabaseInicial();
    }
}

/**
 * Salva o banco de dados no localStorage
 * @param {Database} db - Banco de dados a ser salvo
 * @returns {boolean} true se salvou com sucesso
 */
function salvarDatabase(db) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        return true;
    } catch (error) {
        console.error('Erro ao salvar banco de dados:', error);
        return false;
    }
}

/**
 * Obtém todos os condomínios
 * @returns {Condominio[]} Array de condomínios
 */
function obterCondominios() {
    const db = carregarDatabase();
    return db.condominios;
}

/**
 * Obtém um condomínio por ID
 * @param {number} id - ID do condomínio
 * @returns {Condominio|undefined} Condomínio encontrado ou undefined
 */
function obterCondominioPorId(id) {
    const db = carregarDatabase();
    return db.condominios.find(c => c.id === id);
}

/**
 * Adiciona um novo condomínio
 * @param {Condominio} condominio - Condomínio a ser adicionado
 * @returns {Condominio} Condomínio adicionado com ID atribuído
 */
function adicionarCondominio(condominio) {
    const db = carregarDatabase();
    
    condominio.id = db.nextCondominioId++;
    db.condominios.push(condominio);
    
    salvarDatabase(db);
    return condominio;
}

/**
 * Atualiza um condomínio existente
 * @param {number} id - ID do condomínio
 * @param {Object} dados - Dados a serem atualizados
 * @returns {Condominio|undefined} Condomínio atualizado ou undefined
 */
function atualizarCondominio(id, dados) {
    const db = carregarDatabase();
    const condominio = db.condominios.find(c => c.id === id);
    
    if (!condominio) {
        return undefined;
    }
    
    if (dados.nome !== undefined) {
        condominio.nome = dados.nome.trim();
    }
    
    salvarDatabase(db);
    return condominio;
}

/**
 * Remove um condomínio
 * @param {number} id - ID do condomínio
 * @returns {boolean} true se removeu com sucesso
 */
function removerCondominio(id) {
    const db = carregarDatabase();
    const index = db.condominios.findIndex(c => c.id === id);
    
    if (index === -1) {
        return false;
    }
    
    db.condominios.splice(index, 1);
    salvarDatabase(db);
    return true;
}

/**
 * Obtém todas as movimentações de um condomínio
 * @param {number} condominioId - ID do condomínio
 * @returns {Movimentacao[]} Array de movimentações
 */
function obterMovimentacoes(condominioId) {
    const condominio = obterCondominioPorId(condominioId);
    return condominio ? condominio.movimentacoes : [];
}

/**
 * Adiciona uma movimentação a um condomínio
 * @param {number} condominioId - ID do condomínio
 * @param {Movimentacao} movimentacao - Movimentação a ser adicionada
 * @returns {Movimentacao|undefined} Movimentação adicionada ou undefined
 */
function adicionarMovimentacao(condominioId, movimentacao) {
    const db = carregarDatabase();
    const condominio = db.condominios.find(c => c.id === condominioId);
    
    if (!condominio) {
        return undefined;
    }
    
    movimentacao.id = db.nextMovimentacaoId++;
    movimentacao.condominioId = condominioId;
    condominio.movimentacoes.push(movimentacao);
    
    salvarDatabase(db);
    return movimentacao;
}

/**
 * Remove uma movimentação
 * @param {number} condominioId - ID do condomínio
 * @param {number} movimentacaoId - ID da movimentação
 * @returns {boolean} true se removeu com sucesso
 */
function removerMovimentacao(condominioId, movimentacaoId) {
    const db = carregarDatabase();
    const condominio = db.condominios.find(c => c.id === condominioId);
    
    if (!condominio) {
        return false;
    }
    
    const index = condominio.movimentacoes.findIndex(m => m.id === movimentacaoId);
    if (index === -1) {
        return false;
    }
    
    condominio.movimentacoes.splice(index, 1);
    salvarDatabase(db);
    return true;
}

/**
 * Obtém todas as categorias disponíveis
 * @returns {string[]} Array de categorias
 */
function obterCategorias() {
    const db = carregarDatabase();
    return db.categorias;
}

/**
 * Adiciona uma nova categoria
 * @param {string} categoria - Nome da categoria
 * @returns {boolean} true se adicionou com sucesso
 */
function adicionarCategoria(categoria) {
    if (!categoria || categoria.trim() === '') {
        return false;
    }
    
    const db = carregarDatabase();
    const nomeCategoria = categoria.trim();
    
    if (db.categorias.includes(nomeCategoria)) {
        return false; // Já existe
    }
    
    db.categorias.push(nomeCategoria);
    salvarDatabase(db);
    return true;
}

/**
 * Reseta o banco de dados (útil para testes)
 */
function resetarDatabase() {
    localStorage.removeItem(STORAGE_KEY);
}
