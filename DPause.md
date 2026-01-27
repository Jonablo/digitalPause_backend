# BienestarDigital (Proyecto Completo)

Este repositorio contiene la solución integral "BienestarDigital" (también referida como `dpause` o `HambApp`), diseñada para monitorear, analizar y mejorar los hábitos digitales del usuario.

## 🏗 Arquitectura del Sistema

El sistema se compone de tres pilares tecnológicos principales que trabajan en conjunto para ofrecer una experiencia de bienestar digital completa:

1.  **Módulo Nativo (Android/Kotlin)**: Capa de bajo nivel para recolección de datos (Intensidad de uso).
2.  **Aplicación Móvil (React Native/Expo)**: Interfaz de usuario y lógica de presentación.
3.  **Backend (NestJS)**: Procesamiento de datos, lógica de negocio y almacenamiento centralizado.

---

## 📱 1. Aplicación Móvil (React Native + Expo)
**Ubicación**: `/BienestarDigital`

La aplicación es el punto de entrada para el usuario. Utiliza **Expo** (Managed Workflow) y se comunica con el código nativo a través de módulos personalizados.

### Componentes Clave:
*   **`hooks/useDigitalWellbeing.ts`**: El "cerebro" de la recolección de datos en el cliente.
    *   Gestiona permisos (Accesibilidad, Estadísticas de Uso).
    *   Sincroniza datos con el backend mediante `api.post`.
    *   Actúa como puente entre la UI y el Módulo Nativo.
*   **`components/Home/DaySelector.tsx`**: Visualiza el "Riesgo de Bloqueo".
    *   Contiene la lógica de presentación para transformar métricas crudas en insights legibles (ej. "Riesgo crítico").
*   **`app/(tabs)/analytics.tsx`**: Panel de control detallado.
    *   Muestra gráficas de uso diario.
    *   Lista aplicaciones más usadas con sus iconos (resuelto mediante mapeo de paquetes como `com.zhiliaoapp.musically` -> TikTok).
*   **`app/programs/`**: Gestión de programas de desintoxicación digital.

### Tecnologías:
*   **Expo Router**: Navegación moderna basada en el sistema de archivos.
*   **TanStack Query**: Gestión eficiente del estado asíncrono y caché de datos del servidor.
*   **Clerk**: Gestión segura de autenticación e identidad de usuarios.
*   **React Native Paper**: Sistema de diseño UI para componentes visuales consistentes.
*   **Zustand**: Gestión de estado global ligero (ej. datos de usuario).

---

## 🤖 2. Módulo Nativo (Kotlin)
**Ubicación**: `/BienestarDigital/DigitalWellbeingKotlin`

Este módulo permite a la aplicación React Native acceder a características profundas del sistema Android que no están disponibles en la API estándar de JavaScript.

### Funcionalidades:
*   **`InteractionAccessibilityService.kt`**:
    *   Servicio en segundo plano que escucha eventos de accesibilidad del sistema.
    *   **Métrica Clave**: Cuenta cada "Tap" (Click) y "Scroll" (Desplazamiento) globalmente en el dispositivo, independientemente de la app que se use.
    *   Esto permite medir la "intensidad" del uso (comportamiento compulsivo), no solo el tiempo pasivo.
*   **`InteractionModule.kt`**:
    *   El "Puente" (Bridge) hacia React Native.
    *   Expone métodos como `getDailyMetrics()` para entregar los conteos acumulados de taps/scrolls a la capa de JavaScript.
    *   Facilita la verificación de permisos nativos.

---

## ☁️ 3. Backend (NestJS)
**Ubicación**: `/digitalPause_backend`

El servidor centraliza la lógica de negocio compleja y almacena el historial de bienestar del usuario.

### Módulos Principales:
*   **Metrics Module (`/modules/metrics`)**:
    *   **Cálculo de Riesgo**: Implementa la fórmula ponderada que determina el estado del usuario:
        *   **50%** Tiempo de Pantalla
        *   **30%** Interacciones (Taps/Scrolls)
        *   **20%** Estado Emocional (reportado por el usuario)
    *   Recibe datos crudos desde la App y los procesa para devolver estadísticas normalizadas.
*   **Programs Module (`/modules/programs`)**:
    *   Gestiona los planes de desintoxicación digital.
    *   **Lógica de Negocio**: Valida conflictos de horarios (ej. impide crear dos programas que se superpongan en horario y día) usando utilidades de tiempo personalizadas.
*   **Insights Module (`/modules/insights`)**:
    *   Genera recomendaciones textuales basadas en los patrones de datos almacenados.
*   **Users Module (`/modules/users`)**:
    *   Gestiona la configuración del usuario y vinculación con Clerk.

### Tecnologías:
*   **NestJS**: Framework de Node.js robusto y escalable.
*   **TypeORM**: ORM para interacción tipada con la base de datos (PostgreSQL).
*   **Docker**: Orquestación del entorno de despliegue.

---

## 🔄 Flujos Principales de la Aplicación

A continuación se detallan los recorridos de datos más importantes que dan vida a la experiencia de usuario.

### 1. Monitoreo y Cálculo de Riesgo (Core Loop)
Este es el corazón de la aplicación, encargado de transformar interacciones físicas en métricas de bienestar.

1.  **Captura (Nativo)**: El usuario usa su teléfono (ej. hace scroll en Instagram). `InteractionAccessibilityService` (Kotlin) intercepta el evento.
2.  **Persistencia Local**: El contador se incrementa en `SharedPreferences` del dispositivo Android.
3.  **Puente (Bridge)**: React Native consulta periódicamente estos datos a través de `InteractionModule`.
4.  **Sincronización**: El hook `useDigitalWellbeing` envía los datos al backend (`POST /metrics/interactions`).
5.  **Cálculo**: NestJS evalúa la fórmula: `50% Tiempo + 30% Interacciones + 20% Emoción`.
6.  **Feedback**: La UI se actualiza mostrando el nivel de riesgo (Bajo/Medio/Alto/Crítico).

### 2. Análisis Emocional con IA
Conecta el estado de ánimo del usuario con sus métricas digitales.

1.  **Interacción**: El usuario chatea con el Asistente de Bienestar (`/assistant`).
2.  **Procesamiento**: El mensaje se envía al servicio de IA (`POST /ai/mood-checkin`).
3.  **Análisis de Sentimiento**: Un script de Python (BERT/NLP) analiza el texto para detectar emociones (ej. "Estrés", "Ansiedad", "Calma").
4.  **Registro**: La emoción predominante se guarda en la base de datos de métricas.
5.  **Impacto**: Esta emoción influye directamente en el 20% del cálculo de "Riesgo de Bloqueo" (ej. Alto estrés + Alto uso = Riesgo Crítico).

### 3. Gestión de Programas de Desintoxicación
Permite al usuario establecer límites y horarios de desconexión.

1.  **Configuración**: El usuario define un nuevo programa (ej. "Modo Trabajo: L-V 9am-5pm").
2.  **Validación**: El backend (`ProgramsService`) verifica matemáticamente que el nuevo horario no se superponga con otros programas activos.
3.  **Activación**: Si es válido, se guarda en la base de datos.
4.  **Monitoreo Activo**: La aplicación consulta `useCurrentProgram` para saber si hay un programa vigente.
5.  **Restricción (Lógica)**: Si hay un programa activo, la UI informa al usuario y sugiere bloquear el acceso (funcionalidad de bloqueo estricto en roadmap).

### 4. Autenticación y Seguridad
Garantiza que los datos sean privados y accesibles solo por el dueño.

1.  **Login**: El usuario se autentica mediante **Clerk** (Google/Email).
2.  **Token**: Se genera un JWT seguro.
3.  **Peticiones**: Cada llamada al backend incluye el header `Authorization: Bearer <token>`.
4.  **Guardias**: El backend (`AuthGuard`) valida el token y extrae el `clerkId` para asegurar que el usuario solo acceda a sus propios registros.
