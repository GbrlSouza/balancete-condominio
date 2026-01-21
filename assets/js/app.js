/**
 * BOOTSTRAP DA APLICAÇÃO
 * Inicializa e coordena todos os módulos do sistema
 */

/**
 * Inicializa a aplicação quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação...');
    
    try {
        // Função de inicialização
        function inicializar() {
            console.log('Iniciando verificação de sessão...');
            
            // Verifica se há usuário logado na sessão
            usuarioLogado = verificarSessao();
            console.log('Usuário logado:', usuarioLogado);
            
            if (usuarioLogado) {
                // Usuário já está logado, mostra o conteúdo
                console.log('Usuário já logado, mostrando conteúdo...');
                esconderTelaLogin();
                inicializarUI();
                atualizarCategorias();
                atualizarInfoUsuario();
            } else {
                // Mostra o modal de login (unificado com cadastro)
                console.log('Nenhum usuário logado, mostrando modal de login...');
                mostrarTelaLogin();
            }
            
            // Configura data padrão como hoje
            const inputData = document.getElementById('movimentacaoData');
            if (inputData) {
                const hoje = new Date().toISOString().split('T')[0];
                inputData.value = hoje;
            }
            
            // Configura event listeners dos formulários de login e cadastro (ANTES do login)
            // Usa uma abordagem mais direta e confiável
            const btnEntrar = document.getElementById('btnEntrar');
            if (btnEntrar) {
                btnEntrar.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Entrar clicado!');
                    handleLogin(e);
                    return false;
                };
                console.log('✓ Botão Entrar configurado');
            } else {
                console.error('✗ Botão Entrar não encontrado!');
            }
            
            const formLogin = document.getElementById('formLogin');
            if (formLogin) {
                formLogin.onsubmit = function(e) {
                    e.preventDefault();
                    console.log('Formulário de login submetido!');
                    handleLogin(e);
                    return false;
                };
                console.log('✓ Formulário de login configurado');
            }
            
            const btnCadastrar = document.getElementById('btnCadastrar');
            if (btnCadastrar) {
                btnCadastrar.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Cadastrar clicado!');
                    handleCadastro(e);
                    return false;
                };
                console.log('✓ Botão Cadastrar configurado');
            } else {
                console.error('✗ Botão Cadastrar não encontrado!');
            }
            
            const formCadastro = document.getElementById('formCadastro');
            if (formCadastro) {
                formCadastro.onsubmit = function(e) {
                    e.preventDefault();
                    console.log('Formulário de cadastro submetido!');
                    handleCadastro(e);
                    return false;
                };
                console.log('✓ Formulário de cadastro configurado');
            }
            
            // Handler para mudança de condomínio selecionado
            const selectCondominio = document.getElementById('selectCondominio');
            if (selectCondominio) {
                selectCondominio.addEventListener('change', function() {
                    const condominioId = parseInt(this.value, 10);
                    if (condominioId) {
                        selecionarCondominio(condominioId);
                    } else {
                        condominioSelecionado = null;
                        limparDashboard();
                        atualizarTabelaMovimentacoes();
                    }
                });
            }
            
            console.log('Sistema de Balancete de Condomínios inicializado com sucesso!');
        }
        
        // Verifica se Bootstrap está carregado
        if (typeof bootstrap !== 'undefined') {
            console.log('Bootstrap detectado, inicializando...');
            setTimeout(inicializar, 100);
        } else {
            console.log('Aguardando Bootstrap carregar...');
            // Aguarda o Bootstrap carregar
            let tentativas = 0;
            const verificarBootstrap = setInterval(function() {
                tentativas++;
                if (typeof bootstrap !== 'undefined') {
                    console.log('Bootstrap carregado após', tentativas, 'tentativas');
                    clearInterval(verificarBootstrap);
                    inicializar();
                } else if (tentativas > 20) {
                    console.error('Bootstrap não carregou após 2 segundos!');
                    clearInterval(verificarBootstrap);
                    alert('Erro: Bootstrap não carregou. Verifique sua conexão e recarregue a página.');
                }
            }, 100);
        }
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        alert('Erro ao inicializar: ' + error.message);
    }
});
