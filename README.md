# DigitalPause Backend (NestJS + Python AI)

Backend robusto para la plataforma de Bienestar Digital, diseñado con una arquitectura modular y centrado en la privacidad.

> **“El endpoint `/users/bootstrap` se utiliza para inicializar el estado del usuario dentro del dominio de la aplicación una vez autenticado por el proveedor externo de identidad.”**

## Arquitectura del Sistema

El sistema utiliza **NestJS** como orquestador principal, conectado a una base de datos **PostgreSQL** para la persistencia de entidades de dominio y un microservicio de **Python** para análisis emocional ligero.

### Entidades Principales (ERD)

La base de datos modela la relación Padre-Hijo y el uso de dispositivos sin invadir la privacidad del contenido.

1.  **Users (Padres/Tutores)**: Entidad raíz. Se crea/vincula mediante autenticación externa (Clerk).
2.  **Children (Perfiles)**: Perfiles gestionados por un usuario.
3.  **Devices**: Dispositivos asociados a un niño.
4.  **UsageSessions**: Registros de tiempo de uso (Inicio/Fin).
5.  **LanguageEvents**: Eventos de detección de palabras clave (Categoría y Severidad, **NO texto literal**).
6.  **PauseRules**: Reglas configuradas para limitar el uso.

### Seguridad y Privacidad

- **Autenticación Delegada**: No almacenamos contraseñas. Confiamos en tokens JWT validados (Clerk).
- **Privacidad de Datos**: El análisis de lenguaje se realiza en memoria o mediante el servicio de IA, almacenando únicamente metadatos (categoría de riesgo) y no el contenido de las conversaciones.

## API Endpoints Clave

### Auth & Bootstrap
- `POST /users/bootstrap`: Recibe las credenciales (JWT/ClerkID) y devuelve el estado completo del usuario (perfil, hijos, configuraciones). **Punto de entrada único para la app móvil.**

### Análisis (IA)
- `GET /analyze`: Puente hacia el servicio de Python para clasificar texto bajo demanda (usado internamente o para pruebas).

## Configuración y Ejecución

### Requisitos
- Node.js v18+
- Python 3.8+
- Docker (opcional, para Base de Datos)

### 1. Base de Datos
Levanta PostgreSQL usando Docker:
```bash
docker-compose up -d
```

### 2. Backend (NestJS)
```bash
npm install
npm run start:dev
```

### 3. Servicio IA (Python)
```bash
pip install -r ai_service/requirements.txt
```
*El backend invocará automáticamente el script de Python cuando sea necesario.*

## Documentación (Swagger)
Una vez iniciado el servidor, visita:
`http://localhost:3000/api`
Para ver la documentación interactiva de todos los endpoints.
