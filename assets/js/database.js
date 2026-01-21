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
        usuarios: [],
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
        nextUsuarioId: 1,
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
        
        // Garante que a estrutura está completa (migração de versões antigas)
        if (!db.usuarios) db.usuarios = [];
        if (!db.condominios) db.condominios = [];
        if (!db.categorias) db.categorias = criarDatabaseInicial().categorias;
        if (!db.nextUsuarioId) db.nextUsuarioId = 1;
        if (!db.nextCondominioId) db.nextCondominioId = 1;
        if (!db.nextMovimentacaoId) db.nextMovimentacaoId = 1;
        
        // Migração: se condomínios antigos não têm usuarioId, atribui ao primeiro usuário ou cria um padrão
        if (db.condominios.length > 0 && db.condominios.some(c => !c.usuarioId)) {
            if (db.usuarios.length === 0) {
                // Cria usuário padrão para dados antigos
                const usuarioPadrao = {
                    id: 1,
                    email: 'admin@condominio.com',
                    senha: hashSenha('admin123'),
                    condominioIds: []
                };
                db.usuarios.push(usuarioPadrao);
                db.nextUsuarioId = 2;
            }
            
            const primeiroUsuarioId = db.usuarios[0].id;
            db.condominios.forEach(condominio => {
                if (!condominio.usuarioId) {
                    condominio.usuarioId = primeiroUsuarioId;
                    if (!db.usuarios[0].condominioIds.includes(condominio.id)) {
                        db.usuarios[0].condominioIds.push(condominio.id);
                    }
                }
            });
        }
        
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
        const dadosJson = JSON.stringify(db);
        localStorage.setItem(STORAGE_KEY, dadosJson);
        console.log('Banco de dados salvo com sucesso!', {
            usuarios: db.usuarios.length,
            condominios: db.condominios.length
        });
        return true;
    } catch (error) {
        console.error('Erro ao salvar banco de dados:', error);
        return false;
    }
}

/**
 * Obtém todos os condomínios de um usuário
 * @param {number} usuarioId - ID do usuário (ou null/0 para admin)
 * @param {boolean} isAdmin - Se o usuário é admin
 * @returns {Condominio[]} Array de condomínios do usuário ou todos se for admin
 */
function obterCondominios(usuarioId, isAdmin = false) {
    const db = carregarDatabase();
    
    // Se for admin, retorna todos os condomínios
    if (isAdmin) {
        return db.condominios;
    }
    
    if (!usuarioId) {
        return [];
    }
    
    return db.condominios.filter(c => c.usuarioId === usuarioId);
}

/**
 * Obtém todos os condomínios (sem filtro - uso interno)
 * @returns {Condominio[]} Array de todos os condomínios
 */
function obterTodosCondominios() {
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
    
    // Adiciona o ID do condomínio ao array do usuário
    const usuario = db.usuarios.find(u => u.id === condominio.usuarioId);
    if (usuario && !usuario.condominioIds.includes(condominio.id)) {
        usuario.condominioIds.push(condominio.id);
    }
    
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
    const condominio = db.condominios.find(c => c.id === id);
    
    if (!condominio) {
        return false;
    }
    
    // Remove do array de condomínios
    const index = db.condominios.findIndex(c => c.id === id);
    db.condominios.splice(index, 1);
    
    // Remove do array do usuário
    const usuario = db.usuarios.find(u => u.id === condominio.usuarioId);
    if (usuario) {
        const condIndex = usuario.condominioIds.indexOf(id);
        if (condIndex > -1) {
            usuario.condominioIds.splice(condIndex, 1);
        }
    }
    
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
 * Obtém um usuário por email
 * @param {string} email - Email do usuário
 * @returns {Usuario|undefined} Usuário encontrado ou undefined
 */
function obterUsuarioPorEmail(email) {
    const db = carregarDatabase();
    return db.usuarios.find(u => u.email === email.toLowerCase());
}

/**
 * Obtém um usuário por ID
 * @param {number} id - ID do usuário
 * @returns {Usuario|undefined} Usuário encontrado ou undefined
 */
function obterUsuarioPorId(id) {
    const db = carregarDatabase();
    return db.usuarios.find(u => u.id === id);
}

/**
 * Adiciona um novo usuário
 * @param {Usuario} usuario - Usuário a ser adicionado
 * @returns {Usuario} Usuário adicionado com ID atribuído
 */
function adicionarUsuario(usuario) {
    const db = carregarDatabase();
    
    // Verifica se o email já existe
    if (obterUsuarioPorEmail(usuario.email)) {
        throw new Error('Email já cadastrado');
    }
    
    usuario.id = db.nextUsuarioId++;
    db.usuarios.push(usuario);
    
    console.log('Adicionando usuário ao banco:', {
        id: usuario.id,
        email: usuario.email,
        totalUsuarios: db.usuarios.length
    });
    
    const salvou = salvarDatabase(db);
    if (!salvou) {
        throw new Error('Erro ao salvar usuário no banco de dados');
    }
    
    return usuario;
}

/**
 * Verifica se é o usuário administrador
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha em texto plano
 * @returns {boolean} true se for admin
 */
function ehAdmin(email, senha) {
    return email.toLowerCase() === 'admin@email.com' && senha === '123456';
}

/**
 * Cria um objeto de usuário admin virtual
 * @returns {Usuario} Usuário admin
 */
function criarUsuarioAdmin() {
    return {
        id: 0, // ID especial para admin
        email: 'admin@email.com',
        senha: '', // Não precisa de hash
        condominioIds: [],
        isAdmin: true
    };
}

/**
 * Autentica um usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha em texto plano
 * @returns {Usuario|undefined} Usuário autenticado ou undefined
 */
function autenticarUsuario(email, senha) {
    // Verifica se é admin primeiro
    if (ehAdmin(email, senha)) {
        return criarUsuarioAdmin();
    }
    
    const usuario = obterUsuarioPorEmail(email);
    if (!usuario) {
        return undefined;
    }
    
    const senhaHash = hashSenha(senha);
    if (usuario.senha !== senhaHash) {
        return undefined;
    }
    
    return usuario;
}

/**
 * Reseta o banco de dados (útil para testes)
 */
function resetarDatabase() {
    localStorage.removeItem(STORAGE_KEY);
}
