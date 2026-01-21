@echo off
echo ========================================
echo  Atualizando repositorio GitHub
echo  https://github.com/brTux/novaonda.git
echo ========================================
echo.

REM Navegar para o diretorio do projeto
cd /d "%~dp0"

REM Verificar se Git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Git nao encontrado!
    echo Por favor, reinicie o terminal ou VS Code.
    pause
    exit /b 1
)

REM Verificar se ja e um repositorio Git
if not exist ".git" (
    echo Inicializando repositorio Git...
    git init
    echo.
)

REM Configurar usuario (ajuste se necessario)
echo Configurando usuario Git...
git config user.name "Brendon Freitas"
git config user.email "brendon@novaonda.com"
echo.

REM Adicionar remote se nao existir
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Adicionando repositorio remoto...
    git remote add origin https://github.com/brTux/novaonda.git
) else (
    echo Atualizando URL do repositorio remoto...
    git remote set-url origin https://github.com/brTux/novaonda.git
)
echo.

REM Adicionar todos os arquivos
echo Adicionando arquivos...
git add .
echo.

REM Fazer commit
echo Fazendo commit...
git commit -m "feat: Hotmart theme + optimized layout + roadmap"
echo.

REM Renomear branch para main
echo Configurando branch principal...
git branch -M main
echo.

REM Fazer push
echo Enviando para GitHub...
git push -u origin main --force
echo.

echo ========================================
echo  Upload concluido com sucesso!
echo ========================================
pause
