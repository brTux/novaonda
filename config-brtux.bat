@echo off
echo ========================================
echo  Configurando credenciais do GitHub
echo  Conta: brTux
echo ========================================
echo.

cd /d "%~dp0"

echo Limpando credenciais antigas...
git credential-cache exit
git config --global --unset credential.helper
echo.

echo Configurando usuario Git como brTux...
git config user.name "brTux"
git config user.email "seu-email-do-brtux@email.com"
echo.

echo Atualizando remote...
git remote set-url origin https://github.com/brTux/novaonda.git
echo.

echo ========================================
echo  Configuracao concluida!
echo  Agora execute: git-push.bat
echo ========================================
echo.
echo IMPORTANTE: Quando executar git-push.bat,
echo use as credenciais da conta brTux:
echo   Username: brTux
echo   Password: [Personal Access Token da conta brTux]
echo.
pause
