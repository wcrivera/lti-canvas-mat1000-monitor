# Quiz Monitor Backend

Backend para monitorear resultados de quizzes nativos de Canvas en tiempo real usando LTI 1.1 y WebSockets.

## 📋 Características

- ✅ Integración LTI 1.1 con Canvas
- ✅ Monitoreo de quizzes nativos de Canvas via Canvas API
- ✅ Actualización en tiempo real via Socket.io
- ✅ Base de datos MongoDB para persistencia
- ✅ Cada estudiante ve solo sus resultados
- ✅ TypeScript estricto
- ✅ Arquitectura minimalista

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de datos**: MongoDB
- **WebSockets**: Socket.io
- **LTI**: ims-lti (OAuth 1.0)
- **Canvas API**: Axios

## 📁 Estructura del Proyecto

```
quiz-monitor-backend/
├── src/
│   ├── config/          # Configuración (DB, CORS)
│   ├── models/          # Modelos MongoDB
│   ├── controllers/     # Controladores
│   ├── services/        # Lógica de negocio
│   ├── routes/          # Rutas Express
│   ├── middleware/      # Middleware (auth, errors)
│   ├── types/           # Tipos TypeScript
│   └── server.ts        # Servidor principal
├── package.json
├── tsconfig.json
└── .env
```

## 🚀 Instalación

### 1. Clonar o crear el proyecto

```bash
mkdir quiz-monitor-backend
cd quiz-monitor-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y completar:

```bash
cp .env.example .env
```

Editar `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/quiz-monitor

# LTI 1.1
LTI_CONSUMER_KEY=tu_consumer_key
LTI_CONSUMER_SECRET=tu_consumer_secret

# Canvas API
CANVAS_API_URL=https://tu-canvas.instructure.com
CANVAS_ACCESS_TOKEN=tu_access_token

# Frontend
FRONTEND_URL=http://localhost:5173

# Polling
ENABLE_POLLING=true
POLL_INTERVAL_SECONDS=30
```

### 4. Iniciar MongoDB

```bash
# macOS con Homebrew
brew services start mongodb-community

# O docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Iniciar servidor en desarrollo

```bash
npm run dev
```

El servidor estará en `http://localhost:3001`

## 📡 Endpoints

### LTI

- `POST /lti/launch` - LTI Launch desde Canvas
- `POST /lti/validate` - Validar token de sesión

### API

- `GET /api/results/:studentId` - Obtener resultados de un estudiante
- `GET /api/stats/:studentId` - Obtener estadísticas
- `GET /health` - Health check

### WebSocket

- Evento `authenticate` - Autenticar estudiante
- Evento `quiz-result-ready` - Nuevo resultado disponible

## 🔧 Configuración en Canvas

### 1. Crear Access Token

1. Ir a Canvas → Settings → Approved Integrations
2. Crear "New Access Token"
3. Permisos necesarios:
   - ✅ Lectura de cursos
   - ✅ Lectura de quizzes
   - ✅ Lectura de submissions
4. Copiar token a `.env`

### 2. Configurar LTI 1.1

1. En tu curso Canvas, ir a Settings → Apps → View App Configurations
2. Agregar App → By URL or XML
3. Completar:
   - **Name**: Quiz Monitor
   - **Consumer Key**: (mismo que en .env)
   - **Shared Secret**: (mismo que en .env)
   - **Launch URL**: `https://tu-servidor.com/lti/launch`

### 3. Configurar Polling

En `server.ts`, línea 105, agregar quizzes a monitorear:

```typescript
const MONITORED_QUIZZES = [
  { courseId: '12345', quizId: '67890' }
];
```

## 🔐 Seguridad

- ✅ LTI OAuth 1.0 signature validation
- ✅ CORS configurado para Canvas
- ✅ Rate limiting (100 requests/15min)
- ✅ Helmet.js para headers de seguridad
- ✅ WebSocket authentication
- ✅ Sesiones con expiración (24h)

## 📊 Modelos de Datos

### QuizResult

```typescript
{
  studentId: string;
  studentName: string;
  courseId: string;
  quizId: string;
  quizTitle: string;
  submissionId: string;
  score: number;
  possiblePoints: number;
  percentageScore: number;
  timeSpent: number;
  submittedAt: Date;
  attempt: number;
}
```

### LTISession

```typescript
{
  userId: string;
  userName: string;
  courseId: string;
  sessionToken: string;
  status: 'active' | 'expired';
  expiresAt: Date;
}
```

## 🧪 Testing

Para probar el backend:

```bash
# Health check
curl http://localhost:3001/health

# Validar token (ejemplo)
curl -X POST http://localhost:3001/lti/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"tu_token_aqui"}'
```

## 🚀 Deployment

### Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Crear proyecto
railway init

# Agregar variables de entorno en dashboard de Railway

# Deploy
railway up
```

### Render

1. Conectar repositorio GitHub
2. Configurar build:
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. Agregar variables de entorno
4. Deploy

## 📝 Próximos Pasos

- [ ] Frontend React con Socket.io client
- [ ] Dashboard de instructor
- [ ] Webhooks de Canvas (si tienes admin access)
- [ ] Tests automatizados
- [ ] Logging con Winston
- [ ] Métricas y monitoring

## 🤝 Contribuir

Este es un proyecto piloto. Mantener código minimalista y funcional.

## 📄 Licencia

MIT

---

**Autor**: Wolfgang Rivera  
**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024
# lti-canvas-mat1000-monitor
