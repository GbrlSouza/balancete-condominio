/**
 * MANIPULAÇÃO DE DOM E INTERFACE
 * Gerencia toda a interação com a interface do usuário
 */

let condominioSelecionado = null;
let filtroAtual = { mes: null, ano: null };
let usuarioLogado = null;

const SESSION_KEY = 'balancete_usuario_logado';

/**
 * Inicializa a interface
 */
function inicializarUI() {
    if (!usuarioLogado) {
        return;
    }
    
    atualizarListaCondominios();
    atualizarDashboard();
    configurarEventListeners();
    
    // Seleciona o primeiro condomínio se existir
    const isAdmin = usuarioLogado.isAdmin || false;
    const usuarioId = isAdmin ? null : usuarioLogado.id;
    const condominios = obterCondominios(usuarioId, isAdmin);
    if (condominios.length > 0) {
        selecionarCondominio(condominios[0].id);
    }
}

/**
 * Configura os event listeners dos formulários e botões
 */
function configurarEventListeners() {
    // Formulário de novo condomínio
    const formCondominio = document.getElementById('formNovoCondominio');
    if (formCondominio) {
        formCondominio.addEventListener('submit', handleNovoCondominio);
    }
    
    // Formulário de nova movimentação
    const formMovimentacao = document.getElementById('formNovaMovimentacao');
    if (formMovimentacao) {
        formMovimentacao.addEventListener('submit', handleNovaMovimentacao);
    }
    
    // Botão de limpar filtros
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', limparFiltros);
    }
    
    // Filtros de mês e ano
    const selectMes = document.getElementById('filtroMes');
    const selectAno = document.getElementById('filtroAno');
    
    if (selectMes) {
        selectMes.addEventListener('change', aplicarFiltros);
    }
    
    if (selectAno) {
        selectAno.addEventListener('change', aplicarFiltros);
    }
    
    // Botão de logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
}

/**
 * Atualiza a lista de condomínios no select (apenas do usuário logado ou todos se for admin)
 */
function atualizarListaCondominios() {
    const select = document.getElementById('selectCondominio');
    if (!select) return;
    
    if (!usuarioLogado) {
        select.innerHTML = '<option value="">Faça login para ver condomínios</option>';
        return;
    }
    
    const isAdmin = usuarioLogado.isAdmin || false;
    const usuarioId = isAdmin ? null : usuarioLogado.id;
    const condominios = obterCondominios(usuarioId, isAdmin);
    
    select.innerHTML = '<option value="">Selecione um condomínio</option>';
    
    condominios.forEach(condominio => {
        const option = document.createElement('option');
        option.value = condominio.id;
        // Se for admin, mostra também o dono do condomínio
        const nomeExibicao = isAdmin 
            ? `${condominio.nome} (ID: ${condominio.usuarioId})`
            : condominio.nome;
        option.textContent = nomeExibicao;
        select.appendChild(option);
    });
    
    // Atualiza também o select do formulário de movimentação
    const selectMovimentacao = document.getElementById('movimentacaoCondominio');
    if (selectMovimentacao) {
        selectMovimentacao.innerHTML = '<option value="">Selecione um condomínio</option>';
        condominios.forEach(condominio => {
            const option = document.createElement('option');
            option.value = condominio.id;
            const nomeExibicao = isAdmin 
                ? `${condominio.nome} (ID: ${condominio.usuarioId})`
                : condominio.nome;
            option.textContent = nomeExibicao;
            if (condominioSelecionado && condominio.id === condominioSelecionado) {
                option.selected = true;
            }
            selectMovimentacao.appendChild(option);
        });
    }
}

/**
 * Seleciona um condomínio e atualiza a interface
 * @param {number} condominioId - ID do condomínio
 */
function selecionarCondominio(condominioId) {
    condominioSelecionado = condominioId;
    
    const select = document.getElementById('selectCondominio');
    if (select) {
        select.value = condominioId;
    }
    
    const selectMovimentacao = document.getElementById('movimentacaoCondominio');
    if (selectMovimentacao) {
        selectMovimentacao.value = condominioId;
    }
    
    atualizarDashboard();
    atualizarTabelaMovimentacoes();
    atualizarFiltros();
}

/**
 * Atualiza o dashboard com os cards de estatísticas
 */
function atualizarDashboard() {
    if (!condominioSelecionado) {
        limparDashboard();
        return;
    }
    
    const estatisticas = obterEstatisticas(condominioSelecionado, filtroAtual);
    
    atualizarCard('cardReceitas', estatisticas.receitas, 'Total de Receitas');
    atualizarCard('cardDespesas', estatisticas.despesas, 'Total de Despesas');
    atualizarCard('cardSaldo', estatisticas.saldo, 'Saldo Atual', estatisticas.saldo < 0);
}

/**
 * Limpa o dashboard quando não há condomínio selecionado
 */
function limparDashboard() {
    atualizarCard('cardReceitas', 0, 'Total de Receitas');
    atualizarCard('cardDespesas', 0, 'Total de Despesas');
    atualizarCard('cardSaldo', 0, 'Saldo Atual');
}

/**
 * Atualiza um card do dashboard
 * @param {string} cardId - ID do elemento do card
 * @param {number} valor - Valor em centavos
 * @param {string} titulo - Título do card
 * @param {boolean} negativo - Se deve destacar como negativo
 */
function atualizarCard(cardId, valor, titulo, negativo = false) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const valorElement = card.querySelector('.card-valor');
    const tituloElement = card.querySelector('.card-titulo');
    
    if (valorElement) {
        valorElement.textContent = formatarMoeda(valor);
        
        // Remove classes de cor anteriores
        valorElement.classList.remove('text-success', 'text-danger', 'text-primary');
        
        // Aplica cor baseada no tipo
        if (negativo) {
            valorElement.classList.add('text-danger');
        } else if (cardId === 'cardSaldo') {
            valorElement.classList.add('text-primary');
        } else if (cardId === 'cardReceitas') {
            valorElement.classList.add('text-success');
        } else {
            valorElement.classList.add('text-danger');
        }
    }
    
    if (tituloElement) {
        tituloElement.textContent = titulo;
    }
}

/**
 * Atualiza a tabela de movimentações
 */
function atualizarTabelaMovimentacoes() {
    const tbody = document.getElementById('tbodyMovimentacoes');
    if (!tbody) return;
    
    if (!condominioSelecionado) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Selecione um condomínio para visualizar as movimentações</td></tr>';
        return;
    }
    
    const movimentacoes = obterMovimentacoesFiltradas(condominioSelecionado, filtroAtual);
    
    if (movimentacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma movimentação encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = movimentacoes.map(m => criarLinhaMovimentacao(m)).join('');
}

/**
 * Cria o HTML de uma linha da tabela de movimentações
 * @param {Movimentacao} movimentacao - Movimentação a ser exibida
 * @returns {string} HTML da linha
 */
function criarLinhaMovimentacao(movimentacao) {
    const tipoClass = movimentacao.tipo === 'receita' ? 'success' : 'danger';
    const tipoIcon = movimentacao.tipo === 'receita' ? '↑' : '↓';
    const tipoLabel = movimentacao.tipo === 'receita' ? 'Receita' : 'Despesa';
    
    return `
        <tr>
            <td>${formatarData(movimentacao.data)}</td>
            <td>
                <span class="badge bg-${tipoClass}">${tipoIcon} ${tipoLabel}</span>
            </td>
            <td>${movimentacao.categoria}</td>
            <td>${movimentacao.descricao}</td>
            <td class="text-end ${movimentacao.tipo === 'receita' ? 'text-success' : 'text-danger'}">
                ${movimentacao.tipo === 'receita' ? '+' : '-'}${formatarMoeda(movimentacao.valor)}
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="removerMovimentacaoUI(${movimentacao.condominioId}, ${movimentacao.id})" title="Remover">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

/**
 * Atualiza os filtros de mês e ano
 */
function atualizarFiltros() {
    if (!condominioSelecionado) return;
    
    const meses = obterMesesDisponiveis(condominioSelecionado);
    const selectMes = document.getElementById('filtroMes');
    const selectAno = document.getElementById('filtroAno');
    
    // Preenche anos disponíveis
    if (selectAno) {
        const anos = [...new Set(meses.map(m => m.ano))].sort((a, b) => b - a);
        selectAno.innerHTML = '<option value="">Todos os anos</option>';
        anos.forEach(ano => {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            if (filtroAtual.ano === ano) {
                option.selected = true;
            }
            selectAno.appendChild(option);
        });
    }
    
    // Preenche meses disponíveis (filtrados por ano se selecionado)
    if (selectMes) {
        const anoFiltrado = filtroAtual.ano;
        const mesesFiltrados = anoFiltrado 
            ? meses.filter(m => m.ano === anoFiltrado)
            : meses;
        
        selectMes.innerHTML = '<option value="">Todos os meses</option>';
        mesesFiltrados.forEach(mes => {
            const option = document.createElement('option');
            option.value = mes.mes;
            option.textContent = mes.label;
            if (filtroAtual.mes === mes.mes) {
                option.selected = true;
            }
            selectMes.appendChild(option);
        });
    }
}

/**
 * Aplica os filtros selecionados
 */
function aplicarFiltros() {
    const selectMes = document.getElementById('filtroMes');
    const selectAno = document.getElementById('filtroAno');
    
    filtroAtual.mes = selectMes && selectMes.value ? parseInt(selectMes.value, 10) : null;
    filtroAtual.ano = selectAno && selectAno.value ? parseInt(selectAno.value, 10) : null;
    
    atualizarDashboard();
    atualizarTabelaMovimentacoes();
}

/**
 * Limpa os filtros
 */
function limparFiltros() {
    filtroAtual = { mes: null, ano: null };
    
    const selectMes = document.getElementById('filtroMes');
    const selectAno = document.getElementById('filtroAno');
    
    if (selectMes) selectMes.value = '';
    if (selectAno) selectAno.value = '';
    
    atualizarDashboard();
    atualizarTabelaMovimentacoes();
    atualizarFiltros();
}

/**
 * Handler para criação de novo condomínio
 * @param {Event} event - Evento do formulário
 */
function handleNovoCondominio(event) {
    event.preventDefault();
    
    if (!usuarioLogado) {
        mostrarAlerta('Faça login para adicionar condomínios', 'danger');
        return;
    }
    
    // Admin não pode criar condomínios (apenas visualizar)
    if (usuarioLogado.isAdmin) {
        mostrarAlerta('Administrador não pode criar condomínios. Apenas visualização.', 'warning');
        return;
    }
    
    const input = document.getElementById('nomeCondominio');
    const nome = input.value.trim();
    
    if (!nome) {
        mostrarAlerta('Nome do condomínio é obrigatório', 'danger');
        return;
    }
    
    try {
        const condominio = criarCondominio(nome, usuarioLogado.id);
        const condominioAdicionado = adicionarCondominio(condominio);
        
        atualizarListaCondominios();
        selecionarCondominio(condominioAdicionado.id);
        
        input.value = '';
        mostrarAlerta('Condomínio adicionado com sucesso!', 'success');
    } catch (error) {
        mostrarAlerta(error.message, 'danger');
    }
}

/**
 * Handler para criação de nova movimentação
 * @param {Event} event - Evento do formulário
 */
function handleNovaMovimentacao(event) {
    event.preventDefault();
    
    const condominioId = parseInt(document.getElementById('movimentacaoCondominio').value, 10);
    const tipo = document.getElementById('movimentacaoTipo').value;
    const categoria = document.getElementById('movimentacaoCategoria').value;
    const descricao = document.getElementById('movimentacaoDescricao').value.trim();
    const valor = parseFloat(document.getElementById('movimentacaoValor').value);
    const data = document.getElementById('movimentacaoData').value;
    
    const validacao = validarMovimentacao({
        tipo,
        categoria,
        descricao,
        valor,
        data,
        condominioId
    });
    
    if (!validacao.valido) {
        mostrarAlerta(validacao.erro, 'danger');
        return;
    }
    
    try {
        const movimentacao = criarMovimentacao({
            tipo,
            categoria,
            descricao,
            valor,
            data,
            condominioId
        });
        
        adicionarMovimentacao(condominioId, movimentacao);
        
        // Limpa o formulário
        event.target.reset();
        if (condominioSelecionado) {
            document.getElementById('movimentacaoCondominio').value = condominioSelecionado;
        }
        
        atualizarDashboard();
        atualizarTabelaMovimentacoes();
        atualizarFiltros();
        
        mostrarAlerta('Movimentação adicionada com sucesso!', 'success');
    } catch (error) {
        mostrarAlerta(error.message, 'danger');
    }
}

/**
 * Remove uma movimentação via UI
 * @param {number} condominioId - ID do condomínio
 * @param {number} movimentacaoId - ID da movimentação
 */
function removerMovimentacaoUI(condominioId, movimentacaoId) {
    if (!confirm('Tem certeza que deseja remover esta movimentação?')) {
        return;
    }
    
    if (removerMovimentacao(condominioId, movimentacaoId)) {
        atualizarDashboard();
        atualizarTabelaMovimentacoes();
        mostrarAlerta('Movimentação removida com sucesso!', 'success');
    } else {
        mostrarAlerta('Erro ao remover movimentação', 'danger');
    }
}

/**
 * Mostra um alerta na interface
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo do alerta (success, danger, etc)
 */
function mostrarAlerta(mensagem, tipo = 'info') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} alert-dismissible fade show`;
    alert.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.innerHTML = '';
    container.appendChild(alert);
    
    // Remove o alerta após 5 segundos
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Atualiza as categorias no select
 */
function atualizarCategorias() {
    const select = document.getElementById('movimentacaoCategoria');
    if (!select) return;
    
    const categorias = obterCategorias();
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });
}

/**
 * Verifica se há um usuário logado na sessão
 * @returns {Usuario|null} Usuário logado ou null
 */
function verificarSessao() {
    try {
        const usuarioIdStr = sessionStorage.getItem(SESSION_KEY);
        if (!usuarioIdStr) {
            return null;
        }
        
        // Se for "admin", retorna usuário admin
        if (usuarioIdStr === 'admin') {
            return criarUsuarioAdmin();
        }
        
        const usuarioId = parseInt(usuarioIdStr, 10);
        const usuario = obterUsuarioPorId(usuarioId);
        return usuario || null;
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return null;
    }
}

/**
 * Realiza login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Object} {sucesso: boolean, erro: string|null}
 */
function fazerLogin(email, senha) {
    if (!email || !senha) {
        return { sucesso: false, erro: 'Email e senha são obrigatórios' };
    }
    
    const usuario = autenticarUsuario(email, senha);
    if (!usuario) {
        return { sucesso: false, erro: 'Email ou senha incorretos' };
    }
    
    usuarioLogado = usuario;
    // Se for admin, salva como "admin", senão salva o ID
    const sessionValue = usuario.isAdmin ? 'admin' : usuario.id.toString();
    sessionStorage.setItem(SESSION_KEY, sessionValue);
    
    return { sucesso: true, erro: null };
}

/**
 * Realiza logout do usuário
 */
function fazerLogout() {
    usuarioLogado = null;
    condominioSelecionado = null;
    sessionStorage.removeItem(SESSION_KEY);
    mostrarTelaLogin();
    limparDashboard();
    atualizarTabelaMovimentacoes();
}

/**
 * Mostra a tela de login (modal)
 */
function mostrarTelaLogin() {
    const modalElement = document.getElementById('modalLogin');
    if (!modalElement) {
        console.error('Modal de login não encontrado!');
        return;
    }
    
    // Verifica se o Bootstrap está carregado
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap não está carregado!');
        return;
    }
    
    try {
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
    } catch (error) {
        console.error('Erro ao mostrar modal:', error);
        // Fallback: mostra o modal diretamente
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        document.body.classList.add('modal-open');
    }
}

/**
 * Esconde a tela de login e mostra o conteúdo principal
 */
function esconderTelaLogin() {
    const modalElement = document.getElementById('modalLogin');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
    
    // Mostra o conteúdo principal
    const conteudoPrincipal = document.getElementById('conteudoPrincipal');
    if (conteudoPrincipal) {
        conteudoPrincipal.style.display = 'block';
    }
    
    atualizarInfoUsuario();
}

/**
 * Atualiza as informações do usuário na interface
 */
function atualizarInfoUsuario() {
    const usuarioEmail = document.getElementById('usuarioEmail');
    if (usuarioEmail && usuarioLogado) {
        const emailExibicao = usuarioLogado.isAdmin 
            ? `${usuarioLogado.email} (ADMIN)`
            : usuarioLogado.email;
        usuarioEmail.textContent = emailExibicao;
    }
    
    const infoUsuario = document.getElementById('infoUsuario');
    if (infoUsuario) {
        infoUsuario.style.display = usuarioLogado ? 'inline' : 'none';
        // Destaca visualmente se for admin
        if (usuarioLogado && usuarioLogado.isAdmin) {
            infoUsuario.classList.add('text-warning');
            infoUsuario.style.fontWeight = 'bold';
        }
    }
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.style.display = usuarioLogado ? 'inline-block' : 'none';
    }
    
    // Mostra/oculta badge de admin e campo de novo condomínio
    const adminBadge = document.getElementById('adminBadge');
    const containerNovoCondominio = document.getElementById('containerNovoCondominio');
    
    if (usuarioLogado && usuarioLogado.isAdmin) {
        if (adminBadge) adminBadge.style.display = 'inline';
        if (containerNovoCondominio) containerNovoCondominio.style.display = 'none';
    } else {
        if (adminBadge) adminBadge.style.display = 'none';
        if (containerNovoCondominio) containerNovoCondominio.style.display = 'block';
    }
}

/**
 * Handler para o formulário de login
 * @param {Event} event - Evento do formulário
 */
function handleLogin(event) {
    event.preventDefault();
    console.log('handleLogin chamado');
    
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    
    console.log('Tentando fazer login com:', email);
    
    if (!email || !senha) {
        mostrarAlerta('Por favor, preencha email e senha', 'danger');
        return;
    }
    
    const resultado = fazerLogin(email, senha);
    console.log('Resultado do login:', resultado);
    
    if (resultado.sucesso) {
        esconderTelaLogin();
        inicializarUI();
        atualizarCategorias();
        atualizarInfoUsuario();
        mostrarAlerta('Login realizado com sucesso!', 'success');
        
        // Limpa o formulário
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginSenha').value = '';
    } else {
        mostrarAlerta(resultado.erro, 'danger');
    }
}

/**
 * Handler para o formulário de cadastro
 * @param {Event} event - Evento do formulário
 */
function handleCadastro(event) {
    event.preventDefault();
    console.log('handleCadastro chamado');
    
    const email = document.getElementById('cadastroEmail').value.trim();
    const senha = document.getElementById('cadastroSenha').value;
    const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;
    
    console.log('Tentando cadastrar:', email);
    
    if (!email || !senha) {
        mostrarAlerta('Por favor, preencha todos os campos', 'danger');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarAlerta('As senhas não coincidem', 'danger');
        return;
    }
    
    try {
        console.log('Criando usuário...');
        const usuario = criarUsuario(email, senha);
        console.log('Usuário criado, adicionando ao banco...');
        adicionarUsuario(usuario);
        console.log('Usuário adicionado com sucesso!');
        
        // Faz login automaticamente após cadastro
        const resultado = fazerLogin(email, senha);
        console.log('Resultado do login após cadastro:', resultado);
        
        if (resultado.sucesso) {
            esconderTelaLogin();
            inicializarUI();
            atualizarCategorias();
            atualizarInfoUsuario();
            mostrarAlerta('Cadastro realizado com sucesso!', 'success');
            
            // Limpa o formulário
            document.getElementById('cadastroEmail').value = '';
            document.getElementById('cadastroSenha').value = '';
            document.getElementById('cadastroConfirmarSenha').value = '';
        } else {
            mostrarAlerta('Cadastro realizado, mas erro ao fazer login: ' + resultado.erro, 'warning');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        mostrarAlerta(error.message, 'danger');
    }
}
