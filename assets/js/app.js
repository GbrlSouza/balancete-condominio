/**
 * BOOTSTRAP DA APLICAÇÃO
 * Inicializa e coordena todos os módulos do sistema
 */

/**
 * Inicializa a aplicação quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Inicializa a interface
        inicializarUI();
        
        // Atualiza categorias no formulário
        atualizarCategorias();
        
        // Configura data padrão como hoje
        const inputData = document.getElementById('movimentacaoData');
        if (inputData) {
            const hoje = new Date().toISOString().split('T')[0];
            inputData.value = hoje;
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
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        mostrarAlerta('Erro ao inicializar o sistema. Recarregue a página.', 'danger');
    }
});
