#!/usr/bin/env bash

# 🚀 Garagem.Com - SCRIPT DE INICIALIZAÇÃO
# Para usar: bash start.sh (em Git Bash no Windows)

echo "🍕 Garagem.Com - Sistema de Gestão PDV"
echo "======================================"
echo ""

# Verificar se Node está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale a partir de https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ NPM encontrado: $(npm --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""

# Criar/sincronizar banco de dados
echo "🗄️  Sincronizando banco de dados..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados sincronizado!"
else
    echo "❌ Erro ao sincronizar banco"
    exit 1
fi

echo ""

# Popular com dados de teste
echo "🌱 Populando com dados de teste..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Dados de teste inseridos!"
else
    echo "❌ Erro ao inserir dados de teste"
    exit 1
fi

echo ""
echo "======================================"
echo "🎉 Setup Completo!"
echo "======================================"
echo ""
echo "Para iniciar o servidor de desenvolvimento:"
echo ""
echo "  npm run dev"
echo ""
echo "Depois acesse:"
echo "  📱 Cardápio: http://localhost:3000/customer"
echo "  📊 PDV: http://localhost:3000/dashboard"
echo "  👨‍🍳 Cozinha: http://localhost:3000/kitchen"
echo "  ⚙️  Configurações: http://localhost:3000/admin/settings"
echo "  📈 Relatórios: http://localhost:3000/admin"
echo ""
echo "Boa sorte! 🚀"
