/**
 * MODELOS DE DADOS
 * Define as estruturas de dados e validações do sistema
 */

/**
 * Estrutura de uma Movimentação Financeira
 * @typedef {Object} Movimentacao
 * @property {number} id - Identificador único
 * @property {string} tipo - "receita" ou "despesa"
 * @property {string} categoria - Nome da categoria
 * @property {string} descricao - Descrição da movimentação
 * @property {number} valor - Valor em centavos (para evitar problemas de ponto flutuante)
 * @property {string} data - Data no formato YYYY-MM-DD
 * @property {number} condominioId - ID do condomínio
 */

/**
 * Estrutura de um Condomínio
 * @typedef {Object} Condominio
 * @property {number} id - Identificador único
 * @property {string} nome - Nome do condomínio
 * @property {Movimentacao[]} movimentacoes - Array de movimentações
 * @property {number} usuarioId - ID do usuário proprietário
 */

/**
 * Estrutura de um Usuário
 * @typedef {Object} Usuario
 * @property {number} id - Identificador único
 * @property {string} email - Email do usuário
 * @property {string} senha - Senha (hash simples)
 * @property {number[]} condominioIds - Array de IDs dos condomínios do usuário
 */

/**
 * Estrutura do Banco de Dados
 * @typedef {Object} Database
 * @property {Usuario[]} usuarios - Array de usuários
 * @property {Condominio[]} condominios - Array de condomínios
 * @property {string[]} categorias - Array de categorias disponíveis
 * @property {number} nextUsuarioId - Próximo ID de usuário
 * @property {number} nextCondominioId - Próximo ID de condomínio
 * @property {number} nextMovimentacaoId - Próximo ID de movimentação
 */

/**
 * Categorias padrão do sistema
 */
const CATEGORIAS_PADRAO = [
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
];

/**
 * Valida se uma data está no formato correto (YYYY-MM-DD)
 * @param {string} data - Data a ser validada
 * @returns {boolean}
 */
function validarData(data) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    
    const date = new Date(data);
    return date instanceof Date && !isNaN(date);
}

/**
 * Valida se um valor é numérico e positivo
 * @param {number|string} valor - Valor a ser validado
 * @returns {boolean}
 */
function validarValor(valor) {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return !isNaN(num) && num > 0;
}

/**
 * Cria uma nova movimentação validada
 * @param {Object} dados - Dados da movimentação
 * @returns {Movimentacao|null} Movimentação criada ou null se inválida
 */
function criarMovimentacao(dados) {
    const { tipo, categoria, descricao, valor, data, condominioId } = dados;
    
    // Validações
    if (!tipo || (tipo !== 'receita' && tipo !== 'despesa')) {
        throw new Error('Tipo deve ser "receita" ou "despesa"');
    }
    
    if (!categoria || categoria.trim() === '') {
        throw new Error('Categoria é obrigatória');
    }
    
    if (!descricao || descricao.trim() === '') {
        throw new Error('Descrição é obrigatória');
    }
    
    if (!validarValor(valor)) {
        throw new Error('Valor deve ser um número positivo');
    }
    
    if (!validarData(data)) {
        throw new Error('Data inválida. Use o formato YYYY-MM-DD');
    }
    
    if (!condominioId || typeof condominioId !== 'number') {
        throw new Error('ID do condomínio é obrigatório');
    }
    
    // Converte valor para centavos para evitar problemas de ponto flutuante
    const valorCentavos = Math.round(parseFloat(valor) * 100);
    
    return {
        id: 0, // Será definido pelo database
        tipo,
        categoria: categoria.trim(),
        descricao: descricao.trim(),
        valor: valorCentavos,
        data,
        condominioId
    };
}

/**
 * Valida se um email está no formato correto
 * @param {string} email - Email a ser validado
 * @returns {boolean}
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida se uma senha atende aos requisitos mínimos
 * @param {string} senha - Senha a ser validada
 * @returns {boolean}
 */
function validarSenha(senha) {
    return senha && senha.length >= 4;
}

/**
 * Cria um hash simples da senha (para produção, usar bcrypt ou similar)
 * @param {string} senha - Senha em texto plano
 * @returns {string} Hash da senha
 */
function hashSenha(senha) {
    // Hash simples - em produção usar biblioteca de hash adequada
    let hash = 0;
    for (let i = 0; i < senha.length; i++) {
        const char = senha.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

/**
 * Cria um novo usuário validado
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Usuario} Usuário criado
 */
function criarUsuario(email, senha) {
    if (!email || email.trim() === '') {
        throw new Error('Email é obrigatório');
    }
    
    if (!validarEmail(email)) {
        throw new Error('Email inválido');
    }
    
    if (!validarSenha(senha)) {
        throw new Error('Senha deve ter no mínimo 4 caracteres');
    }
    
    return {
        id: 0, // Será definido pelo database
        email: email.trim().toLowerCase(),
        senha: hashSenha(senha),
        condominioIds: []
    };
}

/**
 * Cria um novo condomínio validado
 * @param {string} nome - Nome do condomínio
 * @param {number} usuarioId - ID do usuário proprietário
 * @returns {Condominio|null} Condomínio criado ou null se inválido
 */
function criarCondominio(nome, usuarioId) {
    if (!nome || nome.trim() === '') {
        throw new Error('Nome do condomínio é obrigatório');
    }
    
    if (!usuarioId || typeof usuarioId !== 'number') {
        throw new Error('ID do usuário é obrigatório');
    }
    
    return {
        id: 0, // Será definido pelo database
        nome: nome.trim(),
        movimentacoes: [],
        usuarioId: usuarioId
    };
}

/**
 * Converte valor de centavos para reais
 * @param {number} centavos - Valor em centavos
 * @returns {number} Valor em reais
 */
function centavosParaReais(centavos) {
    return centavos / 100;
}

/**
 * Converte valor de reais para centavos
 * @param {number} reais - Valor em reais
 * @returns {number} Valor em centavos
 */
function reaisParaCentavos(reais) {
    return Math.round(reais * 100);
}

/**
 * Formata valor monetário para exibição
 * @param {number} centavos - Valor em centavos
 * @returns {string} Valor formatado (R$ X.XXX,XX)
 */
function formatarMoeda(centavos) {
    const reais = centavosParaReais(centavos);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(reais);
}

/**
 * Formata data para exibição
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

/**
 * Extrai mês e ano de uma data
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {Object} Objeto com mes e ano
 */
function extrairMesAno(data) {
    const [ano, mes] = data.split('-');
    return {
        mes: parseInt(mes, 10),
        ano: parseInt(ano, 10)
    };
}
