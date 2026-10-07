# Task Reminder - App de Tareas con Notificaciones

Una aplicación móvil moderna para gestionar tareas, recordatorios, calendario integrado y notificaciones push. Construida con React Native y Expo.

## Características

✅ **Lista de Tareas** - Crea, edita y marca tareas como completadas
✅ **Recordatorios** - Establece fechas y horas para recordatorios
✅ **Notificaciones Push** - Recibe alertas en tiempo real
✅ **Calendario Integrado** - Visualiza tus tareas en un calendario
✅ **Prioridades** - Asigna niveles de prioridad (Baja, Media, Alta)
✅ **Almacenamiento Local** - Guarda tus datos en el dispositivo
✅ **Interfaz Moderna** - Diseño limpio y minimalista

## Requisitos

- Node.js 16+
- npm o yarn
- Expo CLI
- Dispositivo Android o emulador

## Instalación

```bash
git clone <tu-repositorio>
cd TaskReminder
npm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web
```

## Tests

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm test:watch
```

## Build para APK

```bash
# Compilar APK para Android
npm run android
```

También puedes usar Expo:

```bash
eas build --platform android
```

## Estructura del Proyecto

```
TaskReminder/
├── App.js                    # Componente principal
├── app.json                  # Configuración de Expo
├── package.json              # Dependencias
├── src/
│   ├── screens/
│   │   ├── TasksScreen.js   # Pantalla de tareas
│   │   ├── CalendarScreen.js # Pantalla de calendario
│   │   └── SettingsScreen.js # Pantalla de configuración
│   └── __tests__/
│       └── tasks.test.js     # Tests automáticos
└── .github/
    └── workflows/
        └── build-apk.yml     # CI/CD para compilar APK
```

## Flujo de Trabajo

1. **Crear Tarea**: Presiona el botón + para crear una nueva tarea
2. **Establecer Recordatorio**: Selecciona fecha y hora
3. **Establecer Prioridad**: Elige entre Baja, Media o Alta
4. **Recibir Notificación**: Recibirás una alerta en la hora exacta
5. **Marcar Completa**: Toca el círculo para marcar como completada
6. **Ver en Calendario**: Visualiza todas tus tareas en el calendario

## Notificaciones

- **Automáticas**: Se envían en la fecha y hora configurada
- **Sonido y Vibración**: Configurable en Ajustes
- **Badge**: Muestra el número de recordatorios pendientes

## Almacenamiento

Todas tus tareas se guardan localmente en tu dispositivo usando AsyncStorage.
Tus datos son privados y nunca se envían a servidores externos.

## GitHub Actions (CI/CD)

El proyecto incluye automatización para:
- ✅ Ejecutar tests automáticamente
- ✅ Compilar APK en cada push
- ✅ Crear releases automáticamente

Los archivos compilados se encuentran en la sección "Actions" de GitHub.

## Configuración de Notificaciones

En `SettingsScreen.js` puedes:
- Habilitar/deshabilitar notificaciones
- Activar/desactivar sonido
- Activar/desactivar vibración

## Permisos Requeridos

- `INTERNET` - Para sincronización de datos
- `RECEIVE_BOOT_COMPLETED` - Para recordatorios después de reinicio
- `VIBRATE` - Para notificaciones con vibración
- `ACCESS_NOTIFICATION_POLICY` - Para control de notificaciones

## Changelog

### v1.0.0 (Inicial)
- Creación de tareas
- Sistema de recordatorios
- Notificaciones push
- Calendario integrado
- Configuración de prioridades
- Tests automáticos
- CI/CD con GitHub Actions

## Licencia

MIT - Libre para usar y modificar

## Soporte

Para reportar bugs o sugerencias, abre un issue en GitHub.

---

**Compilado con ❤️ usando React Native y Expo**
