@echo off
echo ========================================
echo  Atualizando repositorio GitHub (SSH)
echo  git@github.com:brTux/novaonda.git
echo ========================================
echo.

REM Navegar para o diretorio do projeto
cd /d "%~dp0"

REM Atualizar remote para usar SSH
echo Atualizando URL do repositorio para SSH...
git remote set-url origin git@github.com:brTux/novaonda.git
echo.

REM Adicionar todos os arquivos
echo Adicionando arquivos...
git add .
echo.

REM Fazer commit
echo Fazendo commit...
git commit -m "feat: Hotmart theme + optimized layout + roadmap"
echo.

REM Fazer push
echo Enviando para GitHub via SSH...
git push -u origin main
echo.

echo ========================================
echo  Upload concluido com sucesso!
echo ========================================
pause
