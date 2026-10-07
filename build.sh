#!/bin/bash

# Task Reminder - APK Build Script
# Este script te ayuda a compilar el APK en tu computadora

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Task Reminder - APK Build Script                   ║"
echo "║                                                            ║"
echo "║  Compilador automático para tu aplicación de tareas        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Descárgalo de: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Menú de opciones
echo "Elige cómo deseas compilar:"
echo ""
echo "1️⃣  Expo CLI (Recomendado - Compila en la nube)"
echo "2️⃣  Android Studio (Local - Control total)"
echo "3️⃣  Verificar dependencias"
echo "0️⃣  Salir"
echo ""
read -p "Opción (0-3): " option

case $option in
    1)
        echo ""
        echo "🚀 Compilando con Expo CLI..."
        echo ""

        # Instalar EAS CLI si no existe
        if ! command -v eas &> /dev/null; then
            echo "📦 Instalando EAS CLI..."
            npm install -g eas-cli expo-cli
        fi

        echo "🔑 Iniciando sesión en Expo..."
        echo "   (Necesitas cuenta gratis en https://expo.io)"
        eas login

        echo ""
        echo "⏳ Compilando... Este proceso toma ~15 minutos"
        echo ""
        eas build --platform android

        echo ""
        echo "✅ ¡Compilación completada!"
        echo "Descarga tu APK desde: https://expo.io/dashboard"
        ;;

    2)
        echo ""
        echo "🛠️  Compilación Local"
        echo ""
        echo "Requiere:"
        echo "  • Android Studio instalado"
        echo "  • ANDROID_HOME configurado"
        echo "  • Java 11+ instalado"
        echo ""
        read -p "¿Continuar? (s/n): " confirm

        if [ "$confirm" = "s" ]; then
            echo ""
            echo "📦 Instalando dependencias..."
            npm install

            echo ""
            echo "⏳ Compilando APK..."
            npm run android

            echo ""
            echo "✅ ¡APK compilado!"
            echo "Ubicación: android/app/build/outputs/apk/release/app-release.apk"
        fi
        ;;

    3)
        echo ""
        echo "🔍 Verificando dependencias..."
        echo ""

        # Node.js
        if command -v node &> /dev/null; then
            echo "✅ Node.js: $(node --version)"
        else
            echo "❌ Node.js: No instalado"
        fi

        # npm
        if command -v npm &> /dev/null; then
            echo "✅ npm: $(npm --version)"
        else
            echo "❌ npm: No instalado"
        fi

        # Java
        if command -v java &> /dev/null; then
            echo "✅ Java: $(java -version 2>&1 | head -1)"
        else
            echo "⚠️  Java: No instalado (Necesario para compilación local)"
        fi

        # Android SDK
        if [ -n "$ANDROID_HOME" ]; then
            echo "✅ Android SDK: Configurado en $ANDROID_HOME"
        else
            echo "⚠️  Android SDK: No configurado"
        fi

        # Git
        if command -v git &> /dev/null; then
            echo "✅ Git: $(git --version)"
        else
            echo "⚠️  Git: No instalado"
        fi

        echo ""
        echo "Para compilación local, necesitas:"
        echo "  1. Android Studio: https://developer.android.com/studio"
        echo "  2. Java 11+: https://www.oracle.com/java/technologies/downloads/"
        echo "  3. Configurar ANDROID_HOME"
        ;;

    0)
        echo "👋 ¡Hasta luego!"
        exit 0
        ;;

    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📱 Cuando tengas el APK:"
echo ""
echo "1. Transferir a Samsung S24 Ultra (USB o email)"
echo "2. Abre Gestor de Archivos → Busca el APK"
echo "3. Toca el archivo → Instalar"
echo "4. Acepta los permisos"
echo "5. ¡A usar la app!"
echo "═══════════════════════════════════════════════════════════"
