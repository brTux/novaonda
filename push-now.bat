@echo off
echo ========================================
echo  Fazendo Push para GitHub
echo  https://github.com/brTux/novaonda
echo ========================================
echo.

cd /d "%~dp0"

echo Adicionando arquivos...
git add .
echo.

echo Fazendo commit...
git commit -m "feat: Hotmart theme + optimized layout + roadmap"
echo.

echo Enviando para GitHub...
echo IMPORTANTE: Use as credenciais da conta brTux
echo Username: brTux
echo Password: [Personal Access Token]
echo.
git push -u origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo  Upload concluido com sucesso!
    echo ========================================
) else (
    echo ========================================
    echo  ERRO ao fazer push!
    echo  Verifique suas credenciais.
    echo ========================================
)
echo.
pause
