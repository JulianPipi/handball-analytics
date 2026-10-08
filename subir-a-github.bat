@echo off
chcp 65001 >nul
title HandballOS - Subir a GitHub
color 0B

echo ================================================================
echo           HANDBALL ANALYTICS - SUBIDA MANUAL A GITHUB           
echo ================================================================
echo.
echo Repositorio destino: https://github.com/JulianPipi/handball-analytics.git
echo Rama: main
echo.

cd /d "C:\Users\Fede\.gemini\antigravity\scratch\handball-analytics"

echo [1/4] Comprobando cambios en el proyecto...
git status -s
echo.

echo [2/4] Preparando archivos para subir (git add .)...
git add .
echo [OK] Archivos preparados.
echo.

set /p userMsg="[3/4] Escribe un comentario del cambio (o presiona ENTER para usar automatico): "
if "%userMsg%"=="" (
    set userMsg=Actualizacion HandballOS %date% %time%
)

git commit -m "%userMsg%" >nul 2>&1
echo [OK] Cambios empaquetados: "%userMsg%"
echo.

echo [4/4] Subiendo cambios a GitHub (git push origin main)...
echo (Si es la primera vez, se abrira una ventana para iniciar sesion en GitHub)
echo.

git push origin main

if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo ================================================================
    echo           EXITO: PROYECTO SUBIDO CORRECTAMENTE A GITHUB!        
    echo ================================================================
    echo.
    echo 1. Tu codigo ya esta en tu repositorio:
    echo    https://github.com/JulianPipi/handball-analytics
    echo.
    echo 2. GitHub Actions esta compilando tu version para GitHub Pages:
    echo    https://github.com/JulianPipi/handball-analytics/actions
    echo.
    echo 3. Tu aplicacion web publica (visible en PC y Celular sin wifi local):
    echo    https://JulianPipi.github.io/handball-analytics/
    echo.
    echo (Nota: El despliegue de GitHub Pages suele demorar entre 1 y 2 minutos)
    echo ================================================================
) else (
    color 0C
    echo.
    echo ================================================================
    echo        ATENCION: OCURRIO UN ERROR AL SUBIR LOS CAMBIOS         
    echo ================================================================
    echo Posibles causas:
    echo - Ventana de inicio de sesion de GitHub cerrada o cancelada.
    echo - Sin conexion a internet.
    echo.
    echo Si te pide Token o Password: usa un Personal Access Token (PAT)
    echo de GitHub con permisos de 'repo'.
    echo ================================================================
)

echo.
pause
