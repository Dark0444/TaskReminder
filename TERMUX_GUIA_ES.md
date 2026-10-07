# 📱 Guía: Compilar Task Reminder en Termux (Samsung S24 Ultra)

¡Excelente, Josué! Vamos a compilar tu app directamente en tu teléfono usando **Termux**.

---

## 🎯 Plan Rápido

| Paso | Tiempo | Qué Hace |
|------|--------|----------|
| 1. Instalar Termux | 5 min | Descargar app desde F-Droid |
| 2. Ejecutar script | 10 min | Descargar código y dependencias |
| 3. Compilar con Expo | 15 min | Generar APK en la nube |
| 4. Descargar APK | 2 min | Traer a tu carpeta Descargas |
| 5. Instalar app | 3 min | Instalar en tu teléfono |
| **Total** | **~35 minutos** | ✅ App lista para usar |

---

## 📥 Paso 1: Instalar Termux (5 min)

Termux es una terminal Linux completa en tu teléfono.

### Opción A: F-Droid (Recomendado - Gratis)
1. Ve a: https://f-droid.org
2. Busca "Termux"
3. Haz clic en "Instalar"
4. Espera a que se instale
5. ¡Abre Termux!

### Opción B: GitHub (Alternativa)
1. Ve a: https://github.com/termux/termux-app
2. Descarga el APK
3. Instala como app normal

---

## 🚀 Paso 2: Ejecutar el Script (10 min)

Una vez tengas Termux abierto:

```bash
# 1. Copia esta línea completa y pégala en Termux:

cd ~ && curl -sL https://github.com/Dark0444/TaskReminder/raw/main/termux-build.sh -o termux-build.sh && chmod +x termux-build.sh && ./termux-build.sh
```

**¿Qué hace?**
- ✅ Descarga el código de tu app
- ✅ Instala Node.js y herramientas
- ✅ Descarga todas las dependencias
- ✅ Ejecuta los 12 tests automáticos
- ✅ Te muestra las opciones para compilar

---

## ⚙️ Paso 3: Elegir Método de Compilación

Después que termine el script, elige:

### **OPCIÓN A: Expo CLI (Recomendado ⭐)**

Esto compila en la nube (rápido y fácil).

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

**Qué pasa:**
1. Instala EAS CLI (herramienta de compilación)
2. Abre navegador para iniciar sesión en Expo
3. Compila en servidores de Expo (~15 min)
4. Te da un link para descargar el APK

**Ventajas:**
- ✅ Rápido (15 minutos)
- ✅ No agota batería de tu teléfono
- ✅ APK listo y optimizado
- ✅ Cuenta Expo es GRATIS

---

### **OPCIÓN B: Compilación Local**

Esto compila directamente en tu teléfono (lento).

```bash
npm run android
```

**Ventajas:**
- ✅ Todo en tu teléfono
- ✅ No necesitas cuenta Expo

**Desventajas:**
- ❌ Muy lento (1-2 HORAS)
- ❌ Usa mucha batería
- ❌ Requiere espacio en Termux

**Nota:** No recomiendo esto. Usa Expo CLI.

---

## 📥 Paso 4: Descargar APK

### Si Usas Expo CLI:

1. Después de ejecutar `eas build`, Expo te dará un enlace
2. Ve a: https://expo.io/dashboard
3. Inicia sesión con tu cuenta Expo
4. Verás tu build completado
5. Haz clic en "Download"
6. El APK se descarga automáticamente a tu carpeta **Descargas**

### Si Compilas Local:

1. El APK está en: `/data/data/com.termux/files/home/TaskReminder/android/app/build/outputs/apk/release/app-release.apk`
2. Cópialo a tu carpeta Descargas

---

## 📱 Paso 5: Instalar en Tu Samsung S24 Ultra

```
1. Abre: Gestor de Archivos
   ↓
2. Ve a: Descargas
   ↓
3. Busca: TaskReminder.apk
   ↓
4. Toca el archivo
   ↓
5. Toca: INSTALAR
   ↓
6. Acepta los permisos
   ↓
7. ¡Abre la app y disfruta!
```

---

## 🔑 Crear Cuenta Expo (Gratis)

Si no tienes cuenta Expo:

1. Ve a: https://expo.io
2. Haz clic en: **"Sign up"** (arriba a la derecha)
3. Completa con tu email
4. Confirma tu email
5. ¡Listo! Tu cuenta está lista

**Beneficios:**
- ✅ Compila APKs gratis
- ✅ Soporta apps React Native
- ✅ Dashboard para ver tus builds

---

## 🆘 Solucionar Problemas

### "No puedo clonar el repositorio"
```bash
# Intenta manualmente:
mkdir -p $HOME/TaskReminder
cd $HOME/TaskReminder
curl -sL https://github.com/Dark0444/TaskReminder/archive/refs/heads/main.zip -o main.zip
unzip main.zip
```

### "npm install falla"
```bash
# Intenta con legacy peer deps:
npm install --legacy-peer-deps
```

### "eas login no funciona"
```bash
# Reinstala EAS CLI:
npm uninstall -g eas-cli
npm install -g eas-cli
eas login
```

### "El APK no se descarga"
```bash
# Verifica tu carpeta Descargas:
ls ~/storage/downloads/
```

### "Termux no tiene espacio"
```bash
# Verifica espacio disponible:
df -h $HOME

# Limpia cache de npm:
npm cache clean --force
```

---

## 📋 Comandos Útiles en Termux

```bash
# Ver versión de Node.js
node --version

# Ver versión de npm
npm --version

# Actualizar paquetes
pkg update

# Navegar a tu proyecto
cd $HOME/TaskReminder

# Ver el código
ls -la

# Ver tamaño del proyecto
du -sh .

# Ejecutar tests
npm test

# Limpiar y reinstalar
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 🎯 Resumen del Flujo Completo

```
Termux abierto
    ↓
Ejecutar termux-build.sh
    ↓
Instala dependencias (automático)
    ↓
Elige compilación:
    ├─ Opción A: Expo CLI (RECOMENDADO)
    │   ↓
    │   eas login
    │   ↓
    │   eas build --platform android
    │   ↓
    │   Espera 15 minutos
    │   ↓
    │   Descarga desde expo.io/dashboard
    │
    └─ Opción B: Local (npm run android)
        ↓
        Espera 1-2 HORAS
        ↓
        APK en android/app/build/outputs/...
    ↓
APK en tu carpeta Descargas
    ↓
Instala en tu Samsung S24 Ultra
    ↓
¡A USAR LA APP!
```

---

## 🚀 Comando Rápido (Todo en Uno)

Si quieres hacerlo rápido:

```bash
# Paso 1: En Termux, pega esto:
cd ~ && curl -sL https://github.com/Dark0444/TaskReminder/raw/main/termux-build.sh -o termux-build.sh && chmod +x termux-build.sh && ./termux-build.sh

# Paso 2: Cuando termine, ejecuta:
npm install -g eas-cli
eas login
eas build --platform android

# Paso 3: Ve a expo.io/dashboard y descarga el APK

# Paso 4: Instala en tu teléfono
```

---

## ✅ Checklist Final

Antes de compilar, verifica:

- [ ] Termux instalado y abierto
- [ ] Conexión a internet activa
- [ ] Batería al +70%
- [ ] Espacio libre en tu teléfono (500 MB mínimo)
- [ ] Script descargado y ejecutado

---

## 💬 Resumen

1. **Instala Termux** desde F-Droid (gratis)
2. **Ejecuta el script** (descarga todo automáticamente)
3. **Usa Expo CLI** para compilar (15 minutos en la nube)
4. **Descarga el APK** desde expo.io
5. **Instala en tu teléfono** como app normal
6. **¡Disfruta tu app!**

**Tiempo total:** ~35 minutos (sin PC, solo con tu Samsung S24 Ultra)

---

**¿Problemas?** Mira la sección "Solucionar Problemas" arriba.

**¿Listo?** Abre Termux y ¡comienza! 🚀

---

*Generado: Oct 7, 2026*  
*Status: ✅ Ready for Termux Compilation*
