@echo off
title Subir Handball Analytics a GitHub
echo ========================================================
echo   Subiendo proyecto a GitHub (JulianPipi/handball-analytics)
echo ========================================================
echo.
cd /d "%~dp0"
echo Verificando estado de Git...
git status
echo.
echo Enviando cambios a la rama main de GitHub...
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  LISTO: El proyecto se subio exitosamente a GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo  HUBO UN DETALLE:
    echo  Si es la primera vez que subes, se abrira una ventana
    echo  en tu navegador pidiendote autorizar tu cuenta de GitHub.
    echo ========================================================
)
echo.
pause
