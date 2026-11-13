# Bitácora del proceso — Mini Agent Studio

Registro de trabajo. Sirve de materia prima para `AI_USAGE.md` (PDF §5), que exige:
herramientas usadas, al menos dos prompts, qué hizo la IA y qué cambié yo, cómo verifiqué
y qué recomendaciones corregí o descarté.

Formato de cada entrada: fecha · etapa · prompt (resumido) · resultado · qué validé / corregí / descarté.

## Cómo leer esta bitácora

Es el registro completo, etapa por etapa (36 en total). Para una lectura rápida:

- **Lo obligatorio** quedó en las etapas 1–9 (análisis, stack, backend, frontend y
  documentación); el resto son extras del §9 y pulido.
- **Quién hizo qué**, con modelos y horas: etapa 35.
- **Las etapas 13–17** son iteraciones de la interfaz (probé un tema verde del generador
  y volví al violeta); la versión que se queda es la de la etapa 17.

### Las 8 decisiones clave

| # | Decisión | De quién | Etapa |
| --- | --- | --- | --- |
| 1 | Dos carpetas independientes; NestJS por capas (controlador → servicio → repositorio) y el proveedor de IA detrás de una interfaz | Propuesta de la IA, NestJS idea mía, aprobada por mí | 3, 7 |
| 2 | Zod nativo de NestJS 12 en lugar de `class-validator` | Corrección mía a la IA | 4 |
| 3 | TanStack Query, React Hook Form y Zod en el frontend | Mía, contra el descarte de la IA | 6 |
| 4 | SQLite integrado en Node, sin ORM | Pregunta mía, decidida con fuentes | 7 |
| 5 | Mock honesto: muestra lo que se enviaría al modelo, sin fingir inteligencia | Acordada; descarté las reglas por palabras clave | 8 |
| 6 | Panel con dos vistas y React Router; el agente elegido vive en la URL | Mía | 10 |
| 7 | Consolidación tras un análisis de sobreingeniería: «quien muestra, pide; la página coordina» | Pedido mío; regla propuesta por la IA | 20–22 |
| 8 | Proxy de Vite para que CORS no rompa la app si cambia el puerto | Problema hallado por la IA; decisión mía | 27 |

---

## 2026-11-12 · Etapa 1 — Análisis de requisitos

- **Herramienta:** Claude Code (Claude Fable 5.2).
- **Prompt (resumen):** "Actúa como analista de requisitos y arquitecto. Analiza el PDF de la
  prueba, clasifica requisitos (explícito / inferido / propuesto), define MVP, riesgos y
  criterios de aceptación. No escribas código ni elijas stack todavía."
- **Resultado:** documento "Análisis de Requisitos y Definición de Alcance v1.0"
  (11 requisitos funcionales, 20 casos de aceptación, 10 decisiones pendientes).
- **Validado por mí:** lo leí y aprobé pasar a la siguiente etapa con mis palabras: «Sí,
  apruebo como primera etapa; documenta y ten en cuenta que esta decisión la tomé yo, por
  qué opté por esta arquitectura y qué descarté». Pedí además una revisión independiente
  con otro modelo (etapa 3).
- **Corregido o descartado:** nada en esta etapa; las correcciones llegan en las etapas 3 a 7.

## 2026-11-12 · Etapa 2 — Cómo funciona el agente, Docker y referencias

- **Prompt (resumen):** "¿Qué indica el PDF para el desarrollo? Quiero usar Docker para la
  reproducción. ¿Cómo haremos funcionar el agente, qué librerías caben en las reglas, qué tan
  dinámico debe ser y qué proyectos similares sirven de inspiración?"
- **Resultado:** el agente es nombre + instrucciones, de un solo turno; el mock no necesita
  librerías; Docker se recomienda como vía secundaria, no única.
- **Validado por mí:** acepté Docker como segunda opción: «Docker como segunda opción,
  considerándolo, pero como un segundo tipo; ahora tenemos que definir el alcance, el stack
  y las librerías».
- **Corregido o descartado:** mi idea inicial era usar Docker como vía principal; la
  cambié a secundaria.

---

## Decisiones tomadas

| Fecha | Decisión | Motivo |
| --- | --- | --- |
| 2026-11-12 | Docker como segunda vía de ejecución, no la principal | El evaluador sigue el README (§8) y puede no tener Docker; se añade al final |
| 2026-11-12 | El agente es de un solo turno, sin memoria ni herramientas; el mock no usa librerías | El PDF solo pide nombre + instrucciones y una respuesta de prueba (§3) |

## Sugerencias de la IA descartadas o corregidas

| Fecha | Sugerencia | Qué hice y por qué |
| --- | --- | --- |
| 2026-11-12 | Ver cada etapa | Se registran dentro de cada etapa y se resumen en `AI_USAGE.md` |

---

## 2026-11-12 · Etapa 3 — Arquitectura aprobada, validación independiente y skills

### Decisión de arquitectura (tomada por mí)

La IA presentó opciones y una recomendación; **la decisión de aprobarla fue mía**. Mi
criterio, con mis palabras: «primero cumplir y luego ir por más, porque no solo es ver que
lo resuelva, sino mi experiencia, conocimiento y criterio para resolver de la mejor manera
y más práctica este tipo de ejercicios».

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
| Monorepo con paquete compartido (workspaces) | Idea mía; descartada por la complejidad de build e instalación para compartir ~10 líneas de esquemas |
| Zod compartido entre frontend y backend | En Nest lo idiomático es `class-validator`; lo exigido es validar en servidor. Queda como "mejora futura" en el README. _(La premisa era falsa: la corregí en la etapa 4, Nest 12 soporta Zod)_ |
| SQLite | Dependencia extra y riesgo de instalación; el JSON cumple §3.A. _(Cambiado en la etapa 7 a pregunta mía: Node trae SQLite integrado)_ |
| Librería de estado / caché de datos en frontend | Son tres llamadas; `useState` + `fetch` bastan. _(Cambiado en la etapa 6: elegí TanStack Query)_ |
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
| NestJS es mucho andamiaje; Express bastaría | Se mantiene NestJS por decisión mía; se justifica en el README | Descartada |

### Herramientas de IA usadas hasta ahora (para AI_USAGE.md §5)

| Herramienta | Para qué |
| --- | --- |
| Claude Code (Claude Fable 5.2) | Análisis de requisitos, propuesta de arquitectura, bitácora |
| Subagente Claude Sonnet | Revisión independiente del plan contra el PDF |
| Claude Docs | Documento "Análisis de Requisitos y Definición de Alcance v1.0" |
| Orca | IDE de varios agentes: Claude Code coordinó desde ahí a los workers de Codex, Claude Sonnet y Antigravity, y yo usé Codex y Antigravity directamente en sus paneles (detalle en la etapa 35) |
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
| React Router | Descartado | Una sola pantalla. _(Cambiado en la etapa 10: dos vistas)_ |
| TanStack Query | Descartado | Tres llamadas; `fetch` + `useState` con estados de carga y error explícitos. _(Cambiado en la etapa 6, decisión mía)_ |
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
| CORS en el backend + `VITE_API_URL` con valor por defecto, **sin proxy de Vite** | Corrección mía: el proxy era innecesario para este alcance. _(Revertido en la etapa 27: con el 5173 ocupado, CORS bloqueaba la app)_ |
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
- **Herramienta:** Orca, con un worker de Codex (modelo `gpt-6.1-sol`) lanzado por Claude
  Code (Claude Opus 5.5) como coordinador. Codex lee la skill de daisyUI desde
  `.agents/skills/daisyui`. Mi pedido: «delega a un agente de Codex, usando la skill de
  daisyUI, un panel con dos vistas, menú de navegación y skeletons, y que use el theme
  generator para generar dos temas».
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
  con Playwright MCP (validaciones, crear, consultar, agente inexistente, 404, móvil de 320 a
  1440 px sin desbordamiento, backend caído y reintento, tema persistente, consola limpia).
- **Mi revisión en el navegador:** cambio de tema y persistencia al recargar, "Consultar"
  desde el listado con el agente elegido en la URL, consulta con respuesta, creación con
  aviso y contador actualizado, consola sin errores.
- **Defecto que encontré:** el botón "Cerrar" del aviso verde casi no se leía (texto
  oscuro sobre verde oscuro, `btn-ghost`). Se lo devolví al worker; lo cambió a `btn btn-sm`
  (contraste 13.85:1 en claro y 15.49:1 en oscuro) y confirmó que no había otros casos.
- **Pendiente de decidir:** la etiqueta "Modo simulado" aparece dos veces en escritorio.

---

## 2026-11-12 · Etapa 11 — Mejoras de UX y listado paginado (dirigidas por mí con Codex y Antigravity)

Tras la entrega del worker, seguí por mi cuenta, fuera de Claude Code: abrí yo mismo dos
agentes en Orca y les di las instrucciones directamente. Las decisiones y los prompts son
míos; el código lo escribieron ellos. Después le pedí a Claude Code que lo revisara.

**Con Codex (`gpt-6-astra`, sesión interactiva mía, 20:07–21:30):**

- «Necesito que me ayudes a pulir, organizar y mejorar la presentación y la
  componentización de mi proyecto de React. Quiero imitar la arquitectura de frontend de
  [mi proyecto SistemaCalendarioDesplegable], no a esa escala, pero sí hay cosas que me
  gustaría ordenar. […] La primera opción del selector debería ser no seleccionable, solo
  mostrable. […] Con la skill de daisyUI, sería mejor usar una notificación para mostrar
  cuándo se hizo correctamente.»
- «Considero que mejor que un toast sea un alert […]. Aplicar un modal para el formulario
  de creación de un agente […] y el theme controller: verifica si podemos aplicar algo de
  manera nativa, como dice la documentación de daisyUI, para ver si está de más crear un
  contexto.»
- Le pasé mi tema `coffee` del theme generator para el modo noche y le pedí su opuesto
  para el día.
- Consultar: probé tres distribuciones. La última se la pedí así: «que se muestre claro
  qué agente se selecciona, que las instrucciones se vean claras desde el inicio y que en
  el chat una persona ya pueda consultar, como indica el PDF de la prueba». Codex leyó el
  PDF antes de cambiarla.
- Codex comprobó cada cambio con Playwright MCP, con la API simulada (no contra el backend
  real); la comprobación con el backend real la hizo después Claude Code.

**Con Antigravity CLI (Gemini 4 Argon High, sesión mía, 21:37–21:46):**

- «Necesito que me ayudes a pulir mejor la vista: puedes usar paginación y componentes de
  daisyUI, organizar mejor los agentes y en la API agregar paginado para gestionar mejor,
  y cargarlos con nuestro stack de TanStack Query; que no haga scroll y mejora la
  experiencia y el flujo de usuario.»
- Hizo el paginado del backend, sus pruebas y la paginación del frontend (detalle abajo),
  con lint, build y pruebas en verde, y lo comprobó con Playwright MCP.

Mi motivo, con mis palabras: «hice cambios y mejoras de UX por mi cuenta, aplicando
principios de UX/UI para el performance; sé que no se califica, pero es una base para que
el sistema esté más presentable y pulido».

**Frontend** (Codex, salvo la paginación, la búsqueda y la vista en lista, que son de Antigravity)

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

**Backend** (Antigravity)

- `GET /api/agents` pasa a devolver `{ items, meta }` con paginación (`page`, `limit`),
  búsqueda (`search`, con los comodines de LIKE escapados) y orden (`recent`, `oldest`,
  `name`), validados con Zod.
- Nuevo `GET /api/agents/:id`.
- Primeras pruebas automatizadas: 5 unitarias del servicio y 1 e2e de la API con
  Supertest (Vitest).

**Revisión (Claude Code, Claude Opus 5.5)**

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
- **Herramienta:** Orca, con un worker de Claude Sonnet 5.5 coordinado desde Claude Code.
  Mi pedido: «el documento pide poder editar y eliminar; tenemos que hacer esos flujos.
  Delégalo a un agente de Orca con Sonnet, pero primero define el alcance y los
  componentes».
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

---

## 2026-11-12 · Etapa 17 — Vuelta al tema violeta, lista original y auditoría (cierre de la UI)

- **Decisión mía:** el tema del generador (verde, píldoras, bordes de 2px) no me gustó
  aplicado a toda la app. Vuelvo al violeta de la etapa 15, con el modo oscuro en violeta
  noche, y me quedo con los componentes nativos de daisyUI de la etapa 16.
- **Lista:** la tabla de la etapa 16 no me convenció. Vuelve la lista con filas de la etapa
  13 (`list` de daisyUI): nombre e instrucciones debajo, fecha a la derecha y acciones.
- **Scroll horizontal en la tabla:** la causa era doble. En escritorio, el tooltip
  invisible de los iconos de la última columna desbordaba 7px dentro de un contenedor
  con `overflow-x-auto`; en móvil, el botón «Consultar» con texto no cabía (365px en
  324px). Solución: sin contenedor de scroll y «Consultar» solo con el icono en móvil.
  Comprobado sin scroll horizontal en 1880, 1440, 768 y 390px, en tarjetas y lista.
- **Avisos y tooltips nativos:** se quitan las animaciones propias de los toasts (queda la
  de daisyUI) y la separación propia de los tooltips. El aviso usa la estructura de
  `alert` de la documentación de daisyUI. Se conserva la pausa al pasar el ratón.
- **Auditoría del frontend:** sin archivos ni exportaciones sin uso; 8 exportaciones que
  solo se usaban dentro de su archivo pasan a internas; las claves de caché de TanStack
  Query quedan juntas y antes de usarse; comentarios de `ThemeToggle` en español; cada
  archivo con una línea que explica su propósito.
- **Revisión:** build y lint en verde; recorrido completo en una instancia aislada con base
  temporal (crear con toast, editar, eliminar con confirmación, Consultar, error de red);
  capturas en claro y oscuro; consola sin errores.
- **Ajuste final:** vuelve el resaltado al pasar el ratón por las tarjetas (el borde se
  oscurece), que se había perdido en la etapa 16, y la fila de la lista usa el mismo
  criterio (fondo gris claro al pasar el ratón).

---

## 2026-11-12 · Etapa 18 — Menú en violeta, icono de la aplicación y favicon

- **Menú lateral (decisión mía):** el elemento activo y el recuadro del logo pasan al
  violeta primario, como los botones. Se usan las variables de daisyUI
  `--menu-active-bg` y `--menu-active-fg`.
- **Icono y favicon:** lo delegué a un worker de Antigravity en Orca con el modelo más
  reciente disponible, `gemini-4-hydrogen-xhigh` (lista obtenida con `agy models`),
  porque Antigravity tiene generación de imágenes integrada.
  - Encargo: icono legible a 16 px, sin texto, con los colores del tema; exploración con
    imágenes generadas fuera del repositorio, pero resultado final en SVG dibujado a mano.
  - Resultado: estrella de IA de cuatro puntas dentro de una órbita con un nodo agente.
    `favicon.svg` (467 bytes), `favicon-32x32.png` y `apple-touch-icon.png` (180×180)
    generados con `rsvg-convert`; `AppLogo.tsx` con el mismo glifo en `currentColor`
    para el menú lateral.
- **Mi revisión:** imagen del favicon a 16, 32 y 180 px sobre fondo claro y oscuro;
  los tres iconos se sirven con su tipo correcto y están enlazados en `index.html`;
  logo del menú en los dos temas; build y lint en verde.
- **Decisión mía sobre el lápiz:** al pasar el ratón, el icono de editar queda en blanco
  sobre el amarillo. El cambio se lo pedí directamente a Codex en mi sesión interactiva
  («al hacer hover, que el icono se haga blanco como el de la papelera»). La IA avisó de que ese par da 1.78:1 (un icono necesita 3:1) y
  decidí mantenerlo así por estética.

---

## 2026-11-12 · Etapa 19 — Arquitectura del frontend reorganizada

- **Motivo (mío):** al revisar `AgentsPage` vi `useCallback` en todas las funciones y me
  pareció de más para este proyecto. Pedí reorganizar el frontend de forma práctica:
  funciones, hooks, API y enrutado ordenados, tomando como referencia solo la estructura
  de mi proyecto anterior y la documentación de React Router.
- **Análisis previo (IA):** `useCallback` no aportaba casi nada: ningún hijo usa
  `React.memo` y, en React Router 8.5.1, `setSearchParams` cambia de identidad con cada
  cambio de URL (comprobado en su código), así que las funciones se recreaban igualmente.
- **Cambios:**
  - Enrutado con `createBrowserRouter` y objetos de ruta (modo de datos), `RouterProvider`
    de `react-router/dom`, ruta raíz `RootLayout` y `ErrorPage` como `ErrorBoundary`
    (dentro del panel gracias a una ruta sin `path`). Se eliminan `App.tsx`,
    `AppProviders.tsx` y `AppRoutes.tsx`.
  - Hooks agrupados por dominio: `hooks/agents/` (`agentKeys`, `useAgentQueries`,
    `useAgentMutations`, `useAgentForm`, `useAgentsListParams`) y `hooks/consultation/`.
  - `useAgentsListParams` guarda página, orden y búsqueda en la URL; `AgentList` y
    `AgentsPage` lo usan directamente, sin pasar siete props de uno a otro.
  - Fuera los `useCallback` de la página y el prefetch de la página siguiente (no
    aportaba nada con 6 agentes por página y un backend local). Solo `ToastProvider`
    conserva `useCallback`, porque el temporizador de cada aviso depende de él.
  - `utils/formatDate.ts` para la fecha, que usaban dos dominios.
  - El paquete pasa a 509 KB (156 KB comprimido) por el router de datos; se sube el
    umbral del aviso de Vite a 600 KB con un comentario en lugar de dividirlo.
- **Revisión:** build y lint en verde; sin archivos ni exportaciones sin uso; en una
  instancia aislada: paginación, orden y búsqueda en la URL (se conservan al recargar),
  página fuera de rango corregida, 404 dentro del panel, enlace directo a Consultar, y el
  recorrido completo de crear, editar, eliminar, consultar y errores; consola sin errores.

---

## 2026-11-12 · Etapa 20 — Auditoría y consolidación del frontend

- **Motivo (mío):** el frontend me parecía demasiado complicado y sin una estructura
  coherente entre componentes. Pedí una auditoría completa, buscar skills de TanStack y
  React, y ordenar componentes, hooks y formularios.
- **Auditoría (IA):** la base era sana (api → hooks → componentes, datos en TanStack
  Query, filtros en la URL). El desorden estaba dentro de los componentes, por haberse
  rehecho unas diez veces en un día entre cinco autores. Hallazgos medidos:
  5 props que pasaban un hook entero (`ReturnType<typeof useX>`), el flujo editar/eliminar
  escrito dos veces, el cableado de `<dialog>` duplicado, la alerta con «Reintentar»
  copiada tres veces, 12 iconos SVG sueltos en 7 archivos y `useAgent` con `initialData`
  sin marca de tiempo (daba por fresco 30 s un agente sin confirmarlo con el backend).
- **Decisión (propuesta de la IA, aprobada por mí):** no cambiar otra vez las carpetas
  (son las de mi proyecto de referencia) y consolidar con reglas fijas. Se descartó pasar
  a `features/`: con una sola entidad crea fronteras artificiales.
- **Skills:** instaladas `tanstack-query-best-practices` (deckardger) y
  `vercel-composition-patterns` (Vercel) tras leer su contenido. Descartadas:
  `react-composition-2026` (mismo contenido), `tanstack-query` genérica de 21 KB,
  `bulletproof-react` (87 instalaciones, incluye un script y desaconseja su estructura a
  este tamaño) y `react-hook-form` (innecesaria para dos formularios).
- **Cambios:**
  - `useAgentActions()` + `AgentActionsProvider`: único camino para crear, editar y
    eliminar; guarda el diálogo abierto y avisa con un toast. Fuera las funciones pasadas
    en cadena y los modales duplicados en `AgentList` y `AgentPanel`.
  - `Modal` único en `ui/` (usado por el formulario y por `ConfirmDialog`), `ErrorAlert`
    con reintento y todos los iconos en `ui/icons.tsx`.
  - Cada formulario llama a su hook: `AgentFormModal` (absorbe `AgentForm`) y `QueryForm`.
    `AgentChat` es el contenedor de la consulta; `ChatMessages` solo pinta.
  - `AgentSelector` pide sus propias opciones; `AgentPanel` ya no recibe consultas por props.
  - `Sidebar` separado del layout; avisos de 6 archivos a 3; fuera archivos diminutos.
  - `useAgent` usa `placeholderData` y siempre confirma con el backend.
- **Resultado medido:** de 52 a 49 archivos; las líneas quedan casi igual (2.762 → 2.754)
  porque lo que se quitó duplicado se centralizó. Lo que cambia: 0 hooks pasados por
  props, 1 solo cableado de `<dialog>`, 1 sola alerta con reintento, ningún SVG fuera de
  `icons.tsx`, y el componente más grande baja de 184 a 127 líneas. La estimación inicial
  de la IA («unos 40 archivos y cientos de líneas menos») fue optimista.
- **Revisión:** build y lint en verde; sin archivos ni exportaciones sin uso; en una
  instancia aislada con base temporal: recorrido completo (crear, editar, eliminar,
  consultar, errores), rutas y estado en la URL, foco devuelto al botón al cerrar un
  modal, confirmación del agente con el backend y borrado desde Consultar sin parpadeo.
  Dos comprobaciones fallaron por sincronización de la prueba y pasaron al repetirlas con
  esperas correctas. Consola sin errores.

---

## 2026-11-12 · Etapa 21 — Revisión de sobreingeniería y tema nativo de daisyUI

- **Motivo (mío):** sentía que el frontend estaba demasiado complicado para lo que pide
  el PDF y que no entendía el orden de los componentes. Pedí un análisis sincero.
- **Análisis (IA):** el código es correcto, pero desproporcionado: unas 2.750 líneas en
  50 archivos para un formulario, una lista, un selector y una consulta. Más de un tercio
  son funciones no pedidas, y la composición mezcla props y contexto, lo que obliga a abrir
  5 archivos para seguir un clic en «Editar». Hay un mismo concepto con cuatro nombres
  (consult, run, query, chat).
- **Decisión mía:** se quedan la búsqueda con debounce (evita una petición por letra) y
  editar/eliminar. El tema se limpia siguiendo la skill de daisyUI.
- **Cambio (IA, autorizado por mí):** el tema pasa a ser solo CSS de daisyUI. Al cargar
  se usa el del sistema (`prefersdark`); el `theme-controller` del `swap` tiene como
  `value` el tema contrario y daisyUI lo aplica mientras está marcado. Se eliminan el
  estado de React, `localStorage`, `data-theme` y el script de `index.html`, y también el
  CSS propio de foco (la regla 7 de la skill: no escribir CSS que daisyUI ya resuelve).
  Se mantiene `prefers-reduced-motion` por accesibilidad.
- **Descartado:** conservar el tema elegido al recargar. Necesita el script de
  `index.html` y `localStorage`, que daisyUI no cubre; ahora se vuelve al tema del sistema.
- **Revisión:** build y lint en verde; con Playwright, con el sistema en claro y en
  oscuro, la casilla cambia al tema contrario y vuelve con la barra espaciadora; consola
  sin errores.

---

## 2026-11-13 · Etapa 22 — Composición «quien muestra, pide; la página coordina» y guía del frontend

- **Motivo (mío):** no entendía el orden de los componentes ni qué hacía cada cosa. Pedí
  organizar primero y una guía de cada librería. La paginación, el orden y la búsqueda se
  quedan, pero el frontend solo debe pedirlos al backend con filtros.
- **Corrección de una decisión anterior (propuesta de la IA, aprobada por mí):** en la
  etapa 20 la IA introdujo `AgentActionsProvider` + `useAgentActions` (contexto) siguiendo
  la skill `vercel-composition-patterns`, que está pensada para librerías de componentes.
  En una app de dos pantallas escondía las dependencias: seguir un clic en «Editar»
  obligaba a abrir 7 archivos. Se sustituye por `useState` en la página + `AgentDialogs`
  (componente normal) + props `onEdit` / `onDelete`.
- **Regla nueva:** quien muestra datos del servidor llama a su hook de TanStack Query; la
  página coordina lo que comparten sus secciones (el diálogo abierto); el resto solo pinta
  y avisa por props. La IA propuso al principio subir todos los datos a la página; lo
  descartó porque obligaba a pasar resultados de `useQuery` por props (lo que la etapa 20
  ya había quitado).
- **Cambios:**
  - Nombres con un solo vocabulario: `consultation/` → `consult/`; `AgentChat` →
    `ConsultBox`, `ChatMessages` → `ConsultMessages`, `QueryForm` → `ConsultForm`,
    `AgentPanel` → `AgentInstructions` (el selector y las acciones suben a `ConsultPage`),
    `AgentQuickActions` + `AgentPanelActions` → `AgentActions` con `variant`,
    `RootLayout` + `StudioLayout` → `AppLayout`, `app/router.tsx` → `router.tsx`.
  - Hooks: `useAgentQueries` + `useAgentMutations` → `hooks/useAgents.ts`. Los hooks de
    formulario de un solo uso (`useAgentForm`, `useQueryForm`) vuelven a su componente con
    el `useForm` dentro.
  - Filtros: el frontend ya no fija el tamaño de página (lo decide el backend), no recorta
    la búsqueda y no corrige la página fuera de rango con un `useEffect`; muestra lo que
    responde el backend («No hay agentes en esta página» + «Ir a la página 1»).
  - `useAgent` sin `placeholderData` sacado de los listados: siempre lo pide al backend.
  - Avisos: fuera `error` e `info`, que nadie usaba. Se conserva la pausa al pasar el
    ratón (idea mía de un proyecto anterior).
- **Defecto encontrado en la revisión (ya existía antes):** limpiar la búsqueda y ordenar
  en menos de 100 ms devolvía la búsqueda a la URL, porque `useAgentsListParams` partía de
  los parámetros del último render. Ahora parte de `window.location.search`.
- **Resultado medido:** de 49 a 44 archivos TS y de 2.754 a 2.682 líneas. La IA había
  estimado unas 300 líneas menos; la ganancia real está en la lectura, no en el tamaño.
- **Guía:** `frontend/README.md` reescrito: mapa de carpetas, vocabulario, reglas de
  composición con el árbol de cada página, qué hace cada librería y dónde vive, dónde va
  cada estado y cómo añadir algo nuevo.
- **Revisión:** build y lint en verde; Playwright con backend y base temporales, 27
  comprobaciones: crear (con validación), aviso y «Probar agente», paginación, página
  fuera de rango, búsqueda con una sola petición, orden, vista en lista, editar y eliminar
  desde el listado y desde Consultar, consulta vacía y con respuesta, agente inexistente,
  404 y consola sin errores. Con el backend detenido, mensaje legible y «Reintentar».
  Dos fallos de la prueba (lectura antes de llegar los datos y un texto no exacto) se
  corrigieron en la prueba, no en la aplicación.

---

## 2026-11-13 · Etapa 23 — `useAgentsListParams` se mantiene y los avisos pasan a Sonner

- **Duda mía sobre `window.location.search`** en `useAgentsListParams`. La IA dijo
  primero que no corregía ningún fallo actual y propuso revertir; al revisar la etapa 22
  se corrigió: limpiar la búsqueda y ordenar seguido sí devolvía la búsqueda a la URL.
  **Decisión mía:** se mantiene. Es una sola línea y corrige un fallo comprobado.
- **Análisis (IA) contra las skills de composición y TanStack Query:** se cumplen. Sin
  props booleanas que cambien el comportamiento, datos pedidos donde se muestran, claves
  de caché con fábrica y mutaciones que invalidan los listados. Quedan detalles menores
  pendientes de aprobar (`AgentsSkeleton` con el tipo `AgentView`, `onSubmit` directo en
  `AgentFormModal`, variantes de `AgentActions` y `AgentsEmptyState`).
- **Motivo (mío):** el sistema de avisos me parecía demasiado código: 3 archivos y unas
  150 líneas (contexto, proveedor, temporizador con pausa) para un solo componente que
  lo usa.
- **Análisis (IA):** el `toast` de daisyUI es solo una clase de posición; no tiene
  JavaScript ni plugin, así que la cola y el temporizador siempre van aparte.
- **Decisión mía:** usar **Sonner** (el paquete `sonner` solo; pregunté si hacía falta
  shadcn y no: shadcn solo lo envuelve). Versión 2.0.8, sin dependencias propias,
  `npm audit` con 0 vulnerabilidades.
- **Cambio (IA, autorizado por mí):** se borra `ui/toast/` (`ToastProvider`, `ToastItem`,
  `useToast`). `<Toaster />` en `AppLayout` y `showSuccess()` en `ui/toast.tsx`, que pinta
  el aviso con `toast.custom()` y el `alert` de daisyUI para que siga el tema activo.
- **Descartado:** los estilos propios de Sonner (su tema sigue al sistema, no al
  `theme-controller` de daisyUI) y quitar los avisos (se perdía «Probar agente»).
- **Diferencia aceptada:** Sonner pausa la cuenta con el ratón encima, pero no con el
  foco del teclado dentro del aviso.
- **Revisión:** build y lint en verde. Con Playwright: el aviso sigue visible tras 5 s
  con el ratón encima y se cierra al salir; «Probar agente» abre Consultar y cierra el
  aviso; se ve bien en claro, oscuro y móvil; consola sin errores. Los agentes de prueba
  se borraron.
- **Ajuste de aspecto (pedido mío):** el verde de `alert-success` no casaba con la paleta
  violeta. El aviso pasa a `base-100` con borde y sombra, y el icono y «Probar agente» en
  `primary`, igual que el resto de la interfaz. Se quita el botón ✕: el aviso se cierra
  solo a los 4 s o al pulsar la acción. Comprobado con Playwright en claro, oscuro y móvil.

---

## 2026-11-13 · Etapa 24 — Enlaces en un solo sitio y listado más declarativo

- **Propuesta (IA), aprobada por mí (puntos 1 y 2 de la revisión de arquitectura):**
  - **`paths.ts`:** `/consultar/${encodeURIComponent(id)}` estaba escrito a mano en tres
    archivos y `"/"` en cinco. Ahora `paths.agents` y `paths.consult(id?)`; los usan
    `ConsultAgentLink`, `AgentDialogs`, `ConsultPage`, `AgentSelector`, `Sidebar`,
    `AppLayout`, `NotFoundPage` y `ErrorPage`. `router.tsx` sigue declarando las rutas.
  - **`AgentList`:** los cuatro bloques `{cond && …}` (cargando, error, vacío,
    resultados) pasan a una función `content()` con `return` temprano: se lee de arriba
    abajo y solo uno puede verse a la vez.
- **Descartado (IA):** carpetas por funcionalidad (`features/`), Suspense con
  `useSuspenseQuery` (choca con `keepPreviousData` en la paginación) y loaders de React
  Router (duplican TanStack Query). La arquitectura por capas se mantiene.
- **Revisión:** build y lint en verde. Con Playwright: listado y paginación, página 2,
  búsqueda sin resultados y limpiar, vista en lista, página fuera de rango, «Consultar»
  desde la tarjeta y desde el menú, y vuelta desde el 404; consola sin errores.

---

## 2026-11-13 · Etapa 25 — `queryOptions`, variantes explícitas y limpieza

- **Aprobado por mí** (puntos 3, 4 y 5 de la revisión de arquitectura), para que el
  código sea más declarativo.
- **`queryOptions` (TanStack Query v5):** `agentKeys` pasa a `agentQueries`, donde cada
  dato junta su clave y su función (`list(params)`, `detail(id)`). Los hooks extienden
  ese objeto con sus ajustes y las mutaciones usan su `.queryKey`, de modo que
  `setQueryData` comprueba en TypeScript que guarda un `Agent`. Los parámetros del
  selector de Consultar pasan a la constante `OPTIONS_PARAMS`.
- **Variantes explícitas (skill de composición, `patterns-explicit-variants`):**
  `AgentActions variant=…` → `AgentIconActions` y `AgentLabelActions`;
  `AgentsEmptyState variant=…` → `AgentsEmptyState` y `AgentsNoResults`. Cada uno pinta
  una sola cosa y quien los usa elige cuál.
- **Limpieza:** `AgentsSkeleton` usa el tipo `AgentView`.
- **Corrección durante el cambio:** la IA propuso `onSubmit={handleSubmit(save)}` en
  `AgentFormModal`, pero el lint (`react/refs`) avisa porque así `handleSubmit(save)` se
  llama durante el render y `save` usa un ref. Se vuelve a la función envolvente y se
  deja un comentario explicando por qué.
- **Revisión de `hooks/`:** tres archivos con una responsabilidad cada uno (datos del
  servidor, filtros en la URL, debounce genérico). No se reorganiza.
- **Revisión:** build y lint en verde. Con Playwright: listado, sin resultados, página
  fuera de rango, crear, editar desde la tarjeta, abrir Consultar sin pedir otra vez el
  detalle (sale de la caché que llenó `setQueryData`), consulta, eliminar desde
  Consultar (desaparece del selector) y 404 del detalle; consola sin errores. Los
  agentes de prueba se borraron.

---

## 2026-11-13 · Etapa 26 — Auditoría de entrega: `.nvmrc`, documentación y commits

- **Motivo (mío):** pedí una auditoría sincera del frontend «como un senior que me va a
  entrevistar», con el PDF de la prueba como referencia.
- **Veredicto (IA):** el código está bien; los riesgos están en la entrega y el alcance.
  1. `.nvmrc` estaba borrado sin commitear, aunque el README lo cita en la instalación.
  2. Las etapas 21 a 25 seguían sin commit: el evaluador solo ve el repositorio.
  3. La documentación no mencionaba Sonner y el tamaño del paquete en `vite.config.ts`
     estaba desactualizado.
  También señaló `Content-Type` en los GET (provoca una petición CORS `OPTIONS` de más),
  `aria-atomic` en los mensajes de la consulta y el alcance frente a las 3–4 h del PDF:
  no añadir más funciones y tener preparada la justificación de los extras.
- **Cambios (IA, autorizados por mí):** `.nvmrc` restaurado (26.13.1), Sonner en la tabla
  de tecnologías del README y tamaño del paquete al día. Commits: el tema solo con CSS
  (etapa 21) va aparte porque compila por sí solo; las etapas 22 a 25 van juntas porque
  tocan los mismos archivos, con el detalle en el mensaje; la documentación, en otro.
- **Pendiente de decidir:** `Content-Type` solo con cuerpo y `aria-atomic`.

---

## 2026-11-13 · Etapa 27 — Proxy de Vite: sin CORS en desarrollo

- **Problema encontrado (IA, comprobado con Playwright):** si el puerto 5173 está ocupado,
  Vite arranca en silencio en el 5174. El backend solo permite `localhost:5173`, así que
  el navegador bloquea todo por CORS y la app muestra «No se pudo conectar con el
  servidor» con el backend en marcha. Le podía pasar al evaluador en el primer paso.
  Además, cada GET llevaba `Content-Type: application/json` y provocaba una petición
  `OPTIONS` (preflight) de más.
- **Opciones estudiadas:** proxy de Vite (frontend); CORS con un patrón para `localhost`
  en cualquier puerto (backend: arregla el puerto, pero mantiene el preflight y abre más
  CORS); NestJS sirviendo el frontend compilado (un solo origen, pero más alcance);
  Docker o nginx (excesivo).
- **Decisión mía:** proxy de Vite, la forma estándar. El navegador pide `/api` al propio
  Vite y este lo reenvía al backend; al ser el mismo origen, no hay CORS.
- **Cambios (IA):**
  - `vite.config.ts`: `server.proxy` de `/api` a `API_PROXY_TARGET` (por defecto
    `http://localhost:3000`) con `changeOrigin`.
  - `client.ts`: la API por defecto es `/api`; `Content-Type` solo con cuerpo; una
    respuesta de error sin el formato del backend (el proxy da `502` sin cuerpo con el
    backend apagado) se muestra como «No se pudo conectar con el servidor».
  - El CORS del backend (`CORS_ORIGIN`) se queda para quien use `VITE_API_URL` directo.
  - `aria-atomic` fuera de `ConsultMessages`: el lector de pantalla anuncia solo lo nuevo.
- **Revisión:** build y lint en verde. Con Playwright, el flujo completo (crear →
  «Probar agente» → consultar → respuesta) en `localhost:5173`, `localhost:5174` y
  `127.0.0.1`, sin peticiones `OPTIONS` y sin errores en consola. Con el backend apagado,
  el mensaje de conexión y «Reintentar».

---

## 2026-11-13 · Etapa 28 — Errores de carga más claros y visuales

- **Pedido mío:** el error de carga era un bloque rojo con texto; quería algo más visual.
  En Consultar, además, quedaba encajonado en el ancho del selector.
- **Cambio (IA):** `ErrorAlert` pasa a icono en círculo, título que dice qué falló
  (`title`, obligatorio: «No se pudieron cargar los agentes», «No se pudo cargar el
  agente»), explicación y «Reintentar» con icono. Usa el marco discontinuo de los estados
  vacíos y el color `error` solo en el icono y el borde. En Consultar, el ancho máximo
  pasa del contenedor al `<select>`, así el error ocupa la tarjeta y el selector se ve
  igual que antes.
- **`AI_USAGE.md`:** decía que el proxy de Vite se había descartado; se corrige con la
  decisión final y su motivo.
- **Revisión:** build y lint en verde; capturas con el backend apagado en Agentes y
  Consultar, en claro, oscuro y móvil, y con el backend en marcha (selector sin cambios).

---

## 2026-11-13 · Etapa 29 — Swagger: documentación interactiva de la API

- **Pedido mío:** documentar los endpoints para poder probarlos (§3.C: «Documenta los
  endpoints») y ordenar el backend entendiendo por qué está estructurado así. Pedí a la
  IA un análisis crítico, como si fuera un backend senior que me va a entrevistar.
- **Análisis (IA):** el backend ya cumple el PDF y sigue la organización por
  funcionalidad de NestJS (`agents/`, `ai/`, `common/`) con capas dentro: controlador →
  servicio → repositorio / proveedor de IA. No es MVC clásico (no hay vistas: la vista es
  el frontend), sino una arquitectura en capas por módulo. Faltaban Swagger, la prueba
  e2e del flujo principal y cuatro retoques de orden (etapas siguientes).
- **Decisión mía:** aprobar `@nestjs/swagger` 12.1.1 con Zod como única fuente de los
  esquemas.
- **Descartado:** `nestjs-zod` (solo declara soporte hasta Nest 11) y migrar a
  `class-validator` (reescribir una validación que ya funciona y está probada).
- **Corrección a la IA:** propuso convertir los esquemas con `z.toJSONSchema` a mano. Le
  pedí verificarlo con documentación actual. Leyó el código de `@nestjs/swagger` 12 y
  comprobó que lee el esquema de `@Body({ schema })` y `@Query({ schema })` por sí solo
  (Standard Schema: Zod 4.6 expone `~standard.jsonSchema` y Swagger lo pide con el
  destino `openapi-3.0`). No hizo falta conversión manual.
- **Cambios (IA):**
  - `swagger.setup.ts`: Swagger UI en `/api/docs` y OpenAPI en `/api/docs-json`.
  - `agents.schemas.ts`: `.meta()` con descripción, ejemplo y nombre de cada esquema;
    esquemas de respuesta (`Agent`, `PaginatedAgents`, `RunResult`) atados a los tipos
    con `satisfies`, para que el compilador avise si dejan de coincidir.
  - `common/error-response.schema.ts`: el formato de error pasa a ser un esquema; el
    filtro global usa su tipo y Swagger lo publica.
  - `agents.docs.ts` y `common/api-error-responses.ts`: decoradores con nombre para los
    errores (400, 404, 500, 502), así el controlador sigue siendo legible.
  - `agents.controller.ts`: resumen, respuestas y errores de cada ruta.
- **Revisión:** `npm audit` con 0 vulnerabilidades tras instalar; lint y build en verde;
  9 pruebas unitarias y 7 e2e (una nueva comprueba que `/api/docs-json` lista las tres
  rutas y que el límite del nombre sale del esquema Zod). Con el servidor compilado:
  `/api/docs` responde 200 y el documento contiene las 6 operaciones con sus parámetros,
  cuerpos, respuestas y ejemplos de error.
- **Pendiente de aprobar:** etapa B (orden) y etapa C (prueba e2e del flujo principal).

---

## 2026-11-13 · Etapa 30 — Búsqueda con tildes y prueba del flujo principal

- **Pregunta mía:** «¿Estás seguro de que no hay nada más que mejorar?». La IA había
  revisado el código leyéndolo; esta vez probó casos límite contra el servidor en marcha.
- **Fallo encontrado (IA, reproducido en una base en memoria):** buscar «INGLÉS» no
  encontraba «inglés», y al ordenar por nombre «Ángel» quedaba después de la Z. `LOWER()`
  y `NOCASE` de SQLite solo convierten letras sin tilde.
- **Arreglo (IA, aprobado por mí):** función `normalize_text` registrada en SQLite desde
  el repositorio (minúsculas y sin tildes). La búsqueda y el orden por nombre la usan, así
  que «ingles», «INGLÉS» e «inglés» encuentran lo mismo. Descartado: una columna extra con
  el texto normalizado (obligaba a migrar la tabla existente).
- **Casos límite comprobados que ya estaban bien:** JSON roto (400), sin cuerpo o texto
  plano (400 con detalle), cuerpo de 200 KB (413), ruta o método inexistente (404). Todos
  con el formato único de error.
- **Pruebas nuevas (IA):** e2e del flujo del §8 (crear → consultar → respuesta del mock
  con el nombre, las instrucciones y la consulta), 400 al crear con datos inválidos, 400
  y 404 en `/run`, y 502 con un proveedor de IA que falla (`overrideProvider`),
  comprobando que el servidor sigue respondiendo. Unitaria de búsqueda y orden con tildes.
- **Revisión:** lint y build en verde; 10 pruebas unitarias y 12 e2e.
- **Pendiente de aprobar:** reorganización de carpetas del backend (etapa B ampliada).

---

## 2026-11-13 · Etapa 31 — Backend reorganizado y Swagger más práctico

- **Pedido mío:** ordenar el backend con una arquitectura sólida, revisar si las
  respuestas están estandarizadas y si frontend y backend usan los mismos esquemas, y
  mejorar la presentación de Swagger. Pregunté si convenía el MVC por carpetas de tipo
  que usé con Express en `Sistema-de-Notas-Backend`.
- **Análisis (IA):**
  - Comparó ese proyecto con este: son las mismas piezas (rutas, controlador, modelo,
    esquemas, manejador de errores). Aquí hay tres mejoras sobre aquel: carpetas por
    funcionalidad en vez de por tipo, un filtro global en lugar de `try/catch` en cada
    método, y una capa de servicio que saca las decisiones de negocio del controlador.
    **Decisión:** mantener la organización de NestJS, no volver a carpetas por tipo.
  - Respuestas: ya tienen tres formas fijas (recurso directo, `{ items, meta }` y el
    formato único de error). Descartado envolver los éxitos en `{ success, data }`: el
    código HTTP ya lo indica y obligaba a cambiar el frontend.
  - Esquemas: frontend y backend tienen las mismas reglas y tipos, copiados a mano. Se
    mantiene (ya se había descartado el monorepo) y pasa a «Mejoras con más tiempo»:
    generar los tipos del frontend desde `/api/docs-json`.
- **Decisión mía:** aplicar la reorganización completa propuesta por la IA.
- **Cambios (IA):**
  - `database/` nuevo: `DatabaseModule` abre la conexión, la comparte con el token
    `DATABASE` y la cierra al parar. `AgentsRepository` hacía tres trabajos (ruta,
    conexión, consultas) y ahora solo contiene consultas y recibe la conexión inyectada.
  - Las pruebas dejan de modificar `process.env`: usan `openDatabase(':memory:')` y
    `overrideProvider(DATABASE)`.
  - Excepciones junto a su funcionalidad: `agents/agents.exceptions.ts` y
    `ai/ai.exceptions.ts`. `common/errors/` queda solo con lo genérico.
  - `run()` reutiliza `findById`; `enableShutdownHooks()` para cerrar la base con Ctrl+C;
    se quita la cabecera `X-Powered-By`.
  - Swagger: campos editables sin pulsar «Try it out», duración de cada petición,
    desplegable de ejemplos por cuerpo (uno válido y los inválidos comunes), portada con
    los pasos del flujo crear → consultar, y enteros sin límites técnicos.
- **Error de la IA durante el cambio:** un script de edición falló a mitad y dejó el
  repositorio sin migrar; las pruebas unitarias lo delataron al momento y se corrigió.
- **Revisión:** lint y build en verde; 10 pruebas unitarias y 12 e2e, sin cambios en la
  API. En el servidor en marcha: `/api/docs-json` con los ejemplos en las tres rutas con
  cuerpo, sin `X-Powered-By`, y los agentes guardados siguen ahí.
- **Sin verificar:** el cierre de la base al pulsar Ctrl+C no se probó a mano.

---

## 2026-11-13 · Etapa 32 — Auditoría contra el PDF y repositorio público

- **Pedido mío:** analizar el estado del frontend y del backend frente al PDF y decidir
  qué falta.
- **Verificación (IA):** 10 pruebas unitarias y 12 e2e, build, lint y `npm audit` (0
  vulnerabilidades) en las dos partes. Instalación limpia desde un `git clone` con Node
  24.22.3 y 26.13.1: crear «Asistente de resúmenes», reiniciar el backend y comprobar que
  el agente sigue. El cierre con Ctrl+C, que quedó sin verificar en la etapa 31, se
  comprobó: el servidor se detiene y el siguiente arranque abre la base sin problemas.
- **Veredicto (IA):** lo obligatorio está completo. Faltaba la entrega: no había
  repositorio remoto y `AI_USAGE.md` seguía como borrador, con apartados por completar y
  una contradicción (React Router figuraba como descartado).
- **Decisiones mías:**
  - Repositorio público: https://github.com/YouRobla/mini-agent-studio
  - Mantener mi correo personal en los commits. La IA propuso el correo `noreply` de
    GitHub; lo descarté.
  - Quitar de los 45 commits la línea `Co-Authored-By` de Claude. Como ya estaban
    subidos, se reescribieron los mensajes y se subieron con `--force-with-lease`. Autor,
    fechas y contenido no cambian (comprobado comparando antes y después). El uso de IA
    sigue documentado en este archivo y en `AI_USAGE.md`.
  - Diagrama del README con Mermaid y capturas reales de la app (siguiente etapa).
    Descartado Excalidraw: es una imagen que hay que redibujar cuando cambia el código.
- **Problema encontrado (IA):** el push por SSH falló porque la clave pide frase de
  contraseña y la sesión de la IA no tiene agente SSH. Se subió por HTTPS con las
  credenciales de `gh` solo para ese comando; el remoto sigue siendo SSH.
- **Pregunta mía:** ¿el frontend muestra bien todo lo que responde el backend? La IA
  cruzó cada respuesta y cada error con la interfaz y lo comprobó con `curl` (etapa 33).

---

## 2026-11-13 · Etapa 33 — Errores del backend que el frontend no mostraba bien

- **Pregunta mía:** ¿el frontend muestra bien todo lo que responde el backend? ¿Sería un
  error que el backend envíe cosas que la interfaz nunca muestra, o que se queden en la
  consola? Y si TanStack Query actualiza la caché, ¿cuándo podría pasar el caso 2?
- **Análisis (IA):** no es un error que haya campos que no se muestran (`agentId`,
  `statusCode`, el código `error`): son para programas. Lo sería perder información que la
  persona necesita. La app no escribe errores en la consola y TanStack Query tampoco
  (comprobado en su código, 5.107.1). Las escrituras nunca se repiten solas (`retry: 0`
  por defecto en las mutaciones). Se encontraron tres fallos, dos confirmados con `curl`:
  1. Una búsqueda de más de 100 caracteres mostraba «Los datos enviados no son válidos»
     sin el motivo, que el backend sí enviaba en `details`.
  2. Eliminar, editar o consultar un agente borrado fuera de la pestaña mostraba
     `No existe un agente con el id "…"`, el reintento fallaba siempre y el agente seguía
     en pantalla. La caché solo conoce lo que pasa en su pestaña: no se entera de un
     borrado hecho desde otra pestaña, desde Swagger o con `curl` hasta que vuelve a pedir
     los datos (frescos 30 s; se refrescan al volver a la pestaña o al montar la vista).
  3. Las lecturas repetían también los 4xx (`retry: 1` global), con un segundo de espera
     y la misma respuesta.
- **Decisión mía:** aplicar los tres arreglos.
- **Cambios (IA):**
  - `client.ts`: `errorMessage` muestra los `details` si los hay y un texto propio para
    `AGENT_NOT_FOUND`; nuevo `isRetryable` (sin conexión o `5xx`).
  - `main.tsx`: las lecturas solo se reintentan si `isRetryable`. Se quita el caso especial
    del 404 en `useAgent`.
  - `AgentsToolbar`: `maxLength` de 100 en el buscador (`SEARCH_MAX_LENGTH`).
  - `useAgents.ts`: eliminar trata el 404 como «ya no existía» (lo buscado ya se cumple) y
    refresca el listado; editar y consultar, ante un 404, invalidan todo lo de agentes
    (`agentQueries.all()`).
  - `AgentDialogs`: aviso «El agente «X» ya se había eliminado». `AgentFormModal`: guardar
    se desactiva si el agente ya no existe. `ConsultPage`: no muestra los datos en caché
    de un agente que ya no existe.
  - `frontend/README.md`: reintentos, 404 fuera de la pestaña y `isRetryable`.
- **Revisión:** build y lint en verde. En el navegador, con un backend y un Vite aislados
  (base temporal, sin tocar los datos reales) y borrando agentes con `curl`:
  búsqueda larga → el motivo y una sola petición; eliminar → «ya se había eliminado» y el
  listado sin él; editar → mensaje claro y «Guardar cambios» desactivado; consultar →
  «El agente no existe». Camino normal (consultar y eliminar) sin cambios. La extensión de
  Chrome registró un `DELETE` correcto como 503; con `curl` por el mismo proxy da 204: era
  un fallo de la herramienta de medida.

---

## 2026-11-13 · Etapa 34 — README ordenado según el §6 de la prueba

- **Pedido mío:** que el README cumpla todo lo que pide la prueba y presentarlo mejor.
- **Análisis (IA):** el README ya cubría el §6. Faltaba el primer paso de una instalación
  limpia (`git clone`), y el diagrama y la demostración se podían ver mejor.
- **Decisión mía:** clonar, diagrama Mermaid, capturas reales y `ai.module.ts` en el árbol.
  Descartada la línea con el tiempo dedicado.
- **Cambios (IA):**
  - Índice al principio que lleva a cada punto del §6, y captura de la vista Consultar.
  - Instalación en pasos numerados, empezando por `git clone`.
  - «Demostración del flujo» con tres capturas: listado, datos incorrectos y backend
    detenido. Las cuatro capturas están en `docs/capturas/` y se tomaron en un entorno
    aislado (backend y Vite en otros puertos, base temporal).
  - «Arquitectura» agrupa la estructura, el diagrama de componentes y el flujo de una
    consulta. El diagrama ASCII pasa a Mermaid, que GitHub dibuja a partir del texto.
  - Sección «Uso de IA» que enlaza `AI_USAGE.md` y esta bitácora.
- **Corrección durante el cambio:** la primera versión del diagrama tenía 7 cajas en una
  fila y en el ancho de GitHub el texto quedaba diminuto. Se redujo el frontend a una caja,
  porque su detalle ya está en el árbol y en `frontend/README.md`.
- **Revisión:** el diagrama se dibujó con Mermaid 11 en tema claro y oscuro sin errores; el
  README se pasó por el renderizador de Markdown de GitHub (imágenes y tabla del paso 7
  correctas).
- **Hallazgo:** la barra lateral de GitHub sigue mostrando a `claude` como contribuidor,
  aunque `main` ya no tiene ninguna línea `Co-Authored-By` y la API de contribuidores solo
  devuelve a YouRobla. GitHub guardó esa lista del primer push, y los commits antiguos
  siguen accesibles por su hash. GitHub no permite quitar a nadie de esa lista desde la
  interfaz (comprobado), así que, por decisión mía, se borró el repositorio y se volvió a
  crear con el mismo nombre y el historial limpio (49 commits). Comprobado después: solo
  YouRobla en «Contributors» y el commit antiguo ya no existe.

---

## 2026-11-13 · Etapa 35 — Auditoría de herramientas y autoría

- **Pedido mío:** la bitácora estaba desfasada. Pedí revisar de verdad todo lo usado
  (Orca, workers de Codex y Antigravity, orquestación, Playwright…) y verificar mis
  prompts y mis decisiones.
- **Cómo se verificó (IA):** con las fuentes reales, no de memoria: las 7 sesiones de
  Claude Code, las 2 de Codex, las 3 de Antigravity y la base de orquestación de Orca.
- **Hallazgo principal:** la etapa 11 figuraba como «trabajo mío» sin herramientas. La
  dirigí yo, pero la escribieron Codex y Antigravity en sesiones que abrí directamente.
  Corregido en esa etapa, con mis prompts.

### Quién hizo qué (hora local)

| Hora | Herramienta y modelo | Dirigida por | Etapas |
| --- | --- | --- | --- |
| 12 · 17:17–19:02 | Claude Code · Claude Fable 5.2 | Yo | 1–9 |
| 12 · ~18:00 | Subagente Claude Sonnet (solo lectura) | Claude, a pedido mío | 3 |
| 12 · 19:03–19:16 | Codex `gpt-6.1-sol`, worker de Orca | Claude como coordinador | 10 |
| 12 · 20:07–21:30 y 23:09 | Codex `gpt-6-astra`, sesión interactiva | Yo, directamente | 11 y 18 (lápiz) |
| 12 · 21:37–21:46 | Antigravity CLI · Gemini 4 Argon (High) | Yo, directamente | 11 |
| 12 · 21:49–23:31 | Claude Code · Claude Opus 5.5 | Yo | 11 (revisión) a 19 |
| 12 · 22:01–22:10 | Claude Sonnet 5.5, worker de Orca | Claude como coordinador | 12 |
| 12 · 23:06–23:10 | Antigravity · `gemini-4-hydrogen-xhigh`, worker de Orca | Claude como coordinador | 18 |
| 12 · 23:31–23:49 | Claude Code · Claude Fable 5.2 | Yo | 20 |
| 12–13 · 23:51–01:40 | Claude Code · Claude Opus 5.5 | Yo | 21–28 |
| 13 · 01:42–08:54 | Claude Code · Claude Fable 5.2 | Yo | 29–31 |
| 13 · 08:54–09:47 y 10:08– | Claude Code · Claude Opus 5.5 | Yo | 32–35 |

### Orca y la orquestación

- Una sola orquestación (`run_a38ef66366ed`) con Claude Code como coordinador y cuatro
  tareas, todas completadas: UI/UX (Codex), contraste del aviso (Codex), editar y
  eliminar (Claude Sonnet) e icono (Antigravity). Cada worker recibió un encargo cerrado
  (alcance, restricciones, evidencia obligatoria, sin commits) y cerró con `worker_done`.
- Además, usé Codex y Antigravity directamente en sus paneles de Orca (etapa 11).

### Playwright, de tres formas

| Forma | Quién | Nota |
| --- | --- | --- |
| Playwright MCP | Codex y Antigravity | De ahí sale la carpeta `.playwright-mcp/` del `.gitignore`. Codex probaba con la API simulada (`page.route`) |
| Scripts de Playwright (Node y Python) | Claude Code | En instancias aisladas, con backend y base temporales |
| Claude in Chrome (extensión) | Claude Code | Revisiones de las etapas 10–17 y 32–33 |

### Cómo registro lo que hice yo, con mis palabras

- Mis prompts son mis palabras: en las etapas cito los más importantes, con la ortografía
  corregida y el sentido intacto.
- «Decisión mía» significa que la idea o la elección salió de un prompt mío. Si elegí
  entre opciones que propuso la IA, lo digo así (por ejemplo, Consultar con panel a la
  izquierda, filas con nombre e instrucciones, nombre del repositorio, Mermaid).
- Verificado: todas las «decisión mía» de las etapas 1–34 tienen detrás un prompt mío.

### Mi resumen del proceso

- Escribí (dictado) un resumen de mi rol: arquitecto y director, Orca para orquestar,
  Claude Fable 5.2 para pensar y agentes como Sonnet para ejecutar, NestJS, Swagger, Zod
  y simplicidad. Está en `AI_USAGE.md`, sección «Mi rol en el proyecto».
- **Ajustes de precisión al integrarlo (propuestos por la IA, aceptados por mí):** Swagger llegó en la etapa
  29, así que no fue el motivo inicial para elegir NestJS (lo fue la separación en
  servicios y la inyección de dependencias); y los esquemas de Zod tienen las mismas
  reglas en los dos lados pero están copiados, no compartidos.

---

## 2026-11-13 · Etapa 36 — Diagrama en draw.io, §5 completo y comentarios limpios

- **Diagrama (pedido mío):** el de Mermaid se veía pequeño y oscuro en GitHub. Pedí algo
  más presentable, como draw.io. Ahora es `docs/arquitectura.drawio.svg`: GitHub lo
  muestra como imagen y draw.io lo abre para editarlo, porque el archivo lleva dentro el
  diagrama. Eso resuelve el motivo por el que se descartó Excalidraw en la etapa 32 (una
  imagen que habría que redibujar). Tiene fondo propio, así que se lee en tema claro y
  oscuro. draw.io no estaba instalado: la IA generó el SVG y el modelo de draw.io desde
  las mismas posiciones y los validó como XML.
- **§5 del PDF (pregunta mía):** `AI_USAGE.md` cubre los cuatro puntos. El tercero («qué
  partes del código te ayudó a crear la IA y qué cambiaste tú») era general; se añade
  una tabla por parte del código con quién la escribió y qué decidí yo.
- **Comentarios (pedido mío):** de 186 comentarios, la mayoría explican el porqué y se
  quedan. Se quitan los que repetían el nombre del componente o del tipo (9), uno de la
  plantilla de Vite y uno duplicado en `AgentFormModal`; se corrigen dos: el de CORS en
  `app.setup.ts` (de antes del proxy) y una frase mal redactada en `AgentDialogs`.
- **Revisión:** build y lint en verde en las dos partes; 10 pruebas unitarias y 12 e2e.

---

## 2026-11-13 · Etapa 37 — `AI_USAGE.md` revisado como lo haría un evaluador

- **Pedido mío:** una auditoría crítica de la bitácora y de `AI_USAGE.md`, como si la IA
  ya fuera quien corrige la prueba, y mejores ejemplos de prompts.
- **Reclamos (IA):**
  1. Dos de los cinco ejemplos de prompts los había redactado Claude como coordinador, no
     yo (la revisión independiente y el encargo a Codex).
  2. «Commits pequeños, probando cada uno» no casaba con Git: los 11 primeros se
     confirmaron entre las 18:48 y las 18:57.
  3. El tiempo dedicado supera las 3–4 h del PDF y no se explicaba.
  4. La tabla de errores no tenía los casos que mejor muestran criterio.
  5. La bitácora no tenía resumen y las iteraciones de la interfaz podían leerse como
     indecisión.
  6. Faltaba una reflexión sobre qué haría distinto.
- **Decisión mía:** aplicar los seis.
- **Cambios (IA):** cinco prompts míos verificados en las sesiones (análisis, Zod, ORM,
  dirección de Codex y autocrítica de sobreingeniería), cada uno con qué buscaba, qué
  respondió la IA y qué decidí; frase de los commits corregida; el tiempo explicado (lo
  obligatorio a la 1 h 40 min de empezar); 7 casos nuevos en la tabla de errores; sección
  «Qué haría distinto»; y «Cómo leer esta bitácora» con las 8 decisiones clave.

---

## 2026-11-13 · Etapa 38 — «Modo simulado» junto al agente

- **Pedido mío:** la etiqueta «Modo simulado» estaba en la barra superior; la quería
  arriba, junto al agente de la vista Consultar, que es donde importa.
- **Cambio (IA):** el badge sale de `AppLayout` y pasa a la leyenda del selector en
  `AgentSelector`. La leyenda de daisyUI (`fieldset-legend`) trae `margin-inline-end:
  auto`, que lo empujaba a la derecha; se anula con `me-0` (comprobado midiendo el estilo
  calculado, no a ojo). El badge queda fuera del `<label>`, así que el nombre accesible del
  selector sigue siendo «Agente para esta consulta».
- **Pregunta mía:** ¿hace falta que el backend maneje el modo simulado? Hoy no: el backend
  ya elige el proveedor en `ai.module.ts` y devuelve `provider` en cada respuesta; el badge
  es un texto fijo. Con un LLM real sí hará falta que el backend diga cuál está activo.
- **Revisión:** build y lint en verde; capturas en escritorio y móvil.
- **Revertido (malentendido de la IA):** no me refería al badge, sino al texto
  «[Modo simulado]» que aparece dentro de la respuesta del chat. El badge vuelve a la
  barra superior, como estaba; el texto del mock se analiza en la etapa siguiente.

---

## 2026-11-13 · Etapa 39 — Respuesta del mock sin «[Modo simulado]»

- **Pedido mío:** el texto «[Modo simulado]» y la explicación de lo que «se enviaría al
  modelo» dentro de cada respuesta sobraban: que es simulado ya se ve arriba.
- **Análisis (IA):** ya lo indican tres cosas (la etiqueta de la barra, «Proveedor: mock»
  bajo la burbuja y el campo `provider` de la API). Pero el mock no puede quedar vacío: el
  §3.C pide que use el contexto del agente y la consulta, y la prueba e2e lo comprueba.
- **Decisión mía:** opción B, entre tres (dejarlo, B, o devolver solo la consulta, que
  incumplía el §3.C).
- **Cambio (IA):** el mock responde en dos líneas: `Soy «nombre» y sigo estas
  instrucciones: «…».` y `Tu consulta fue: «…».` Actualizados el ejemplo de Swagger, el
  README (sección del mock, ejemplo de respuesta y limitaciones) y `AI_USAGE.md`.
- **Revisión:** lint y build en verde; 10 pruebas unitarias y 12 e2e sin cambios (siguen
  comprobando el nombre, las instrucciones y la consulta).
