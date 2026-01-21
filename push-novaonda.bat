@echo off
echo ========================================
echo  Push para GitHub - Nova Onda
echo  Repositorio: brTux/novaonda
echo  Branch: novaonda-dev
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando branch atual...
git branch
echo.

echo Criando/mudando para branch novaonda-dev...
git checkout -b novaonda-dev 2>nul || git checkout novaonda-dev
echo.

echo Adicionando arquivos...
git add .
echo.

echo Fazendo commit...
git commit -m "feat: Hotmart theme + optimized layout + roadmap"
echo.

echo Enviando para GitHub (branch: novaonda-dev)...
echo IMPORTANTE: Use as credenciais da conta brTux
echo Username: brTux
echo Password: [Personal Access Token]
echo.
git push -u origin novaonda-dev
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo  Upload concluido com sucesso!
    echo  Branch: novaonda-dev
    echo  URL: https://github.com/brTux/novaonda/tree/novaonda-dev
    echo ========================================
) else (
    echo ========================================
    echo  ERRO ao fazer push!
    echo  Verifique suas credenciais.
    echo ========================================
)
echo.
pause
