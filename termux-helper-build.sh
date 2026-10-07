#!/bin/bash

# ╔════════════════════════════════════════════════════════════╗
# ║  TASK REMINDER - HELPER PARA COMPILAR EN TERMUX           ║
# ║  Menú interactivo para elegir método de compilación        ║
# ╚════════════════════════════════════════════════════════════╝

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     📱 TASK REMINDER - Compilador para Termux             ║"
echo "║                                                            ║"
echo "║     Compila tu APK directamente en Samsung S24 Ultra       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo ""
    echo "Instálalo con:"
    echo "  pkg install nodejs"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Node.js detectado: $(node --version)${NC}"
echo ""

# Menú principal
echo "¿Cómo quieres compilar tu APK?"
echo ""
echo "  1️⃣  EXPO CLI (Recomendado ⭐)"
echo "     └─ Compila en la nube"
echo "     └─ Rápido (~15 min)"
echo "     └─ APK listo para descargar"
echo ""
echo "  2️⃣  REACT NATIVE LOCAL"
echo "     └─ Compila en tu teléfono"
echo "     └─ Lento (~1-2 horas)"
echo "     └─ APK en: android/app/build/outputs/apk/release/"
echo ""
echo "  3️⃣  INSTALAR EXPO CLI"
echo "     └─ Prepara solo las herramientas"
echo "     └─ No compila, solo instala"
echo ""
echo "  4️⃣  VERIFICAR ESTADO"
echo "     └─ Ve qué está instalado"
echo "     └─ Diagnostica problemas"
echo ""
echo "  0️⃣  SALIR"
echo ""
read -p "Elige (0-4): " option

case $option in
    1)
        echo ""
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}OPCIÓN 1: EXPO CLI (Recomendado)${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo ""

        # Verificar si EAS CLI está instalado
        if ! command -v eas &> /dev/null; then
            echo -e "${BLUE}📦 Instalando EAS CLI...${NC}"
            npm install -g eas-cli
            echo ""
        fi

        echo -e "${CYAN}🔑 Necesitas una cuenta Expo (Gratis)${NC}"
        echo ""
        echo "Pasos:"
        echo "  1. Ve a: https://expo.io"
        echo "  2. Haz clic en 'Sign up'"
        echo "  3. Usa tu email para registrarte"
        echo ""
        read -p "¿Ya tienes cuenta Expo? (s/n): " has_account

        if [ "$has_account" = "s" ]; then
            echo ""
            echo -e "${BLUE}🔑 Iniciando sesión...${NC}"
            eas login
            echo ""

            echo -e "${BLUE}⏳ Compilando APK en la nube (esto toma ~15 minutos)...${NC}"
            echo ""
            eas build --platform android

            echo ""
            echo -e "${GREEN}✅ ¡Compilación completada!${NC}"
            echo ""
            echo "Tu APK está disponible en:"
            echo "  https://expo.io/dashboard"
            echo ""
            echo "Pasos finales:"
            echo "  1. Ve al dashboard de Expo"
            echo "  2. Descarga el APK a tu carpeta Descargas"
            echo "  3. Abre e instala en tu teléfono"
            echo ""
        else
            echo ""
            echo -e "${CYAN}📝 Registrándote en Expo...${NC}"
            echo ""
            echo "Se abrirá tu navegador. Completa el registro y luego vuelve."
            echo ""
            read -p "Presiona Enter cuando termines..."
            echo ""
            eas login
            echo ""

            echo -e "${BLUE}⏳ Compilando APK en la nube...${NC}"
            echo ""
            eas build --platform android

            echo ""
            echo -e "${GREEN}✅ ¡Compilación completada!${NC}"
            echo ""
            echo "Tu APK está disponible en: https://expo.io/dashboard"
        fi
        ;;

    2)
        echo ""
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}OPCIÓN 2: REACT NATIVE LOCAL${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo ""

        echo -e "${RED}⚠️  ADVERTENCIA:${NC}"
        echo "  • Compilar en Termux tarda 1-2 HORAS"
        echo "  • Usa mucha batería"
        echo "  • Requiere mucho espacio libre"
        echo ""
        echo -e "${CYAN}Te recomiendo usar Expo CLI en su lugar (opción 1)${NC}"
        echo ""

        read -p "¿Continuar de todas formas? (s/n): " confirm

        if [ "$confirm" = "s" ]; then
            echo ""
            echo -e "${BLUE}📱 Compilando en tu teléfono...${NC}"
            echo "(Esto tomará bastante tiempo, mantén el teléfono conectado)"
            echo ""

            npm run android

            echo ""
            echo -e "${GREEN}✅ ¡Compilación completada!${NC}"
            echo ""
            echo "Tu APK está en:"
            echo "  android/app/build/outputs/apk/release/app-release.apk"
            echo ""
            echo "Pasos finales:"
            echo "  1. Copia el APK a tu carpeta Descargas"
            echo "  2. Abre e instala"
            echo ""
        else
            echo ""
            echo "De acuerdo. Usa la opción 1 (Expo CLI) para compilar rápido."
        fi
        ;;

    3)
        echo ""
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}OPCIÓN 3: INSTALAR EXPO CLI${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo ""

        echo -e "${BLUE}📦 Instalando EAS CLI y Expo CLI...${NC}"
        echo ""

        npm install -g eas-cli expo-cli

        echo ""
        echo -e "${GREEN}✅ EAS CLI e Expo CLI instalados${NC}"
        echo ""
        echo "Ahora puedes:"
        echo "  • Ejecutar: eas build --platform android"
        echo "  • O ejecutar este script de nuevo y elegir opción 1"
        echo ""
        ;;

    4)
        echo ""
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}VERIFICACIÓN DE ESTADO${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
        echo ""

        # Node.js
        if command -v node &> /dev/null; then
            echo -e "${GREEN}✅ Node.js${NC}: $(node --version)"
        else
            echo -e "${RED}❌ Node.js${NC}: No instalado"
        fi

        # npm
        if command -v npm &> /dev/null; then
            echo -e "${GREEN}✅ npm${NC}: $(npm --version)"
        else
            echo -e "${RED}❌ npm${NC}: No instalado"
        fi

        # git
        if command -v git &> /dev/null; then
            echo -e "${GREEN}✅ git${NC}: instalado"
        else
            echo -e "${YELLOW}⚠️  git${NC}: No instalado (opcional)"
        fi

        # Expo CLI
        if command -v expo &> /dev/null; then
            echo -e "${GREEN}✅ Expo CLI${NC}: instalado"
        else
            echo -e "${YELLOW}⚠️  Expo CLI${NC}: No instalado"
        fi

        # EAS CLI
        if command -v eas &> /dev/null; then
            echo -e "${GREEN}✅ EAS CLI${NC}: instalado"
        else
            echo -e "${YELLOW}⚠️  EAS CLI${NC}: No instalado"
        fi

        # Espacio disponible
        echo ""
        echo -e "${BLUE}💾 Espacio disponible:${NC}"
        df -h $HOME | tail -n 1 | awk '{print "   " $4 " de " $2 " disponible"}'

        echo ""
        echo -e "${BLUE}📁 Tamaño del proyecto:${NC}"
        if [ -d "$HOME/TaskReminder" ]; then
            du -sh $HOME/TaskReminder | awk '{print "   " $1}'
        else
            echo "   (Proyecto no descargado aún)"
        fi

        echo ""
        ;;

    0)
        echo ""
        echo -e "${CYAN}👋 ¡Hasta luego!${NC}"
        echo ""
        exit 0
        ;;

    *)
        echo ""
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ ¡Gracias por usar Task Reminder!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
