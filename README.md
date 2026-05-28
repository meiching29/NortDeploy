<div align="center">

# NortDeploy

**Plataforma de hosting académico para la Universidad del Norte**

> Proyecto Final — Estructura del Computador 2 · Universidad del Norte · 2026-1

</div>

---

## Integrantes

| Nombre | Rol |
|--------|-----|
| Mei Li Ching Franco | Fullstack + Infraestructura |
| Donald José Pimienta Pérez | Proxy + Orquestador Docker |
| Julian Esteban Porto Rangel | Backend + Docker Compose |
| Camilo Jose Urzola Castillo | Backend + DevOps |

---

## Video de demostración

▶ **[Ver en YouTube](https://youtube.com/AGREGAR-LINK)**

El video incluye:
- Registro e inicio de sesión con Roble
- Creación y despliegue de un proyecto desde GitHub
- Funcionamiento de la gestión de recursos y apagado automático

---

## Descripción

**NortDeploy** es una plataforma web que permite a estudiantes de Uninorte desplegar sus proyectos desde GitHub con un solo clic. Cada proyecto se ejecuta en su propio contenedor Docker y queda accesible mediante un subdominio único:

```
http://proyecto.usuario.localhost
```

La plataforma se integra con **Roble** (OpenLab Uninorte) para autenticación y base de datos, y usa **Caddy** como reverse proxy para gestionar los subdominios dinámicamente.

---

## Arquitectura y componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        Usuario (Navegador)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ :3000
┌──────────────────────────▼──────────────────────────────────────┐
│                  Frontend (React + Vite)                         │
│  Dashboard · Login/Register · ProjectCard · ProjectDetail        │
│  Autenticación con Roble · Gestión de proyectos                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP :4000
┌──────────────────────────▼──────────────────────────────────────┐
│           Backend Orquestador (Node.js + Express)                │
│  Auth middleware (Roble) · Rate limiting                         │
│  Clona repos GitHub · docker build/run · Gestión de puertos      │
│  Cron job inactividad · Integración Caddy API                    │
└──────────┬───────────────────────────────┬──────────────────────┘
           │ Docker API                    │ Roble API
┌──────────▼──────────┐     ┌─────────────▼────────────────────┐
│    Docker Engine     │     │  Roble (OpenLab Uninorte)         │
│                      │     │  Auth: JWT login/register         │
│  proyecto-1 :9000    │     │  DB: tabla Proyectos              │
│  proyecto-2 :9001    │     │  Roles y permisos por tabla       │
│  proyecto-N :900N    │     └──────────────────────────────────┘
└──────────┬──────────┘
           │ :80
┌──────────▼──────────┐
│   Caddy (Proxy)      │
│  *.usuario.localhost │
│  API admin :2019     │
└─────────────────────┘
```

### Componentes principales

| Componente | Tecnología | Puerto | Descripción |
|-----------|-----------|--------|-------------|
| Frontend | React 18 + Vite | 3000 | Dashboard de gestión de proyectos |
| Backend | Node.js + Express | 4000 | Orquestador de contenedores |
| Proxy | Caddy 2 | 80, 2019 | Reverse proxy con subdominios dinámicos |
| Auth/DB | Roble API | — | Autenticación y persistencia de datos |

---

## Flujo de trabajo del sistema

### Despliegue de un proyecto

```
1. Usuario ingresa nombre, URL del repo, tipo y puerto
         ↓
2. Frontend → POST /projects → Backend
         ↓
3. Backend clona el repo de GitHub (simple-git)
         ↓
4. Detecta Dockerfile o docker-compose.yml
         ↓
5. docker build → construye la imagen
         ↓
6. docker run → lanza el contenedor
         • Límite: 1 CPU, 512MB RAM
         • Puerto externo asignado dinámicamente (desde 9000)
         ↓
7. Backend guarda en Roble DB (tabla Proyectos)
         ↓
8. Backend registra subdominio en Caddy API admin
         ↓
9. Proyecto accesible en: http://proyecto.usuario.localhost
```

### Auto-apagado por inactividad

```
Cron job cada 5 minutos:
  → Consulta proyectos con estado "online"
  → Si ultima_actividad > 30 min:
      → docker stop (contenedor)
      → Actualiza estado a "sleeping" en Roble DB
  → Si usuario accede al proyecto dormido:
      → Click en dashboard → onAction(id, 'start')
      → docker start → contenedor reactiva
      → Actualiza estado a "online"
```

---

## Estrategia de seguridad y optimización de recursos

### Seguridad

| Mecanismo | Implementación |
|-----------|---------------|
| Autenticación | JWT via Roble API — cada request verifica el token |
| Autorización | Cada usuario solo puede operar sus propios proyectos (`usuario_id`) |
| Aislamiento | Cada proyecto corre en su propio contenedor Docker aislado |
| Rate limiting | Máximo 10 requests por minuto por usuario (`middleware/rateLimit.js`) |
| Validación de puertos | Puertos del sistema reservados (80, 443, 3000, 4000, 2019) |

### Optimización de recursos

| Mecanismo | Implementación |
|-----------|---------------|
| Límite de CPU | `--cpus=1` por contenedor (`NanoCpus: 1e9` en Dockerode) |
| Límite de memoria | `--memory=512m` por contenedor |
| Auto-apagado | Cron job apaga contenedores inactivos >30 min |
| Puertos dinámicos | Asignación automática desde el puerto 9000 sin colisiones |
| Caché de builds | Docker reutiliza capas cacheadas en builds subsecuentes |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y corriendo
- Docker Compose (incluido en Docker Desktop)

### Solo en Windows
Habilitar la API TCP de Docker:
```
Docker Desktop → Settings → General → 
☑ Expose daemon on tcp://localhost:2375 without TLS
```

### Configuración de subdominios (Windows)
Agregar al archivo `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 proyecto.usuario.localhost
```
> En Mac/Linux los subdominios `*.localhost` resuelven automáticamente.
> Al acceder desde el navegador en Windows, escribir `http://` explícitamente.

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/meiching29/NortDeploy.git
cd NortDeploy

# 2. Levantar todo con un solo comando
docker-compose up --build
```

Abrir el dashboard en: **http://localhost:3000**

Para detener:
```bash
docker-compose down
```

---

## Estructura del proyecto

```
NortDeploy/
├── docker-compose.yml
├── README.md
├── .gitignore
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   ├── projects.js
│       │   └── roble.js
│       ├── assets/
│       ├── components/
│       │   ├── landing/
│       │   │   ├── CinematicOrb.jsx
│       │   │   ├── HeroLeft.jsx
│       │   │   ├── LandingFooter.jsx
│       │   │   └── LandingNav.jsx
│       │   ├── BackgroundOrb.jsx
│       │   ├── EditProjectModal.jsx
│       │   ├── Header.jsx
│       │   ├── LogsModal.jsx
│       │   ├── NewProjectModal.jsx
│       │   ├── NotificationBell.jsx
│       │   ├── ProjectCard.jsx
│       │   └── StatusBadge.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── NotificationContext.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── ProjectDetail.jsx
│       │   ├── Register.jsx
│       │   └── VerifyEmail.jsx
│       └── utils/
│           ├── openHttp.js
│           └── token.js
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/
│       │   └── env.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── rateLimit.js
│       ├── routes/
│       │   └── projects.js
│       ├── services/
│       │   ├── caddy.js
│       │   ├── docker.js
│       │   ├── inactivity.js
│       │   └── robleDB.js
│       └── utils/
│           └── ports.js
└── proxy/
    └── Caddyfile
```

---

## Ejemplos de repositorios compatibles

El repositorio debe tener un `Dockerfile` o `docker-compose.yml` en la raíz.

### Ejemplo con Dockerfile

Repositorio: [meiching29/demo1](https://github.com/meiching29/demo1.git)

```
git clone https://github.com/meiching29/demo1.git
```

Contiene un servidor Node.js simple con `Dockerfile` en la raíz expuesto en el puerto `3000`.

### Ejemplo con Docker Compose

Repositorio: [DonJPP/demo2-dockercompose](https://github.com/DonJPP/demo2-dockercompose.git)

```
git clone https://github.com/DonJPP/demo2-dockercompose.git
```

Contiene una aplicación con `docker-compose.yml` en la raíz. NortDeploy reemplaza automáticamente los puertos para evitar conflictos.
