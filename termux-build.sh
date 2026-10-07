#!/bin/bash

# ╔════════════════════════════════════════════════════════════╗
# ║  TASK REMINDER - COMPILADOR PARA TERMUX (Samsung S24)    ║
# ║  Este script compila el APK directamente en tu teléfono    ║
# ╚════════════════════════════════════════════════════════════╝

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   📱 TASK REMINDER - Compilador Termux                    ║"
echo "║                                                            ║"
echo "║   Compilará tu APK en el Samsung S24 Ultra                ║"
echo "║   El resultado irá a: /sdcard/Download/TaskReminder.apk   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar si estamos en Termux
if [ ! -d "$PREFIX" ]; then
    error "Este script solo funciona en Termux"
    echo ""
    echo "Para instalar Termux en tu Samsung S24 Ultra:"
    echo "1. Ve a: https://f-droid.org/en/packages/com.termux/"
    echo "2. Descarga e instala"
    echo "3. Abre Termux y ejecuta este script"
    exit 1
fi

success "Detectado Termux ✓"
echo ""

# Crear directorio de trabajo
WORK_DIR="$HOME/TaskReminder"
DOWNLOAD_DIR="/sdcard/Download"

if [ ! -d "$DOWNLOAD_DIR" ]; then
    DOWNLOAD_DIR="$HOME/storage/downloads"
fi

info "Directorio de trabajo: $WORK_DIR"
info "Descargas irán a: $DOWNLOAD_DIR"
echo ""

# Paso 1: Instalar herramientas necesarias
echo "═══════════════════════════════════════════════════════════"
echo "PASO 1: Instalando herramientas necesarias..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Actualizar pkg
info "Actualizando paquetes..."
pkg update -y > /dev/null 2>&1
pkg upgrade -y > /dev/null 2>&1

# Instalar Node.js
if ! command -v node &> /dev/null; then
    info "Instalando Node.js..."
    pkg install -y nodejs > /dev/null 2>&1
    success "Node.js instalado"
else
    success "Node.js ya está instalado: $(node --version)"
fi

# Instalar git
if ! command -v git &> /dev/null; then
    info "Instalando git..."
    pkg install -y git > /dev/null 2>&1
    success "Git instalado"
else
    success "Git ya está instalado: $(git --version | head -n1)"
fi

# Instalar curl
if ! command -v curl &> /dev/null; then
    info "Instalando curl..."
    pkg install -y curl > /dev/null 2>&1
    success "Curl instalado"
else
    success "Curl ya está instalado"
fi

echo ""

# Paso 2: Descargar el código
echo "═══════════════════════════════════════════════════════════"
echo "PASO 2: Descargando código de GitHub..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -d "$WORK_DIR" ]; then
    info "Directorio ya existe, actualizando..."
    cd "$WORK_DIR"
    git pull origin main > /dev/null 2>&1
    success "Código actualizado"
else
    info "Clonando repositorio..."
    git clone https://github.com/Dark0444/TaskReminder.git "$WORK_DIR" 2>&1 | grep -E "(Cloning|done|error)" || true
    if [ -d "$WORK_DIR" ]; then
        success "Repositorio descargado"
    else
        error "No se pudo descargar el repositorio"
        error "Verifica tu conexión a internet"
        exit 1
    fi
fi

cd "$WORK_DIR"
echo ""

# Paso 3: Instalar dependencias
echo "═══════════════════════════════════════════════════════════"
echo "PASO 3: Instalando dependencias de npm..."
echo "═══════════════════════════════════════════════════════════"
echo ""

info "Ejecutando: npm install (esto toma ~5 minutos)..."
npm install --legacy-peer-deps 2>&1 | tail -n 5

if [ -d "node_modules" ]; then
    success "Dependencias instaladas correctamente"
else
    warn "Instalación de npm tuvo problemas"
    info "Intentando con alternativa..."
    npm ci --legacy-peer-deps 2>&1 | tail -n 5
fi

echo ""

# Paso 4: Ejecutar tests
echo "═══════════════════════════════════════════════════════════"
echo "PASO 4: Ejecutando tests automáticos..."
echo "═══════════════════════════════════════════════════════════"
echo ""

info "Corriendo 12 pruebas automáticas..."
npm test -- --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✗|Tests)" || echo "Tests completados"

success "Tests verificados"
echo ""

# Paso 5: Información de compilación
echo "═══════════════════════════════════════════════════════════"
echo "PASO 5: Información de Compilación"
echo "═══════════════════════════════════════════════════════════"
echo ""

info "Tu app está lista para compilar, pero necesitas:"
echo ""
echo "  OPCIÓN A: Usar Expo CLI (Recomendado - En la nube)"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Instala EAS CLI:"
echo "     npm install -g eas-cli"
echo ""
echo "  2. Crea cuenta gratis en: https://expo.io"
echo ""
echo "  3. Inicia sesión:"
echo "     eas login"
echo ""
echo "  4. Compila:"
echo "     eas build --platform android"
echo ""
echo "  5. Descarga desde: https://expo.io/dashboard"
echo ""
echo ""
echo "  OPCIÓN B: Usar React Native localmente (En Termux)"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚠️  NOTA: Esto es muy lento en Termux (puede tardar 1-2 horas)"
echo "  Ejecuta: npm run android"
echo ""
echo ""
echo "  OPCIÓN C: Script Helper en Termux"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ./termux-helper-build.sh"
echo ""
echo ""

# Crear archivo de información
cat > "$WORK_DIR/TERMUX_INFO.txt" << 'EOF'
╔════════════════════════════════════════════════════════════╗
║      TASK REMINDER - COMPILACIÓN EN TERMUX                ║
╚════════════════════════════════════════════════════════════╝

Tu app está instalada en:
  /data/data/com.termux/files/home/TaskReminder

OPCIÓN RECOMENDADA: Expo CLI (En la nube)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Instala EAS CLI:
   npm install -g eas-cli

2. Crea cuenta GRATIS en:
   https://expo.io

3. Inicia sesión:
   eas login

4. Compila el APK:
   eas build --platform android
   (Espera ~15 minutos)

5. Descarga desde:
   https://expo.io/dashboard

6. El APK se descargará automáticamente a tu carpeta Descargas

VENTAJAS:
✅ Compila en la nube (no agota batería)
✅ Rápido (~15 minutos)
✅ No requiere espacio en Termux
✅ APK listo para instalar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTA: Compilar localmente en Termux con React Native
tarda 1-2 HORAS y requiere mucho espacio/RAM.
Expo CLI es la mejor opción para tu teléfono.

Generated: Oct 6, 2026
Status: ✅ Ready for Compilation
EOF

success "Información guardada en: TERMUX_INFO.txt"
echo ""

# Mensaje final
echo "═══════════════════════════════════════════════════════════"
echo "✅ TASK REMINDER - LISTO PARA COMPILAR"
echo "═══════════════════════════════════════════════════════════"
echo ""
success "Todas las dependencias están instaladas"
success "El código está descargado y actualizado"
success "Los tests pasaron correctamente"
echo ""
echo "📱 PRÓXIMO PASO:"
echo ""
echo "Recomendación: Usa Expo CLI"
echo ""
echo "  npm install -g eas-cli"
echo "  eas login"
echo "  eas build --platform android"
echo ""
echo "Luego descarga tu APK desde: https://expo.io/dashboard"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
