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
 */

/**
 * Estrutura do Banco de Dados
 * @typedef {Object} Database
 * @property {Condominio[]} condominios - Array de condomínios
 * @property {string[]} categorias - Array de categorias disponíveis
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
 * Cria um novo condomínio validado
 * @param {string} nome - Nome do condomínio
 * @returns {Condominio|null} Condomínio criado ou null se inválido
 */
function criarCondominio(nome) {
    if (!nome || nome.trim() === '') {
        throw new Error('Nome do condomínio é obrigatório');
    }
    
    return {
        id: 0, // Será definido pelo database
        nome: nome.trim(),
        movimentacoes: []
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
