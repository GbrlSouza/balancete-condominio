# Como Funciona o Armazenamento de Dados

## ⚠️ Importante: Por que não há arquivo database.json?

Por questões de **segurança do navegador**, não é possível que uma aplicação web (front-end) salve arquivos diretamente no sistema de arquivos do computador do usuário. Isso é uma proteção para evitar que sites maliciosos acessem ou modifiquem arquivos do seu computador.

## ✅ Como os dados são salvos?

O sistema usa **localStorage**, que é uma tecnologia nativa dos navegadores que permite armazenar dados localmente no navegador do usuário. Os dados são:

- ✅ **Persistentes**: Permanecem mesmo após fechar o navegador
- ✅ **Seguros**: Ficam apenas no seu navegador, não são enviados para servidor
- ✅ **Rápidos**: Acesso instantâneo aos dados
- ✅ **Privados**: Cada navegador tem seu próprio localStorage

## 📍 Onde os dados ficam salvos?

Os dados são salvos no **localStorage do navegador** com a chave: `balancete_condominio_db`

### Como visualizar os dados salvos:

1. Abra o navegador (Chrome, Firefox, Edge, etc.)
2. Pressione **F12** para abrir as Ferramentas de Desenvolvedor
3. Vá na aba **Application** (Chrome/Edge) ou **Storage** (Firefox)
4. No menu lateral, expanda **Local Storage**
5. Clique no domínio do site (ex: `file://` ou `localhost`)
6. Procure pela chave `balancete_condominio_db`
7. Clique nela para ver o JSON completo dos dados

### Como exportar os dados (criar um arquivo JSON):

1. Siga os passos acima para visualizar os dados
2. Copie o conteúdo do valor (é um JSON)
3. Cole em um editor de texto
4. Salve como `database.json`

### Como importar dados (restaurar de um arquivo JSON):

1. Abra o console do navegador (F12 → Console)
2. Cole e execute este código:

```javascript
// Substitua o JSON abaixo pelo conteúdo do seu arquivo database.json
const dados = {
  "usuarios": [...],
  "condominios": [...],
  "categorias": [...],
  "nextUsuarioId": 1,
  "nextCondominioId": 1,
  "nextMovimentacaoId": 1
};

localStorage.setItem('balancete_condominio_db', JSON.stringify(dados));
console.log('Dados importados com sucesso!');
location.reload();
```

## 🔧 Estrutura dos Dados

O sistema salva um objeto JSON com a seguinte estrutura:

```json
{
  "usuarios": [
    {
      "id": 1,
      "email": "usuario@email.com",
      "senha": "hash_da_senha",
      "condominioIds": [1, 2]
    }
  ],
  "condominios": [
    {
      "id": 1,
      "nome": "Condomínio Exemplo",
      "usuarioId": 1,
      "movimentacoes": [
        {
          "id": 1,
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
  "nextUsuarioId": 2,
  "nextCondominioId": 2,
  "nextMovimentacaoId": 2
}
```

## 🚨 Limpeza de Dados

### Limpar todos os dados:

1. Abra o console (F12 → Console)
2. Execute: `localStorage.removeItem('balancete_condominio_db')`
3. Recarregue a página (F5)

### Limpar sessão (logout):

O logout já limpa a sessão automaticamente. Os dados permanecem salvos, apenas a sessão de login é encerrada.

## 💡 Vantagens do localStorage

- ✅ Funciona offline (sem internet)
- ✅ Não precisa de servidor
- ✅ Dados ficam no seu computador
- ✅ Acesso rápido e instantâneo
- ✅ Compatível com todos os navegadores modernos

## ⚠️ Limitações

- ❌ Dados ficam apenas no navegador onde foram salvos
- ❌ Se limpar os dados do navegador, os dados são perdidos
- ❌ Não sincroniza entre dispositivos
- ❌ Limite de ~5-10MB por domínio

---

**Nota**: Para um sistema de produção com múltiplos usuários, seria necessário um backend (servidor) com banco de dados real. Este sistema foi projetado para uso local/individual.
