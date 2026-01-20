/**
 * SERVIÇOS E REGRAS DE NEGÓCIO
 * Contém toda a lógica de cálculo e processamento financeiro
 */

/**
 * Calcula o total de receitas de um condomínio
 * @param {Movimentacao[]} movimentacoes - Array de movimentações
 * @param {Object} filtro - Filtro opcional {mes, ano}
 * @returns {number} Total em centavos
 */
function calcularTotalReceitas(movimentacoes, filtro = null) {
    let receitas = movimentacoes.filter(m => m.tipo === 'receita');
    
    if (filtro) {
        receitas = filtrarPorMesAno(receitas, filtro.mes, filtro.ano);
    }
    
    return receitas.reduce((total, m) => total + m.valor, 0);
}

/**
 * Calcula o total de despesas de um condomínio
 * @param {Movimentacao[]} movimentacoes - Array de movimentações
 * @param {Object} filtro - Filtro opcional {mes, ano}
 * @returns {number} Total em centavos
 */
function calcularTotalDespesas(movimentacoes, filtro = null) {
    let despesas = movimentacoes.filter(m => m.tipo === 'despesa');
    
    if (filtro) {
        despesas = filtrarPorMesAno(despesas, filtro.mes, filtro.ano);
    }
    
    return despesas.reduce((total, m) => total + m.valor, 0);
}

/**
 * Calcula o saldo atual de um condomínio
 * @param {Movimentacao[]} movimentacoes - Array de movimentações
 * @param {Object} filtro - Filtro opcional {mes, ano}
 * @returns {number} Saldo em centavos (receitas - despesas)
 */
function calcularSaldo(movimentacoes, filtro = null) {
    const receitas = calcularTotalReceitas(movimentacoes, filtro);
    const despesas = calcularTotalDespesas(movimentacoes, filtro);
    return receitas - despesas;
}

/**
 * Filtra movimentações por mês e ano
 * @param {Movimentacao[]} movimentacoes - Array de movimentações
 * @param {number} mes - Mês (1-12) ou null para todos
 * @param {number} ano - Ano ou null para todos
 * @returns {Movimentacao[]} Movimentações filtradas
 */
function filtrarPorMesAno(movimentacoes, mes = null, ano = null) {
    if (!mes && !ano) {
        return movimentacoes;
    }
    
    return movimentacoes.filter(m => {
        const { mes: mesMov, ano: anoMov } = extrairMesAno(m.data);
        
        if (mes && mesMov !== mes) return false;
        if (ano && anoMov !== ano) return false;
        
        return true;
    });
}

/**
 * Obtém estatísticas financeiras de um condomínio
 * @param {number} condominioId - ID do condomínio
 * @param {Object} filtro - Filtro opcional {mes, ano}
 * @returns {Object} Objeto com totais e saldo
 */
function obterEstatisticas(condominioId, filtro = null) {
    const movimentacoes = obterMovimentacoes(condominioId);
    
    const receitas = calcularTotalReceitas(movimentacoes, filtro);
    const despesas = calcularTotalDespesas(movimentacoes, filtro);
    const saldo = calcularSaldo(movimentacoes, filtro);
    
    return {
        receitas,
        despesas,
        saldo,
        totalMovimentacoes: filtro 
            ? filtrarPorMesAno(movimentacoes, filtro.mes, filtro.ano).length
            : movimentacoes.length
    };
}

/**
 * Obtém movimentações filtradas de um condomínio
 * @param {number} condominioId - ID do condomínio
 * @param {Object} filtro - Filtro {mes, ano, tipo, categoria}
 * @returns {Movimentacao[]} Movimentações filtradas
 */
function obterMovimentacoesFiltradas(condominioId, filtro = {}) {
    let movimentacoes = obterMovimentacoes(condominioId);
    
    // Filtro por mês/ano
    if (filtro.mes || filtro.ano) {
        movimentacoes = filtrarPorMesAno(movimentacoes, filtro.mes, filtro.ano);
    }
    
    // Filtro por tipo
    if (filtro.tipo) {
        movimentacoes = movimentacoes.filter(m => m.tipo === filtro.tipo);
    }
    
    // Filtro por categoria
    if (filtro.categoria) {
        movimentacoes = movimentacoes.filter(m => m.categoria === filtro.categoria);
    }
    
    // Ordena por data (mais recente primeiro)
    movimentacoes.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
    });
    
    return movimentacoes;
}

/**
 * Obtém o mês e ano atual
 * @returns {Object} Objeto com mes e ano atual
 */
function obterMesAnoAtual() {
    const agora = new Date();
    return {
        mes: agora.getMonth() + 1,
        ano: agora.getFullYear()
    };
}

/**
 * Obtém lista de meses disponíveis nas movimentações
 * @param {number} condominioId - ID do condomínio
 * @returns {Object[]} Array de objetos {mes, ano, label}
 */
function obterMesesDisponiveis(condominioId) {
    const movimentacoes = obterMovimentacoes(condominioId);
    const mesesSet = new Set();
    
    movimentacoes.forEach(m => {
        const { mes, ano } = extrairMesAno(m.data);
        mesesSet.add(`${ano}-${String(mes).padStart(2, '0')}`);
    });
    
    const meses = Array.from(mesesSet)
        .map(str => {
            const [ano, mes] = str.split('-');
            return {
                mes: parseInt(mes, 10),
                ano: parseInt(ano, 10),
                label: `${String(mes).padStart(2, '0')}/${ano}`
            };
        })
        .sort((a, b) => {
            if (a.ano !== b.ano) return b.ano - a.ano;
            return b.mes - a.mes;
        });
    
    return meses;
}

/**
 * Valida se uma movimentação pode ser adicionada
 * @param {Object} dados - Dados da movimentação
 * @returns {Object} {valido: boolean, erro: string|null}
 */
function validarMovimentacao(dados) {
    try {
        criarMovimentacao(dados);
        return { valido: true, erro: null };
    } catch (error) {
        return { valido: false, erro: error.message };
    }
}
