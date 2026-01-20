# Sistema de Balancete de Condomínios

Sistema completo de gestão financeira para condomínios, desenvolvido com HTML5, Bootstrap 5 e JavaScript puro (Vanilla JS).

## 🚀 Funcionalidades

- ✅ Cadastro de condomínios
- ✅ Registro de receitas e despesas
- ✅ Cálculo automático de saldos
- ✅ Filtros por mês e ano
- ✅ Dashboard com totais em tempo real
- ✅ Persistência de dados via localStorage
- ✅ Interface responsiva e profissional

## 📁 Arquitetura do Projeto

O sistema foi desenvolvido seguindo princípios de **Arquitetura Limpa** e **Separação de Responsabilidades**:

```
balancete-condominio/
│
├── index.html              # Interface principal (Bootstrap 5)
├── assets/
│   ├── css/
│   │   └── custom.css      # Estilos personalizados
│   └── js/
│       ├── models.js       # Estruturas de dados e validações
│       ├── database.js     # Simulação de banco JSON (localStorage)
│       ├── services.js     # Regras de negócio e cálculos financeiros
│       ├── ui.js           # Manipulação de DOM e eventos
│       └── app.js          # Bootstrap e inicialização da aplicação
└── README.md
```

### 📦 Módulos e Responsabilidades

#### **models.js** - Modelos de Dados
- Define estruturas de dados (Condominio, Movimentacao, Database)
- Funções de validação (data, valor, campos obrigatórios)
- Funções utilitárias (formatação de moeda, data)
- Funções puras para criação de entidades

#### **database.js** - Camada de Persistência
- Gerencia operações CRUD (Create, Read, Update, Delete)
- Simula banco de dados JSON usando localStorage
- Garante integridade dos dados
- Funções: `carregarDatabase()`, `salvarDatabase()`, `adicionarCondominio()`, etc.

#### **services.js** - Regras de Negócio
- Cálculos financeiros (receitas, despesas, saldo)
- Filtros e consultas complexas
- Estatísticas e relatórios
- Funções puras e testáveis
- Funções: `calcularTotalReceitas()`, `calcularSaldo()`, `obterEstatisticas()`, etc.

#### **ui.js** - Camada de Apresentação
- Manipulação do DOM
- Event listeners e handlers
- Atualização de interface (dashboard, tabelas, formulários)
- Feedback visual (alertas, validações)
- Funções: `atualizarDashboard()`, `atualizarTabelaMovimentacoes()`, etc.

#### **app.js** - Orquestração
- Inicialização da aplicação
- Coordenação entre módulos
- Configuração inicial (data padrão, event listeners globais)

## 🎯 Princípios de Design Aplicados

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade única e bem definida
2. **Funções Puras**: Lógica de negócio isolada e testável
3. **Código Defensivo**: Validações e tratamento de erros em todas as camadas
4. **DRY (Don't Repeat Yourself)**: Funções reutilizáveis e sem duplicação
5. **Single Responsibility**: Cada função faz uma coisa e faz bem

## 💾 Modelo de Dados

O banco de dados (localStorage) armazena:

```json
{
  "condominios": [
    {
      "id": 1,
      "nome": "Condomínio Jardim Azul",
      "movimentacoes": [
        {
          "id": 101,
          "tipo": "receita",
          "categoria": "Condomínio",
          "descricao": "Taxa mensal",
          "valor": 500000,
          "data": "2026-01-10",
          "condominioId": 1
        }
      ]
    }
  ],
  "categorias": ["Condomínio", "Água", "Luz", ...],
  "nextCondominioId": 2,
  "nextMovimentacaoId": 102
}
```

**Nota**: Valores são armazenados em **centavos** para evitar problemas de ponto flutuante.

## 🔧 Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Adicione um condomínio
3. Selecione o condomínio
4. Adicione movimentações (receitas/despesas)
5. Visualize o dashboard e filtre por mês/ano

## 🚀 Migração para Backend Real

O sistema foi projetado para facilitar migração futura:

- **database.js** pode ser substituído por chamadas API
- **models.js** e **services.js** permanecem inalterados
- **ui.js** precisa apenas ajustar chamadas de persistência
- Estrutura de dados JSON é compatível com APIs REST

## 📝 Tecnologias Utilizadas

- HTML5
- Bootstrap 5.3.2
- Bootstrap Icons
- JavaScript ES6+ (Vanilla JS)
- localStorage API

## 🎨 Interface

- Design moderno e profissional
- Layout responsivo (mobile-first)
- Cards de dashboard com animações
- Tabelas interativas
- Formulários validados
- Feedback visual em tempo real

---

**Desenvolvido seguindo boas práticas de arquitetura limpa e código de produção.**
