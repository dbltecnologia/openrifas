#!/bin/bash

# Define o nome do diretório temporário
WWW_DIR="www"

# Cria o diretório temporário se não existir
mkdir -p $WWW_DIR

# Copia os arquivos necessários para o diretório temporário
echo "Copiando arquivos para o diretório temporário..."
cp -r css firebase.json fonts functions images index.html manifest.json minhas-reservas pagamento README.md robots.txt script.sh sorteio sw.js vencedores vendor $WWW_DIR

echo "Arquivos copiados para o diretório temporário."

# Verifica se o diretório temporário contém arquivos
if [ "$(ls -A $WWW_DIR)" ]; then
    # Navega até o diretório temporário

    # Executa o comando necessário para preparar os arquivos para o deploy no Firebase Hosting
    # Por padrão, o diretório public é utilizado
    # Se seu diretório public for diferente, substitua o 'public' pelo nome correto
    firebase deploy --only hosting

    # Navega de volta para o diretório inicial
    cd ..

    # Remove o diretório temporário
    rm -rf $WWW_DIR

    echo "Deploy concluído e diretório temporário removido."
else
    echo "Nenhum arquivo encontrado para deploy."
fi
