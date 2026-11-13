# Mini Agent Studio

Aplicación web local para crear agentes de IA, guardarlos, seleccionarlos y enviarles
consultas. Un agente es un nombre y unas instrucciones (por ejemplo, "Eres un asistente
que resume textos"). Funciona sin API key, sin costo y sin conexión a internet gracias a
un proveedor de IA simulado (modo mock).

Prueba técnica Fullstack.

## Requisitos

- **Node.js 24 o superior** (probado desde un clon limpio con 24.22.3 y 26.13.1; ver `.nvmrc`). El backend usa el
  módulo `node:sqlite` integrado en Node, así que no hay que instalar ninguna base de datos.
- npm (incluido con Node).

## Instalación y ejecución

Se necesitan dos terminales, una para cada parte.

**Backend** (queda en `http://localhost:3000/api`; documentación interactiva en
`http://localhost:3000/api/docs`):

```bash
cd backend
npm install
npm run start
```

**Frontend** (queda en `http://localhost:5173`):

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador. Si ese puerto está ocupado, Vite usa el
siguiente (5174…) y lo indica en la terminal; la aplicación funciona igual, porque el
navegador pide la API al propio Vite (`/api`) y Vite la reenvía al backend.

No hace falta crear ningún archivo `.env`: todos los valores tienen un valor por defecto.
La base de datos se crea sola en `backend/data/agents.db` en el primer arranque.

### Variables de entorno (opcionales)

| Variable | Dónde | Valor por defecto | Para qué |
| --- | --- | --- | --- |
| `PORT` | backend | `3000` | Puerto de la API |
| `CORS_ORIGIN` | backend | `http://localhost:5173` | Origen permitido si el navegador llama al backend directamente (`VITE_API_URL`) |
| `DATABASE_PATH` | backend | `backend/data/agents.db` | Ruta del archivo SQLite |
| `API_PROXY_TARGET` | frontend | `http://localhost:3000` | Dónde reenvía `/api` el proxy de Vite. Cámbialo si cambias `PORT` |
| `VITE_API_URL` | frontend | `/api` | Dirección de la API en el navegador; por defecto pasa por el proxy |

Hay un `.env.example` en cada carpeta. Ninguna variable contiene secretos.

## Demostración del flujo

1. Arranca backend y frontend sin configurar nada.
2. En la vista **Agentes**, pulsa **Nuevo agente**. Escribe el nombre "Asistente de
   resúmenes" y las instrucciones "Eres un asistente que resume textos". Pulsa
   **Guardar agente**.
3. Aparece un aviso (toast) abajo a la derecha que desaparece solo, y el agente se muestra
   en **Agentes guardados**.
4. Detén el backend (`Ctrl+C`), vuelve a ejecutar `npm run start` y recarga la página:
   el agente sigue en el listado.
5. Pulsa **Consultar** junto al agente (o **Probar agente** en el aviso, mientras siga visible). Se abre la vista
   **Consultar** con ese agente elegido; escribe una consulta y pulsa **Enviar consulta**.
6. Para editar un agente, pulsa el icono del lápiz en su tarjeta o fila: el formulario se
   abre con sus valores; cambia lo que quieras y pulsa **Guardar cambios**. Para
   eliminarlo, pulsa el icono de la papelera y confirma en el diálogo. Ambas acciones
   también están en la ficha de la vista **Consultar**; si eliminas desde ahí, vuelves a
   `/consultar`.
7. Para ver el manejo de errores: guarda un agente con los campos vacíos, envía una
   consulta vacía, abre `/consultar/no-existe`, o detén el backend y recarga la página.

El botón de sol y luna de la barra superior alterna entre el tema claro y el oscuro
(al cargar se usa el tema del sistema).

## Estructura del proyecto

```
├── backend/                         API (NestJS)
│   ├── src/
│   │   ├── main.ts                  Arranque del servidor
│   │   ├── app.setup.ts             Configuración global: prefijo, CORS, validación, errores
│   │   ├── swagger.setup.ts         Documentación interactiva (Swagger) en /api/docs
│   │   ├── agents/                  Funcionalidad: agentes
│   │   │   ├── agents.controller.ts Rutas HTTP
│   │   │   ├── agents.service.ts    Lógica: crear, listar, buscar, editar, eliminar, ejecutar
│   │   │   ├── agents.repository.ts PERSISTENCIA: consultas SQL de los agentes
│   │   │   ├── agents.schemas.ts    Reglas de validación (Zod); Swagger las lee
│   │   │   ├── agents.docs.ts       Decoradores y ejemplos para la documentación
│   │   │   ├── agents.exceptions.ts Error «agente no encontrado»
│   │   │   └── agents.service.spec.ts Pruebas unitarias del servicio
│   │   ├── ai/                      Funcionalidad: proveedor de IA
│   │   │   ├── ai-provider.ts       Contrato del proveedor de IA
│   │   │   ├── mock-ai.provider.ts  ADAPTADOR DE IA simulado
│   │   │   └── ai.exceptions.ts     Error «falló el proveedor de IA»
│   │   ├── database/                Conexión a SQLite: la abre, la comparte y la cierra
│   │   └── common/errors/           Filtro global de errores y su formato único
│   ├── test/                        Prueba e2e de la API (Supertest)
│   └── data/                        Archivo de la base de datos (no se sube a Git)
├── frontend/                        Interfaz (React)
│   └── src/
│       ├── main.tsx                 Monta la caché de datos y el router
│       ├── router.tsx               Rutas (createBrowserRouter)
│       ├── pages/                   AgentsPage, ConsultPage, NotFoundPage, ErrorPage
│       ├── components/layout/       AppLayout (panel y avisos), menú lateral, logo y tema
│       ├── components/agents/       Listado, tarjeta, fila, acciones, formulario y diálogos
│       ├── components/consult/      Selector, instrucciones y caja de consulta
│       ├── components/ui/           Modal, confirmación, error, avisos, paginación, iconos
│       ├── hooks/                   Datos (TanStack Query), filtros en la URL y debounce
│       ├── api/                     Cliente HTTP: peticiones y errores legibles
│       ├── schemas/                 Validación de formularios (Zod)
│       ├── types/                   Tipos del dominio
│       ├── utils/                   Formato de fechas
│       └── index.css                Tailwind, daisyUI y los temas studio-light / studio-dark
├── AI_USAGE.md                      Uso de IA durante el desarrollo
└── BITACORA.md                      Registro del proceso y de las decisiones
```

## Flujo de una consulta

```
Navegador                         Backend (NestJS)
─────────                         ────────────────
ConsultBox ──POST /api/agents/:id/run──▶ AgentsController
   ▲                                          │  valida el cuerpo con Zod
   │                                          ▼
   │                                     AgentsService
   │                                          │  1. busca el agente
   │                                          ├────────▶ AgentsRepository ──▶ SQLite
   │                                          │  2. pide la respuesta
   │                                          └────────▶ AiProvider (MockAiProvider)
   │                                          │
   └────────── respuesta o error ◀────────────┘
```

1. El usuario escribe la consulta y pulsa **Enviar consulta**. El frontend valida que no esté
   vacía y envía `POST /api/agents/:id/run`.
2. El controlador recibe la petición; el pipe global valida el cuerpo.
3. El servicio busca el agente en el repositorio. Si no existe, responde `404`.
4. El servicio entrega el nombre, las instrucciones y la consulta al proveedor de IA.
   El servicio solo conoce el contrato `AiProvider`, no la implementación.
5. El proveedor devuelve el texto y el frontend lo muestra. Cualquier fallo llega al
   frontend con el mismo formato de error y se muestra como un mensaje legible.

### El modo mock

`MockAiProvider` no llama a ningún servicio externo. Construye la respuesta con las
instrucciones del agente y la consulta, mostrando el mensaje que se enviaría a un modelo
real. Es determinista y no finge inteligencia. Añade una espera de medio segundo para que
el estado de carga sea visible.

Conectar un LLM real consiste en crear otra clase que cumpla `AiProvider` y registrarla
en `ai.module.ts`. El controlador, el servicio y el frontend no cambian.

## Endpoints

Todos bajo el prefijo `/api`.

**Documentación interactiva (Swagger):** con el backend en marcha, abre
`http://localhost:3000/api/docs`. Muestra cada ruta con sus parámetros y errores
posibles, y permite ejecutarla sin usar `curl`: los campos ya salen editables, cada
cuerpo trae un desplegable con un ejemplo válido y otros inválidos, y la portada explica
cómo recorrer el flujo crear → consultar. El documento OpenAPI está en `/api/docs-json`.
Se genera al arrancar a partir de los controladores y de los mismos esquemas Zod que
validan las peticiones, así que no puede quedar desactualizado respecto al código.

| Método | Ruta | Descripción | Respuesta |
| --- | --- | --- | --- |
| `POST` | `/api/agents` | Crea un agente | `201` con el agente |
| `GET` | `/api/agents` | Lista los agentes, paginados, con búsqueda y orden | `200` con `{ items, meta }` |
| `GET` | `/api/agents/:id` | Devuelve un agente | `200` con el agente, `404` si no existe |
| `PUT` | `/api/agents/:id` | Reemplaza nombre e instrucciones | `200` con el agente, `400` si no es válido, `404` si no existe |
| `DELETE` | `/api/agents/:id` | Elimina un agente | `204` sin cuerpo, `404` si no existe |
| `POST` | `/api/agents/:id/run` | Ejecuta una consulta sobre un agente | `200` con la respuesta |

Parámetros opcionales de `GET /api/agents`:

| Parámetro | Valores | Por defecto |
| --- | --- | --- |
| `page` | Entero desde 1 | `1` |
| `limit` | Entero de 1 a 100 | `6` |
| `search` | Texto, máximo 100 caracteres; busca en nombre e instrucciones | vacío |
| `sort` | `recent`, `oldest` o `name` | `recent` |

### Ejemplo: crear un agente

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"Asistente de resúmenes","instructions":"Eres un asistente que resume textos"}'
```

```json
{
  "id": "1c4c8e63-2f0e-4c24-aad6-57b31dfdc208",
  "name": "Asistente de resúmenes",
  "instructions": "Eres un asistente que resume textos",
  "createdAt": "2026-11-12T23:51:48.959Z"
}
```

### Ejemplo: listar agentes

```bash
curl "http://localhost:3000/api/agents?page=1&limit=6&search=resum&sort=recent"
```

```json
{
  "items": [
    {
      "id": "1c4c8e63-2f0e-4c24-aad6-57b31dfdc208",
      "name": "Asistente de resúmenes",
      "instructions": "Eres un asistente que resume textos",
      "createdAt": "2026-11-12T23:51:48.959Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 6,
    "total": 1,
    "totalAll": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

`total` cuenta los agentes que coinciden con la búsqueda; `totalAll`, todos los guardados.

### Ejemplo: editar un agente

```bash
curl -X PUT http://localhost:3000/api/agents/1c4c8e63-2f0e-4c24-aad6-57b31dfdc208 \
  -H "Content-Type: application/json" \
  -d '{"name":"Asistente de resúmenes v2","instructions":"Resume textos en tres frases"}'
```

```json
{
  "id": "1c4c8e63-2f0e-4c24-aad6-57b31dfdc208",
  "name": "Asistente de resúmenes v2",
  "instructions": "Resume textos en tres frases",
  "createdAt": "2026-11-12T23:51:48.959Z"
}
```

El cuerpo usa las mismas reglas que al crear; `id` y `createdAt` no cambian.

### Ejemplo: eliminar un agente

```bash
curl -i -X DELETE http://localhost:3000/api/agents/1c4c8e63-2f0e-4c24-aad6-57b31dfdc208
```

```
HTTP/1.1 204 No Content
```

### Ejemplo: ejecutar una consulta

```bash
curl -X POST http://localhost:3000/api/agents/1c4c8e63-2f0e-4c24-aad6-57b31dfdc208/run \
  -H "Content-Type: application/json" \
  -d '{"query":"Resume este párrafo"}'
```

```json
{
  "agentId": "1c4c8e63-2f0e-4c24-aad6-57b31dfdc208",
  "response": "[Modo simulado] Soy \"Asistente de resúmenes\".\n\nEsto es lo que se enviaría al modelo de IA:\n• Instrucciones (mensaje de sistema): \"Eres un asistente que resume textos\"\n• Consulta (mensaje del usuario): \"Resume este párrafo\"\n\nCon un proveedor real, aquí verías la respuesta generada siguiendo esas instrucciones.",
  "provider": "mock"
}
```

### Validación y errores

| Campo | Regla |
| --- | --- |
| `name` | Obligatorio, máximo 100 caracteres (al crear y al editar) |
| `instructions` | Obligatorio, máximo 5000 caracteres |
| `query` | Obligatorio, máximo 5000 caracteres |

Los espacios al inicio y al final se recortan. Todos los errores tienen el mismo formato:

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Los datos enviados no son válidos",
  "details": [{ "field": "name", "message": "El nombre es obligatorio" }]
}
```

| Código | `error` | Cuándo |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Faltan campos, superan el máximo o un parámetro de consulta no es válido (`details` indica cuáles) |
| `400` | `BAD_REQUEST` | El cuerpo no es JSON válido |
| `404` | `AGENT_NOT_FOUND` | El agente no existe |
| `502` | `AI_PROVIDER_ERROR` | El proveedor de IA falló |
| `500` | `INTERNAL_ERROR` | Cualquier otro fallo; el servidor sigue en marcha |

## Pruebas

```bash
cd backend
npm test          # pruebas unitarias del servicio (paginación, búsqueda, orden, detalle, editar, eliminar)
npm run test:e2e  # pruebas de la API completa con Supertest (flujo crear → consultar, errores, listado, PUT, DELETE y documentación)
```

Las pruebas usan una base SQLite en memoria y no tocan `backend/data/`.

## Tecnologías y razones

| Tecnología | Razón |
| --- | --- |
| React + TypeScript + Vite | Stack que domino; arranque inmediato y tipado de extremo a extremo |
| React Router | Dos vistas (Agentes y Consultar); el agente elegido vive en la URL, así que no hace falta estado global |
| TanStack Query | Gestiona los estados de carga y error de cada petición y refresca el listado al crear un agente |
| React Hook Form + Zod | Validación de formularios con el error junto a cada campo |
| Sonner | Avisos de éxito (cola, cierre a los 4 s, pausa con el ratón) sin mantener un sistema propio; se pintan con el `alert` de daisyUI y siguen el tema |
| Tailwind CSS 4 + daisyUI 5 | Estándar visual consistente con poco código; es solo CSS y se compila localmente. Dos temas propios (claro y oscuro) con contraste AA (4.5:1 como mínimo) |
| NestJS 12 | Su inyección de dependencias hace explícita la separación entre controlador, lógica, persistencia y proveedor de IA |
| Zod en el backend | NestJS 12 lo valida de forma nativa (`StandardSchemaValidationPipe`), sin clases DTO |
| Swagger (`@nestjs/swagger` 12) | Documenta y permite probar los endpoints desde el navegador; genera los esquemas a partir de Zod, sin escribir las reglas dos veces |
| SQLite (`node:sqlite`) | Persistencia real con escritura segura, sin instalar dependencias ni un servidor |
| Vitest + Supertest | Vienen con el proyecto de NestJS 12; prueban el servicio y la API sin levantar el servidor |

Decisiones tomadas a propósito para no añadir complejidad: sin ORM (una tabla y unas
pocas consultas parametrizadas), sin librería de estado global en el frontend (el estado
del servidor vive en TanStack Query, la selección y los filtros en la URL, y el tema lo
aplica el `theme-controller` de daisyUI), sin monorepo con paquetes compartidos. El
razonamiento completo está en `BITACORA.md`.

## Limitaciones conocidas

- Las reglas de validación están duplicadas en frontend y backend.
- No se guarda el historial de consultas; la respuesta se pierde al recargar la página.
- El modo mock no genera respuestas reales: muestra lo que se enviaría al modelo.
- Las pruebas cubren el backend; el frontend no tiene pruebas automatizadas.
- El selector de la vista Consultar carga como máximo 100 agentes. Un agente fuera de esa
  lista se puede consultar igualmente desde el listado, porque se busca por su id.
- El frontend se sirve con el servidor de desarrollo de Vite; no hay configuración para
  servirlo compilado en producción.

## Mejoras con más tiempo

1. **Proveedor LLM real**, seleccionable por variable de entorno y con el mock como
   respaldo cuando no hay API key. La interfaz `AiProvider` ya lo permite.
2. **Una sola fuente de reglas para frontend y backend:** generar los tipos del frontend
   a partir del documento OpenAPI (`/api/docs-json`), que ya sale de los esquemas Zod del
   backend, o moverlos a un paquete común.

Otras: historial de conversaciones por agente, pruebas del
frontend, ejecución con Docker Compose y, a más largo plazo, un editor visual de flujos
para agentes con varios pasos.
