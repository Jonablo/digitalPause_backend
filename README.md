
# 📊 Expo App Usage Tracker

Aplicación móvil desarrollada con **Expo + React Native** que permite visualizar estadísticas de uso de aplicaciones en **Android**, utilizando la API nativa `UsageStatsManager`.

> ⚠️ **Nota importante:**
> Debido al uso de un **módulo nativo**, esta app **NO es compatible con Expo Go**.
> Es obligatorio ejecutar la app mediante **build nativo**.

---

## 🚀 Características

* Estadísticas de uso de aplicaciones:

  * Hoy
  * Última semana
  * Último mes
* Ranking de apps más usadas
* Tiempo total de uso
* Solicitud automática del permiso `Usage Access`
* UI moderna con **Expo Router + Tabs**
* Módulo nativo Android (`PACKAGE_USAGE_STATS`)

---

## 🛠️ Tecnologías utilizadas

* Expo SDK 54
* React Native 0.81
* Expo Router
* TypeScript
* Expo Native Modules (Android)
* Kotlin (Android)

---

## 📋 Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

* **Node.js** ≥ 18
* **npm** o **yarn**
* **Expo CLI**

  ```bash
  npm install -g expo-cli
  ```
* **Android Studio**

  * Android SDK
  * Emulador Android o dispositivo físico
* **Java JDK 17**

---

## 📦 Instalación

Clona el repositorio:

```bash
git clone https://github.com/Jonablo/digitalPause_backend.git
cd expo-app-usage
```

Instala las dependencias:

```bash
npm install
```

---

## ▶️ Ejecución en desarrollo (Android)

⚠️ **No usar `expo start` ni Expo Go**

Ejecuta la app con build nativo:

```bash
npx expo run:android
```

Esto hará:

* Compilación del módulo nativo
* Instalación del APK en el emulador o dispositivo
* Inicio automático de la app

---

## 🔐 Permisos requeridos

La app requiere el permiso especial de Android:

```
Acceso de uso de aplicaciones
(PACKAGE_USAGE_STATS)
```

### Flujo de permisos

1. Al iniciar la app, se verifica el permiso
2. Si no está concedido:

   * Se muestra una pantalla de solicitud
   * Se abre automáticamente la configuración del sistema
3. El usuario debe:

   * Buscar la app
   * Activar **“Acceso de uso”**
4. Regresar a la app

---

## 🧪 Scripts disponibles

```bash
npm start          # Inicia el bundler (NO recomendado para este proyecto)
npm run android    # Ejecuta la app con build nativo Android
npm run web        # Versión web (sin estadísticas reales)
npm run lint       # Ejecuta ESLint
```

---

## 🌐 Limitaciones por plataforma

| Plataforma | Estado                   |
| ---------- | ------------------------ |
| Android    | ✅ Soportado              |
| iOS        | ⚠️ No soporta UsageStats |
| Web        | ⚠️ Módulo simulado       |

---

## 📱 Estructura del proyecto

```
expo-app-usage/
├── app/                    # Rutas (Expo Router)
├── components/             # UI y pantallas
├── modules/
│   └── expo-appusage/      # Módulo nativo
│       ├── android/        # Implementación Kotlin
│       ├── ios/            # Placeholder iOS
│       └── src/            # Bridge JS
├── assets/
└── package.json
```

---

## 🚢 Despliegue (APK / AAB)

Para generar un build instalable:

### Usando EAS Build

```bash
npx expo prebuild
npx expo run:android --variant release
```

O configurar **EAS**:

```bash
npx expo install eas-cli
npx eas build -p android
```

---

## 🧠 Notas técnicas

* El módulo nativo usa:

  * `UsageStatsManager`
  * `AppOpsManager`
* Los datos se ordenan por `totalTimeInForeground`
* El formato de tiempo se procesa en JS para mayor flexibilidad

---

## 📄 Licencia

MIT © 2026

---