# Bitácora del proceso — Mini Agent Studio

Registro de trabajo. Sirve de materia prima para `AI_USAGE.md` (PDF §5), que exige:
herramientas usadas, al menos dos prompts, qué hizo la IA y qué cambié yo, cómo verifiqué
y qué recomendaciones corregí o descarté.

Formato de cada entrada: fecha · etapa · prompt (resumido) · resultado · qué validé / corregí / descarté.

---

## 2026-11-12 · Etapa 1 — Análisis de requisitos

- **Herramienta:** Claude Code (Claude Fable 5.2).
- **Prompt (resumen):** "Actúa como analista de requisitos y arquitecto. Analiza el PDF de la
  prueba, clasifica requisitos (explícito / inferido / propuesto), define MVP, riesgos y
  criterios de aceptación. No escribas código ni elijas stack todavía."
- **Resultado:** documento "Análisis de Requisitos y Definición de Alcance v1.0"
  (11 requisitos funcionales, 20 casos de aceptación, 10 decisiones pendientes).
- **Validado por mí:** _(pendiente: contrastar cada RF con el PDF)_
- **Corregido o descartado:** _(pendiente)_

## 2026-11-12 · Etapa 2 — Cómo funciona el agente, Docker y referencias

- **Prompt (resumen):** "¿Qué indica el PDF para el desarrollo? Quiero usar Docker para la
  reproducción. ¿Cómo haremos funcionar el agente, qué librerías caben en las reglas, qué tan
  dinámico debe ser y qué proyectos similares sirven de inspiración?"
- **Resultado:** el agente es nombre + instrucciones, de un solo turno; el mock no necesita
  librerías; Docker se recomienda como vía secundaria, no única.
- **Validado por mí:** _(pendiente)_
- **Corregido o descartado:** _(pendiente)_

---

## Decisiones tomadas

| Fecha | Decisión | Motivo |
| --- | --- | --- |
| 2026-11-12 | Docker como segunda vía de ejecución, no la principal | El evaluador sigue el README (§8) y puede no tener Docker; se añade al final |
| 2026-11-12 | El agente es de un solo turno, sin memoria ni herramientas; el mock no usa librerías | El PDF solo pide nombre + instrucciones y una respuesta de prueba (§3) |

## Sugerencias de la IA descartadas o corregidas

| Fecha | Sugerencia | Qué hice y por qué |
| --- | --- | --- |
| | | |

---

## 2026-11-12 · Etapa 3 — Arquitectura aprobada, validación independiente y skills

### Decisión de arquitectura (tomada por mí)

La IA presentó opciones y una recomendación; **la decisión de aprobarla fue mía**.
_(Revisar y reescribir los motivos con mis propias palabras antes de pasarlos a AI_USAGE.md.)_

**Elegido:** un repositorio con dos carpetas independientes, `backend/` (NestJS) y
`frontend/` (React + TypeScript + Vite); persistencia en archivo JSON detrás de un
repositorio; proveedor de IA como interfaz + `MockProvider` inyectado; tres endpoints
(`POST /agents`, `GET /agents`, `POST /agents/:id/run`).

**Por qué:**
- La inyección de dependencias de Nest hace visible la separación proveedor/controlador que exige §3.C.
- Dos carpetas independientes dejan claro dónde está cada parte (§6, §10) y simplifican la instalación limpia (§8).
- Prioridad: primero cumplir el escenario del evaluador, luego calidad, luego extras (§9).

**Descartado y por qué:**

| Opción descartada | Motivo |
| --- | --- |
| Monorepo con paquete compartido (workspaces) | Complejidad de build e instalación para compartir ~10 líneas de esquemas |
| Zod compartido entre frontend y backend | En Nest lo idiomático es `class-validator`; lo exigido es validar en servidor. Queda como "mejora futura" en el README |
| SQLite | Dependencia extra y riesgo de instalación; el JSON cumple §3.A |
| Librería de estado / caché de datos en frontend | Son tres llamadas; `useState` + `fetch` bastan |
| LangChain o frameworks de agentes | El agente es de un solo turno; el mock es una función |
| Docker como única vía de ejecución | El evaluador puede no tener Docker; queda como segunda vía |

### Validación independiente con otro modelo

- **Herramienta:** subagente Claude Sonnet lanzado desde Claude Code, solo lectura.
- **Prompt (resumen):** "Eres un revisor independiente. Lee el PDF y valida este plan:
  busca requisitos omitidos, elementos sin respaldo en el PDF que añadan riesgo, y riesgos
  frente al escenario de §8. Da un veredicto."
- **Veredicto:** aprobado con cambios. No encontró requisitos obligatorios omitidos.

| Observación del revisor | Qué hacemos | Estado |
| --- | --- | --- |
| Falta nombrar la demostración reproducible (§7.5) | Sección "Demostración" en el README con los pasos del flujo | Aceptada |
| `.env.example` y commits por etapa deben ir desde el inicio, no en fase 2 | Pasan a fase 1 | Aceptada |
| Variable `AI_PROVIDER` es prematura con un solo proveedor | Se mantiene la interfaz + mock; la variable solo si se hace el LLM real | Aceptada |
| Swagger compite con el README obligatorio | Se hace solo después de terminar el README | Aceptada |
| Definir comandos exactos de arranque y resolver CORS pronto | Se resuelve en la primera conexión frontend-backend | Aceptada |
| Persistencia robusta: ruta fija, archivo inexistente o vacío, escritura segura | Se incluye en fase 1 | Aceptada |
| Mostrar error también cuando el backend está caído | Ya estaba en el análisis (CA-11); se confirma | Aceptada |
| NestJS es mucho andamiaje; Express bastaría | Se mantiene NestJS por decisión mía; se justifica en el README | Descartada _(confirmar)_ |

### Herramientas de IA usadas hasta ahora (para AI_USAGE.md §5)

| Herramienta | Para qué |
| --- | --- |
| Claude Code (Claude Fable 5.2) | Análisis de requisitos, propuesta de arquitectura, bitácora |
| Subagente Claude Sonnet | Revisión independiente del plan contra el PDF |
| Claude Docs | Documento "Análisis de Requisitos y Definición de Alcance v1.0" |
| Orca | Entorno de trabajo / orquestación de agentes _(completar cómo lo usé)_ |
| CLI `npx skills` (skills.sh) | Búsqueda de skills para el stack |

### Skills evaluadas

Criterio: que aporte algo práctico a este proyecto y no empuje a sobreingeniería. Se revisó el contenido antes de recomendar.

| Skill | Veredicto | Motivo |
| --- | --- | --- |
| `kadajett/agent-nestjs-skills@nestjs-best-practices` | Útil, uso selectivo | 40 reglas; aplican las de DI con interfaces y tokens, filtros de excepción, validación de entrada, patrón repositorio y test e2e con Supertest. Se ignoran JWT, caché, microservicios, ORM |
| `vercel-labs/agent-skills@vercel-react-best-practices` | Descartada | Orientada a Next.js y rendimiento; no aporta a una sola pantalla con tres llamadas |
| `github/awesome-copilot@git-commit` | No necesaria | Solo formaliza Conventional Commits; se adopta la convención sin instalar nada |
| `docker-patterns` / `docker-development` (ya instaladas) | Para la fase 3 | Dockerfile y Compose con volumen |
| `ui-ux-pro-max` (ya instalada) | Uso mínimo | El PDF no evalúa diseño visual (§1) |

---

## 2026-11-12 · Etapa 4 — Corrección sobre Zod, librería de UI y skills instaladas

### Corrección mía a una recomendación de la IA (ejemplo para AI_USAGE.md)

- **Lo que dijo la IA:** "con Nest, Zod no es lo natural; lo idiomático es `class-validator`
  y meter Zod exige un adaptador".
- **Lo que yo señalé:** las versiones recientes de NestJS soportan Zod de forma nativa.
- **Verificación:** NestJS está en la versión 12.5 (npm). Desde la 12, `@Body()`, `@Query()` y
  `@Param()` aceptan una opción `schema` con cualquier librería Standard Schema (Zod, Valibot,
  ArkType) mediante el `StandardSchemaValidationPipe` integrado. `class-validator` sigue
  soportado. Fuentes: notas de la versión 12.0.0 y guía de migración oficial.
- **Resultado:** la recomendación de la IA estaba desactualizada. Se cambia a **Zod con el
  pipe nativo de Nest 12** para la validación en servidor.
- **Lo que se mantiene:** sin paquete compartido ni monorepo con workspaces; compartir
  esquemas queda como mejora futura.

### Decisiones

| Decisión | Motivo |
| --- | --- |
| Validación en servidor con Zod y el pipe nativo de NestJS 12 | Menos código que DTOs con decoradores; refleja el estado actual del framework |
| UI con Tailwind CSS 4 + daisyUI 5 | Elección mía. Solo CSS, sin JavaScript extra; trae `chat`, `alert`, `loading`, `card`. Estándar visual mínimo con poco esfuerzo |
| Gráfico | Pendiente: definir qué dato mostraría. El MVP no guarda consultas |

### Skills instaladas en el proyecto (`.claude/skills/`)

| Skill | Origen | Revisión |
| --- | --- | --- |
| `nestjs-best-practices` | `kadajett/agent-nestjs-skills` | Solo archivos Markdown. Escrita para `class-validator`: sus reglas de validación se contrastan con la documentación oficial de Nest 12 |
| `daisyui` | `saadeghi/daisyui` (oficial del autor de daisyUI) | Solo archivos Markdown; guía de instalación, clases y componentes de daisyUI 5 |

---

## 2026-11-12 · Etapa 5 — Control de alcance del frontend

Pregunté si aportaba un editor visual de nodos (tipo Rete.js) y si hacían falta React Router,
TanStack Query, Zustand, shadcn o WebSockets. Mi intuición era que no; la IA coincidió.

| Opción evaluada | Decisión | Motivo |
| --- | --- | --- |
| Editor visual de nodos (Rete.js, React Flow) | Descartado | Sirve para flujos de pasos conectados; el agente de la prueba es nombre + instrucciones, sin pasos ni herramientas. Sería decoración sin datos. Candidata a "mejora futura" en el README |
| Gráficos estadísticos | Descartado para el MVP | No se guardan consultas; no hay dato que mostrar |
| React Router | Descartado | Una sola pantalla |
| TanStack Query | Descartado | Tres llamadas; `fetch` + `useState` con estados de carga y error explícitos |
| Zustand | Descartado | El estado (lista, agente seleccionado, respuesta) cabe en un componente |
| shadcn/ui | Descartado | Ya se eligió daisyUI; no mezclar dos sistemas de UI |
| WebSockets / streaming | Descartado | El PDF pide una petición y una respuesta (§3.B); HTTP normal basta |

**Stack cerrado:** React + TypeScript + Vite · Tailwind CSS 4 + daisyUI 5 · NestJS 12 · Zod (pipe nativo) · archivo JSON · proveedor mock inyectado.

---

## 2026-11-12 · Etapa 6 — Librerías de frontend (decisión mía, corrige un descarte de la IA)

- **Lo que propuso la IA:** descartar TanStack Query y validar el formulario a mano, por ser pocas llamadas.
- **Lo que decidí yo:** usar **TanStack Query, Zod y React Hook Form** en el frontend.
- **Mi motivo:** tengo experiencia con ellas; el desarrollo, la gestión y la comprensión del
  código me resultan más fáciles, y dejan una base útil para los extras.
- **La IA reconsideró:** su descarte asumía un costo de aprendizaje que en mi caso no existe.
  TanStack Query cubre directamente estados de carga y error (§3.B).
- **Se mantiene descartado:** Zustand y React Router (sin estado global ni varias pantallas).
- **Compromisos:** razón breve de cada librería en el README (§6); la validación de servidor
  sigue siendo la obligatoria (§3.C); los dos esquemas Zod se duplican en frontend y backend.

**Stack final:** React + TypeScript + Vite · TanStack Query · React Hook Form + Zod ·
Tailwind CSS 4 + daisyUI 5 · NestJS 12 + Zod (pipe nativo) · archivo JSON · proveedor mock inyectado.

---

## 2026-11-12 · Etapa 7 — Backend: arquitectura, contrato de API y persistencia

### Decisiones (aprobadas por mí)

| Decisión | Motivo |
| --- | --- |
| CORS en el backend + `VITE_API_URL` con valor por defecto, **sin proxy de Vite** | Corrección mía: el proxy era innecesario para este alcance |
| Arquitectura: módulos por funcionalidad con controlador → servicio → repositorio | Estándar de Nest; hace visible la separación que pide §3.C y §6. Se descartan hexagonal, Clean Architecture y CQRS |
| Errores centralizados con un filtro de excepciones global y excepciones propias | Formato único de error; el servidor no se cae (§3.C) |
| Respuestas correctas sin envoltorio `{ data }` | Ningún requisito lo pide; evita un interceptor |
| Endpoints `POST /api/agents`, `GET /api/agents`, `POST /api/agents/:id/run` | Las tres operaciones de §3.C |
| **SQLite integrado en Node (`node:sqlite`), sin ORM**, con sentencias preparadas | Cambio respecto al JSON: escritura segura garantizada y cero dependencias. Verificado en Node 26 |

### Sobre el ORM (pregunta mía, análisis con fuentes)

- Pregunté si convenía un ORM por seguridad (inyección SQL) y facilidad de uso.
- Verificado: la inyección se evita con consultas parametrizadas, con o sin ORM. Drizzle solo
  soporta `node:sqlite` en versión beta; TypeORM necesita un driver nativo (`better-sqlite3`).
- **Decisión:** sin ORM para una sola tabla. "Migrar a un ORM si el modelo crece" va como mejora futura en el README.
- **Compromiso:** fijar la versión de Node en el README y en `.nvmrc`.

---

## 2026-11-12 · Etapa 8 — Lógica del agente, mock y plan de construcción

### Decisiones (aprobadas por mí)

| Decisión | Motivo |
| --- | --- |
| Crear un agente solo guarda una fila; el agente "funciona" al consultarlo | El PDF define el agente como nombre + instrucciones (§3.A) |
| Fase 1: mock con plantilla que muestra el mensaje que se enviaría al modelo (instrucciones como sistema, consulta como usuario) | Cumple §3.C de forma honesta, sin fingir inteligencia |
| Espera artificial de ~0,5 s en el mock | Hace visible el estado de carga (§3.B); se documenta en el README |
| Contrato del proveedor asíncrono desde el inicio | El LLM real (extra) no obligará a cambiar el servicio |
| Fase 2: regla de resumen cuando las instrucciones mencionan "resum…" | Idea mía de que el mock "haga algo"; la IA la acotó a una sola regla. Coincide con el agente del escenario (§8.2) |
| Descartado: tipos de agente preseleccionables | Cambia el modelo de datos y el formulario que define el PDF |
| Descartado: reglas por palabras clave para cada tipo de agente | Respuestas falsas y frágiles; eso es trabajo del LLM real |
| Funcionamiento sin internet tras instalar: sin CDN ni fuentes externas | Consecuencia de "sin API key ni costo" (§3.C); se añade como caso de aceptación |

### Dudas mías que la IA respondió (útil para AI_USAGE.md)

- "¿Seguro que el mock no debe hacer nada inteligente?" → El PDF pide "una respuesta de prueba"; responder de verdad requiere un LLM, que es el extra de §9.
- "¿No esperan que me ingenie algo?" → No lo exige el documento; se acordó una mejora pequeña y honesta para la fase 2.

### Plan de commits (Conventional Commits)

1. `chore: estructura inicial, .gitignore y .nvmrc`
2. `feat(backend): proyecto NestJS con CORS y prefijo /api`
3. `feat(backend): repositorio de agentes con SQLite`
4. `feat(backend): crear y listar agentes con validación Zod`
5. `feat(backend): filtro global de errores con formato único`
6. `feat(backend): proveedor de IA mock y ejecución de consultas`
7. `feat(frontend): proyecto React con Tailwind y daisyUI`
8. `feat(frontend): creación y listado de agentes`
9. `feat(frontend): panel de consulta con estados de carga y error`
10. `docs: README con arquitectura, endpoints y limitaciones`
11. `docs: AI_USAGE con el uso de IA documentado`

---

## 2026-11-12 · Etapa 9 — Construcción de la fase 1

- **Decisión mía:** usar esta carpeta como repositorio (no una subcarpeta) y verificar que
  las versiones no tengan fallos de seguridad reportados.
- **Versiones:** Node 26.13.1 (parche de seguridad del 10-nov-2026, instalado con nvm; la
  del sistema era 26.13.0), NestJS 12.5, React 19.3, Vite 8.3, Zod 4.6, Tailwind 4.3,
  daisyUI 5.8, TanStack Query 5.107. `npm audit`: 0 vulnerabilidades en ambas partes.
- **Hallazgo:** el proyecto generado por Nest traía 5 vulnerabilidades por `@nestjs/mau`
  (despliegue, sin uso). Se eliminó.
- **Commits 1–11:** estructura, backend (proyecto, SQLite, crear/listar, errores, mock y
  ejecución), frontend (proyecto, creación/listado, consulta), README y AI_USAGE.
- **Pruebas hechas:** `curl` a cada endpoint y caso de error; flujo completo en el
  navegador; backend detenido; persistencia tras reinicio; instalación limpia desde un clon.
- **Errores encontrados y corregidos durante la construcción:** ver la tabla de
  `AI_USAGE.md`.
- **Pendiente (decisión mía):** renombrar la carpeta local, crear el repositorio remoto,
  y las fases 2 y 3.

---

## 2026-11-12 · Etapa 10 — Mejora de UI/UX delegada a un worker de Codex

- **Decisión mía:** la interfaz de una sola pantalla se veía muy simple. Pedí un panel con
  menú de navegación, dos vistas con React Router, skeletons de carga y un conmutador de
  tema claro/oscuro con dos temas propios generados con el formato del theme generator
  de daisyUI.
- **Cambio respecto a una decisión anterior:** en la etapa 5 descartamos React Router
  porque había una sola pantalla. Ahora hay dos vistas (Agentes y Consultar), así que el
  enrutador tiene un uso real. La selección del agente pasa a vivir en la URL
  (`/consultar/:agentId`), y el único estado compartido nuevo es el tema.
- **Herramienta:** Orca, con un worker de Codex lanzado por Claude Code como coordinador.
  Codex lee la skill de daisyUI desde `.agents/skills/daisyui`.
- **Encargo:** especificación cerrada con alcance (solo `frontend/`), restricciones (sin
  dependencias extra salvo `react-router`, sin CDN, textos en español, conservar todo el
  manejo de errores), y evidencia obligatoria (build, lint, `npm audit`, rutas en 200,
  contraste de los temas). El worker no hace commits: reviso y confirmo yo.
- **Resultado del worker:** panel con `drawer` y `menu` (vista activa con `NavLink`),
  `navbar` con badge "Modo simulado" y conmutador `swap` sol/luna; vistas `/` (Agentes) y
  `/consultar/:agentId?` (Consultar, con `select` de agente); aviso de éxito con "Probar
  agente"; skeletons en listado y selector; estados vacíos y página 404. Tema en un
  contexto (`src/theme/`), guardado en `localStorage` con try/catch, preferencia del
  sistema por defecto y script en `index.html` contra el parpadeo. Temas `studio-light` y
  `studio-dark` en OKLCH, con todos los pares de texto por encima de 4.5:1 (calculado
  por el worker). Única dependencia nueva: `react-router` 8.5.1.
- **Evidencia del worker:** build y lint sin errores, `npm audit` 0, rutas en 200, pruebas
  con Playwright (validaciones, crear, consultar, agente inexistente, 404, móvil de 320 a
  1440 px sin desbordamiento, backend caído y reintento, tema persistente, consola limpia).
- **Mi revisión en el navegador:** cambio de tema y persistencia al recargar, "Consultar"
  desde el listado con el agente elegido en la URL, consulta con respuesta, creación con
  aviso y contador actualizado, consola sin errores.
- **Defecto que encontré:** el botón "Cerrar" del aviso verde casi no se leía (texto
  oscuro sobre verde oscuro, `btn-ghost`). Se lo devolví al worker; lo cambió a `btn btn-sm`
  (contraste 13.85:1 en claro y 15.49:1 en oscuro) y confirmó que no había otros casos.
- **Pendiente de decidir:** la etiqueta "Modo simulado" aparece dos veces en escritorio.

---

## 2026-11-12 · Etapa 11 — Mejoras propias de UX y ampliación del listado (trabajo mío)

Cambios hechos por mí, después de la entrega del worker de Codex, aplicando principios de
UX/UI para que la aplicación sea más presentable. _(completar: herramientas usadas y motivo
de cada cambio con mis palabras)_

**Frontend**

- Reorganización por responsabilidades: `app/` (proveedores y rutas), `pages/`,
  `components/agents/`, `components/consultation/`, `components/layout/`, `components/ui/`,
  `hooks/` (datos y formularios), `types/`.
- Creación de agentes en un modal (`dialog` de daisyUI) con botón "Nuevo agente".
- Listado con búsqueda (con retardo de 250 ms), orden, vista de tarjetas o lista,
  paginación y modal de detalle. Filtros y página guardados en la URL.
- Vista Consultar en dos columnas: ficha del agente y chat, con "Limpiar chat" y atajo
  Ctrl + Enter.
- Tema con el `theme-controller` de daisyUI (sin contexto de React) y temas propios
  `coffee-light` y `coffee`.

**Backend**

- `GET /api/agents` pasa a devolver `{ items, meta }` con paginación (`page`, `limit`),
  búsqueda (`search`, con los comodines de LIKE escapados) y orden (`recent`, `oldest`,
  `name`), validados con Zod.
- Nuevo `GET /api/agents/:id`.
- Primeras pruebas automatizadas: 5 unitarias del servicio y 1 e2e de la API con
  Supertest (Vitest).

**Revisión (Claude Code)**

- Build, lint, pruebas (6/6) y `npm audit` (0) en verde.
- Escenario del evaluador recorrido con Playwright: validación del formulario vacío,
  creación, persistencia tras reiniciar el backend, consulta vacía, respuesta del mock,
  agente inexistente, tema persistente, backend caído y móvil a 375 px sin desbordamiento.
  Consola sin errores.
- Hallazgos de la revisión, todos corregidos después con mi aprobación:
  - Tema oscuro con 7 de 11 pares de color por debajo de 4.5:1 (error 3.37, success 2.33,
    primary 4.26). Texto oscuro sobre los colores vivos y primario aclarado a 66 %;
    mínimo actual 5.11:1.
  - README con el contrato antiguo de `GET /api/agents` y sin la sección de pruebas.
  - `frontend/README.md` con el nombre de la carpeta y una referencia a otro proyecto.
  - `AgentList.tsx` de 432 líneas: dividido en barra de herramientas, tarjeta, fila,
    estados vacíos, avatar y enlace de consulta (queda en 189 líneas).
  - Formato de 2 archivos del backend; `.playwright-mcp/` añadido a `.gitignore`;
    `frontend/UI_UX_REPORT.md` (informe obsoleto del worker) retirado del repositorio.
  - Todo el trabajo de las etapas 10 y 11 quedó en commits separados por tema.

---

## 2026-11-12 · Etapa 12 — Editar y eliminar agentes, y avisos tipo toast

- **Decisión mía:** completar el extra «Editar o eliminar agentes» (PDF §9; opcional, no
  obligatorio) ya con lo esencial terminado, y sustituir el aviso fijo por avisos tipo
  toast que se cierran solos.
- **Antes de delegar:** se corrigieron y confirmaron los hallazgos de la etapa 11 y se
  dividió `AgentList`. Tomé de mi proyecto anterior (SistemaCalendarioDesplegable) la idea
  del aviso abajo a la derecha con pausa al pasar el ratón; aquí se implementa con un
  contexto de React en lugar de eventos globales de `window`.
- **Herramienta:** Orca, con un worker de Claude Sonnet coordinado desde Claude Code.
  Encargo cerrado: contrato (`PUT` con el esquema de creación, `DELETE` con 204), dónde
  aparecen las acciones, que los errores de mutación se queden en su modal, restricciones
  (sin dependencias, sin commits) y evidencia obligatoria.
- **Resultado:** `PUT` y `DELETE` en el backend con 4 pruebas unitarias y 5 e2e nuevas
  (9 y 6 en total); en el frontend `AgentFormModal` (crear/editar), `ConfirmDialog`,
  `DeleteAgentDialog`, `AgentActionsMenu` (dropdown de daisyUI con la API Popover) y
  `ToastProvider` + `useToast`.
- **Mi revisión:** pruebas en verde; recorrido con Playwright: toast al crear con «Probar
  agente» que desaparece solo, edición con valores precargados y validación, borrado con
  cancelación y confirmación, editar y eliminar desde Consultar (vuelve a `/consultar`),
  y error de red dentro del diálogo de borrado. Consola sin errores.
- **Riesgo descartado:** el menú usa posicionamiento por ancla de CSS; comprobé que
  Firefox 159 lo soporta.

---

## 2026-11-12 · Etapa 13 — Limpieza de la interfaz del listado (decisión mía)

- **Decisión mía:** quitar lo que sobraba y ordenar mejor.
  - Fuera el modal «Ver instrucciones» (botón del ojo y botón «Detalles»): la tarjeta y la
    fila ya muestran las instrucciones, y la ficha de Consultar las muestra completas.
  - Fuera el enlace «← Volver al listado» de la ficha de Consultar: el selector de agente
    y el menú lateral ya cubren esa navegación.
  - Fila de la vista en lista reordenada: nombre e instrucciones a la izquierda, fecha
    discreta, y al final Consultar más las acciones.
  - Editar y eliminar como iconos (lápiz y papelera) siempre visibles, en lugar del menú
    «⋯»: con solo dos acciones, el menú añadía un clic y las escondía.
- **Aclaración:** el selector de orden («Más recientes…») se mantiene; cuando dije «el
  orden» me refería a ordenar mejor la fila.
- **Principios aplicados (propuestos por la IA, aprobados por mí):** acciones frecuentes
  visibles; iconos con tooltip y `aria-label`; la acción destructiva se tiñe de rojo solo
  al pasar el ratón o con foco, para no competir con Consultar; sin elementos redundantes.
- **Iconos:** daisyUI no incluye iconos (es solo CSS), así que son SVG en línea en
  `components/ui/icons.tsx`, sin librerías nuevas.
- **Revisión:** build y lint en verde; capturas de tarjetas, lista (escritorio y móvil a
  390 px sin desbordamiento) y ficha de Consultar; consola sin errores.

---

## 2026-11-12 · Etapa 14 — Vista Consultar reorganizada y ajustes finos (decisión mía)

- **Tooltip:** pedí más separación entre el texto y el icono. Primero fue una clase en el
  componente; luego pregunté qué hacía y se movió a una regla global en `index.css`
  (`--tt-off` / `--tt-tail` de daisyUI), así todos los tooltips quedan igual y el
  componente solo usa `tooltip`.
- **Color al pasar el ratón:** editar en amarillo y eliminar en rojo. Se rellena el fondo
  del botón (con su texto `*-content`) y no solo el icono, porque un icono amarillo sobre
  fondo claro tiene contraste 1.6:1 y no se distingue.
- **Vista Consultar:** elegí la opción «panel del agente a la izquierda» entre dos
  propuestas. Problemas que resolvía: el selector estaba lejos de la ficha que controla,
  el nombre del agente aparecía tres veces, el chat tenía una altura fija pequeña y
  quedaban huecos grandes.
  - Columna izquierda (`AgentPanel`): selector, instrucciones, fecha, Editar y Eliminar.
  - Columna derecha: chat a todo el alto disponible, con el campo fijo abajo; cabecera
    «Conversación» y burbujas «Tú» / «Agente».
  - En móvil, el botón de envío muestra solo el icono; «Enviar consulta» sigue siendo su
    nombre accesible.
- **Menú lateral:** se quitó el bloque inferior («Modo simulado» y su texto), que repetía
  la etiqueta de la barra superior; esa etiqueta ahora también se ve en móvil.
- **Lo que exige la prueba se conserva (§3.B, §8.4):** campo de consulta, botón que llama
  al backend, estado de carga («Enviando…» y burbuja de espera) y errores legibles
  (consulta vacía, agente inexistente, backend caído).
- **Revisión:** build y lint en verde; recorrido con Playwright: sin agente, con agente,
  consulta vacía, carga, respuesta, agente inexistente, móvil a 390 px sin desbordamiento,
  tooltip; consola sin errores (salvo el 404 esperado al abrir un agente inexistente).

---

## 2026-11-12 · Etapa 15 — Tema más redondeado y sobrio, y Consultar en vertical (decisión mía)

- **Consultar:** no me convenció el panel a la izquierda. Pedí volver a algo parecido al
  anterior, con un encabezado que dé contexto (qué agente, con qué instrucciones) y el
  chat debajo. Ahora:
  - Arriba, `AgentPanel`: selector con Editar y Eliminar al lado, e instrucciones con el
    número de caracteres y la fecha; si son largas se recortan a tres líneas con
    «Mostrar todo».
  - Debajo, el chat a todo el ancho y al alto restante. Mis mensajes en burbuja violeta
    (primario) y los del agente en lila suave (primario al 10 %).
- **CSS:** el estilo anterior no me agradaba. Tomé como referencia el aspecto de los
  componentes de la documentación de daisyUI: más redondeado, sobrio y consistente.
  - Temas renombrados a `studio-light` y `studio-dark` (ya no tenían que ver con «coffee»).
  - Esquinas: `--radius-box` de 0 a 1rem (tarjetas, modales, avisos), campos a 0.5rem.
  - `--noise: 0`: se quita la textura granulada.
  - Primario de magenta a violeta; bases con un leve tono violeta.
  - Foco de teclado y de los campos en el primario, en lugar del anillo negro de
    daisyUI; los campos con error siguen en rojo.
- **Contraste:** todos los pares de texto de los dos temas por encima de 4.5:1 (mínimo
  5.11:1), calculado antes de aplicar.
- **Revisión:** build y lint en verde; capturas de Agentes, modal y Consultar con
  respuesta en claro y oscuro, y Consultar en móvil (390 px, sin desbordamiento); consola
  sin errores.

---

## 2026-11-12 · Etapa 16 — Tema propio del theme generator y componentes nativos de daisyUI (cierre de la UI)

- **Decisión mía:** el estilo seguía sin convencerme. Diseñé un tema en el theme generator
  de daisyUI y pedí apoyarse más en componentes de daisyUI y menos en utilidades sueltas
  de Tailwind. Con esto doy por cerrada la interfaz.
- **Tema:** decodificado desde la URL del generador (el tema va comprimido en la propia
  URL; no hubo que descargar nada). Fondos azul marino, primario verde esmeralda,
  secundario violeta, campos en píldora, bordes de 2px.
  - `studio-dark` es mi tema tal cual, salvo `primary-content`: el texto blanco sobre el
    verde daba 3.46:1; con texto oscuro sube a 4.78:1.
  - `studio-light` usa la misma paleta y forma con bases claras.
  - Contraste: todos los pares de los dos temas por encima de 4.5:1.
- **Componentes:** la vista en lista pasa a `table`; la inicial del agente a `avatar`; el
  selector de Consultar a `fieldset`; las instrucciones a un `collapse` (desplegable
  nativo); el chat usa `chat-image`, `chat-header`, `chat-footer` (proveedor) y la burbuja
  violeta para mis mensajes; los modales usan `modal-bottom` en móvil y `modal-middle` en
  escritorio.
- **Revisión:** build y lint en verde; capturas de tarjetas, tabla, modal y Consultar en
  claro y oscuro, y tabla en móvil (390 px, sin desbordamiento); consola sin errores.
