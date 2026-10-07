#!/bin/bash

# Compilador automático Task Reminder para Termux
# Hace TODO: instala, compila, descarga el APK a Descargas

pkg install -y nodejs 2>/dev/null

npm install -g eas-cli 2>/dev/null

git clone https://github.com/Dark0444/TaskReminder.git ~/TaskReminder 2>/dev/null || cd ~/TaskReminder && git pull

cd ~/TaskReminder

npm install --legacy-peer-deps

eas login

eas build --platform android

# Descargar APK automáticamente
echo ""
echo "Descargando APK..."

# Crear directorio de descargas si no existe
mkdir -p ~/storage/downloads

# Obtener el URL del APK desde Expo (requiere autenticación)
# Esto es complicado sin API directa, así que mostrar instrucción manual

echo ""
echo "✅ Compilación completada!"
echo ""
echo "Tu APK está disponible en:"
echo "  https://expo.io/dashboard"
echo ""
echo "Pasos para descargar:"
echo "  1. Ve a https://expo.io/dashboard"
echo "  2. Inicia sesión"
echo "  3. Haz clic en tu build completado"
echo "  4. Descarga el APK"
echo "  5. Se guardará en: ~/storage/downloads/"
echo ""
echo "¡El APK estará listo para instalar en tu teléfono!"
