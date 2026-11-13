# Uso de IA durante el desarrollo

> Redactado a partir de mis prompts (citados con la ortografía corregida) y de
> `BITACORA.md`, verificado contra las sesiones reales de cada herramienta (etapa 35).

## Herramientas utilizadas

| Herramienta | Modelo | Para qué |
| --- | --- | --- |
| Claude Code | Claude Fable 5.2 y Claude Opus 5.5 | Análisis de requisitos, arquitectura, backend y frontend base, revisiones, reorganizaciones, pruebas y documentación. Coordinador de los workers en Orca |
| Subagente de Claude Code | Claude Sonnet | Revisión independiente del plan contra el PDF, antes de escribir código |
| Orca | — | IDE de varios agentes. Claude Code repartió ahí 4 tareas a workers y yo usé Codex y Antigravity directamente en sus paneles |
| Codex, worker en Orca | `gpt-6.1-sol` | Panel con dos vistas, React Router, skeletons y temas; corrección de contraste |
| Codex, sesión mía | `gpt-6-astra` | Dirigido por mí: reorganización de carpetas, modal de creación, `theme-controller`, temas y la vista Consultar |
| Antigravity CLI, sesión mía | Gemini 4 Argon (High) | Dirigido por mí: paginado del backend con sus pruebas y paginación del frontend |
| Claude Sonnet, worker en Orca | Claude Sonnet 5.5 | Editar y eliminar agentes, y avisos tipo toast |
| Antigravity, worker en Orca | `gemini-4-hydrogen-xhigh` | Icono y favicon, dos veces: la estrella en órbita y después el robot de chat. Exploró conceptos con su generador de imágenes y entregó el SVG final dibujado a mano |
| Playwright MCP | — | Comprobaciones en el navegador de Codex y Antigravity |
| Claude in Chrome y scripts de Playwright | — | Comprobaciones de Claude Code en el navegador, en instancias aisladas |
| Claude Docs | — | Documento de análisis de requisitos y alcance |
| Skills `nestjs-best-practices`, `daisyui`, `tanstack-query-best-practices` y `vercel-composition-patterns` | — | Guías de referencia; se leyó su contenido antes de instalarlas |
| CLI `npx skills` | — | Búsqueda y evaluación de skills |

## Mi rol en el proyecto

> Resumen mío, dictado y ordenado; la IA solo ajustó la redacción.

Trabajé como arquitecto y director del proceso: pensé, analicé, decidí la estructura y
delegué el trabajo en agentes de IA por etapas. La IA me ayudó a organizar mis ideas, pero
las propuestas, la limpieza y la organización final fueron mías: escogí el IDE, escribí
los prompts, organicé los componentes, revisé mis proyectos anteriores como referencia y
verifiqué cada resultado.

**Orquestación con Orca.** Usé Orca, un IDE pensado para dirigir varias IAs a la vez, con
su skill de orquestación y su propia CLI. Desde ahí delegué tareas a subagentes y
workers, y también abrí agentes directamente cuando quise llevar yo una parte.

**Un modelo para pensar y otros para ejecutar.** Para el trabajo pesado de pensamiento
(requisitos, stack y estructura) usé Claude Fable 5.2, por su capacidad crítica y
analítica. Con eso analizado, documenté las etapas según lo que pide el PDF y empecé a
delegar. Para tareas de ejecución ya definidas usé agentes como Claude Sonnet, que no
necesitan esa capacidad crítica porque el análisis ya estaba hecho; Codex y Antigravity,
según la tarea. Después hice las correcciones de la interfaz revisando cada pantalla.

**Backend.** Propuse NestJS desde el principio. Su inyección de dependencias deja la
lógica en servicios, separada de los controladores, y el proveedor de IA detrás de una
interfaz, preparado para conectar un LLM real con una API key (el extra del PDF). Más
adelante pedí documentar la API con Swagger, que en NestJS 12 sale casi automáticamente de
los esquemas de Zod. Zod da las mismas reglas y tipos en el frontend y en el backend, para
que los dos lados manejen la misma estructura de datos y haya coherencia (hoy están
copiados en cada lado; compartirlos es una de las mejoras pendientes).

**Simplicidad.** Reestructuré los componentes del frontend y del backend con un principio
de simplicidad: la idea no era hacer un proyecto más, sino que sea práctico y que alguien
que lo abre por primera vez lo entienda.

## Cómo trabajé con la IA

No pedí "hazme la aplicación". El trabajo fue por etapas, y no se pasó a la siguiente sin
mi aprobación:

1. Análisis del enunciado y clasificación de requisitos (explícito, inferido, propuesto).
2. Definición del alcance y de los casos de aceptación.
3. Decisión de stack y arquitectura, cuestionando cada librería.
4. Contrato de la API antes de escribir código.
5. Implementación en commits por tema; cada parte se probó (con `curl` y en el
   navegador) antes de confirmarla.

**Sobre el tiempo:** lo obligatorio quedó completo a las 18:57 del primer día, 1 h 40 min
después de empezar el análisis (commits 1 a 11, con el README y este documento). Todo lo
posterior son extras del §9 (editar y eliminar, prueba automatizada) y pulido, hecho a
sabiendas de que el PDF sugiere 3–4 horas.

## Ejemplos de prompts

Todos son míos, citados con la ortografía corregida. Debajo de cada uno: qué buscaba, qué
respondió la IA y qué decidí.

**1. Entender antes de construir:**

> Actúa como analista de requisitos y arquitecto. Analiza exhaustivamente el documento y
> ayúdame a establecer las bases del proyecto antes de seleccionar el stack, diseñar la
> arquitectura o escribir código. Distingue siempre entre lo explícitamente solicitado, lo
> que se infiere razonablemente y lo que propones como mejora. No escribas código todavía.

- **Buscaba:** no empezar a programar sin saber qué se evalúa.
- **La IA:** un análisis con 11 requisitos funcionales y 20 casos de aceptación.
- **Decidí:** aprobarlo y pedir una revisión independiente con otro modelo (Sonnet).

**2. Corregir a la IA con lo que sé:**

> Veo que con Zod, NestJS en las últimas versiones lo soporta de forma nativa; por eso te
> pregunto si sería mejor mantener Zod, o usar lo clásico frente a lo actual, solo para
> este proyecto.

- **Buscaba:** validar con la forma actual del framework.
- **La IA:** había dicho que en NestJS lo idiomático era `class-validator`. Al verificarlo
  en las notas de la versión 12, confirmó el `StandardSchemaValidationPipe` nativo.
- **Decidí:** Zod en el backend y en el frontend, con las mismas reglas.

**3. Seguridad frente a sobreingeniería:**

> Para aplicar un ORM no sé si sea de más; más que nada por la seguridad, la inyección
> SQL y el manejo de las queries, porque sé por experiencia que si no están bien hechas
> pasa eso. Busca documentos, fuentes, el estándar para NestJS, o sería sobreingeniería:
> analízalo con criterio real, basado en el documento y en los alcances.

Y a continuación: *«De manera crítica y objetiva, ¿cuál escogerías para el alcance
principal, teniendo en cuenta los extras?»*

- **Buscaba:** decidir con fuentes, no con opiniones.
- **La IA:** la inyección se evita con consultas parametrizadas, con o sin ORM; Drizzle
  solo soporta `node:sqlite` en beta y TypeORM necesita un driver nativo.
- **Decidí:** SQLite integrado en Node, sin ORM, con sentencias preparadas; el ORM queda
  como mejora si el modelo crece.

**4. Dirigir yo a otro agente con una referencia propia (Codex):**

> Necesito que me ayudes a pulir, organizar y mejorar la presentación y la
> componentización de mi proyecto de React. Quiero imitar la arquitectura de frontend de
> mi otro proyecto, no a esa escala, pero sí hay cosas que me gustaría ordenar.

- **Buscaba:** una estructura que ya domino, proporcionada a este tamaño.
- **Codex:** carpetas por responsabilidad, formularios en hooks, modal de creación y tema
  nativo de daisyUI.
- **Decidí:** quedármela como base; más tarde la simplifiqué (prompt 5).

**5. Autocrítica del alcance:**

> Quiero que hagas un análisis sincero de sobreingeniería, componentización, arquitectura
> y diseño del frontend. Siento que lo compliqué: apliqué mucha complejidad, creé
> diálogos o no nombré bien. Quiero volver a organizarlo de manera clara, pero siento que
> es mucho lo que he hecho para lo que me solicitan.

- **Buscaba:** que alguien me dijera si me había pasado.
- **La IA:** unas 2.750 líneas en 50 archivos para un formulario, una lista, un selector y
  una consulta; un contexto que obligaba a abrir 7 archivos para seguir un clic.
- **Decidí:** quedarme con la búsqueda y con editar y eliminar, quitar el contexto y
  reorganizar con una regla simple: «quien muestra, pide; la página coordina».

## Qué hizo la IA y qué decidí o cambié yo

La IA generó el código del backend y del frontend siguiendo el diseño acordado. Las

| Parte del código | La escribió | Lo que decidí o cambié yo |
| --- | --- | --- |
| Backend base: módulos, SQLite, validación con Zod, filtro de errores, mock | Claude Code (Fable 5.2) | NestJS, Zod nativo en lugar de `class-validator`, SQLite en lugar de JSON, sin ORM |
| Paginado, búsqueda y orden del backend, con sus pruebas | Antigravity CLI (Gemini 4 Argon) | Lo pedí yo para gestionar mejor el listado |
| Editar y eliminar (backend y frontend) | Worker Claude Sonnet 5.5 | Completar el extra del PDF y el aviso abajo a la derecha de mi proyecto anterior |
| Swagger, búsqueda sin tildes, módulo de base de datos | Claude Code (Fable 5.2) | Documentar con Swagger; la reorganización del backend comparada con mi proyecto Express |
| Frontend base: formulario, listado y consulta | Claude Code (Fable 5.2) | TanStack Query, React Hook Form y Zod |
| Panel con dos vistas, React Router, temas | Worker Codex (`gpt-6.1-sol`) | El panel, el theme generator; devolví el contraste del botón «Cerrar» |
| Carpetas por responsabilidad, modal, `theme-controller`, Consultar | Codex (`gpt-6-astra`), dirigido por mí | La estructura de mi proyecto anterior, el modal, el tema nativo y la distribución de Consultar |
| Consolidaciones, proxy de Vite, Sonner, `queryOptions`, errores | Claude Code (Opus 5.5) | Cada cambio tras pedir un análisis y aprobarlo; mantuve `window.location.search` cuando la IA quiso revertirlo |
| Chat de varios turnos, fábrica de proveedores, adaptadores de Claude y OpenAI, errores del proveedor | Claude Code (Opus 5.5) | Pedí el chat continuo y poder cambiar entre Claude y ChatGPT; elegí los modelos ligeros (Claude Haiku 5.5 y `gpt-6.1-terra`); descarté runonweb y un modelo en el navegador porque el PDF pide que responda el backend; pedí mostrar el Markdown de las respuestas con formato |
| Docker (frontend con nginx + backend) | Claude Code (Opus 5.5) | Docker como segunda vía (etapa 2). Probé un solo contenedor, pero el backend pasaba a servir el frontend; pedí separarlos por contenedor y que se buscara el estándar antes de implementar, y elegí nginx |
| Icono y favicon | Worker Antigravity (`gemini-4-hydrogen-xhigh`) | Delegarlo al modelo con generación de imágenes; cambiar la estrella por un robot de chat porque no comunicaba nada; el lápiz blanco por estética |
decisiones de diseño las tomé yo, y en varias corregí lo que la IA proponía:

| Tema | Propuesta de la IA | Mi decisión |
| --- | --- | --- |
| Validación en el backend | `class-validator`, porque "Zod no es lo natural en Nest" | Señalé que NestJS reciente soporta Zod de forma nativa. Se verificó (NestJS 12, `StandardSchemaValidationPipe`) y se cambió a Zod |
| Peticiones en el frontend | `fetch` + `useState`, descartando TanStack Query | Usar TanStack Query, React Hook Form y Zod: tengo experiencia con ellas y cubren carga y errores |
| Conexión frontend-backend | Proxy de Vite | Al principio lo descarté (CORS en el backend y `VITE_API_URL`). Al final volví a él: con el puerto 5173 ocupado, Vite pasaba al 5174 y CORS bloqueaba la app (ver la etapa 27 de la bitácora) |
| Persistencia | Archivo JSON | Pregunté por SQLite; se comprobó que Node lo trae integrado y se cambió |
| ORM | — | Lo propuse yo por seguridad; tras analizarlo, lo descarté: las consultas parametrizadas evitan la inyección SQL y es una sola tabla |
| Interfaz | CSS simple | Elegí daisyUI para tener un estándar visual mínimo |
| Ubicación del repositorio | Subcarpeta nueva | Usar la carpeta actual como repositorio |
| Presentación de la interfaz | Una sola pantalla con tres tarjetas, sin React Router | Pedí un panel con dos vistas, navegación, skeletons y tema claro/oscuro; con dos vistas, React Router ya tiene un uso real |

Ideas mías que descarté tras analizarlas con la IA: monorepo con Zod compartido, editor
visual de nodos, tipos de agente preseleccionables y Zustand. React Router lo descarté al
principio, con una sola pantalla, y lo incorporé cuando pasé a dos vistas.

### Lo que hice yo

- **Dirigí y delegué:** el código lo generaron los agentes. Mi trabajo fue decidir qué
  construir, escribir los encargos, revisar cada resultado en el navegador y pedir
  correcciones hasta que me convenciera (ver «Mi rol en el proyecto»).
- **Abrí yo mismo dos agentes** fuera de Claude Code para la etapa 11. A Codex le pedí
  ordenar el frontend tomando como referencia la estructura de mi proyecto anterior
  (SistemaCalendarioDesplegable), un modal para crear agentes y el `theme-controller`
  nativo de daisyUI; a Antigravity, el paginado de la API y del listado.
- **Decisiones de interfaz mías:** quitar el modal «Ver instrucciones» y el enlace «Volver»
  porque repetían información, los colores al pasar el ratón, mi tema del theme generator
  (que después descarté porque no me gustó aplicado a toda la app) y el aviso abajo a la
  derecha con pausa al pasar el ratón, idea de mi proyecto anterior.
- **Cuando sentí que el frontend se había complicado**, pedí un análisis sincero de
  sobreingeniería y lo reorganizamos hasta que entendí cada pieza.
- **Lo mismo con Docker:** la primera versión (nginx + Node) tenía opciones de seguridad
  que no sabría defender. Pedí que me explicara por qué nginx y probé un solo contenedor,
  pero entonces el backend tenía que servir el frontend. Pedí separarlos por contenedor,
  y cuando la IA propuso `vite preview`, le pedí que no implementara nada hasta buscar el
  estándar con ejemplos y las skills de Docker. La documentación de Vite dice que
  `vite preview` no es para producción, así que elegí el patrón habitual: nginx para el
  frontend y NestJS solo para la API, con el volumen para la base de datos.

## Cómo comprobé que funciona

- **API con `curl`** tras cada commit del backend: crear, listar, ejecutar, campos vacíos,
  cuerpo ausente, JSON inválido, texto demasiado largo, agente inexistente y ruta inexistente.
- **Persistencia:** detener el backend, arrancarlo de nuevo y comprobar que el agente sigue.
- **Flujo completo en el navegador:** formulario vacío (errores por campo), crear agente,
  selección automática, consulta vacía, consulta válida con respuesta, backend detenido
  (mensaje de conexión y botón de reintento) y recuperación sin recargar.
- **CORS:** petición `OPTIONS` desde el origen del frontend; más tarde, el flujo completo
  con Vite en otro puerto (5174) y con `127.0.0.1`, ya con el proxy de Vite.
- **Seguridad de dependencias:** `npm audit` en backend y frontend, con 0 vulnerabilidades.
- **Instalación limpia:** clonar el repositorio desde GitHub en otra carpeta y seguir el
  README tal cual, con el escenario completo del §8 (etapas 44 y 50), con npm y con
  Docker, sin `.env`. En los dos modos, ninguna petición del navegador a otro origen ni
  ningún preflight de CORS.
- **Proveedores de IA reales:** con mi clave de OpenAI, dos mensajes reales con
  `gpt-6.1-terra`; el segundo («¿qué te pedí antes?») recordó el primero. Con claves
  inválidas de Claude y de OpenAI, el chat explica que la clave fue rechazada. El modelo se
  eligió de la lista que devuelve la API con mi clave, no de memoria.
- **Markdown seguro:** una respuesta simulada con `<script>` e `<img onerror>` se muestra
  como texto, sin crear esos elementos ni ejecutar nada; y una respuesta real de OpenAI
  con tabla, lista y código se ve con formato en los dos temas.
- **Docker:** `docker compose up --build` en el puerto 8080: los dos contenedores
  «healthy», la página, una ruta del frontend, la API, Swagger y un 404 de la API en JSON;
  crear un agente, reiniciar el backend y comprobar que sigue (volumen); una consulta
  real; y que funciona sin `backend/.env`. Los Dockerfile y el compose, pasados por los
  analizadores de la skill de Docker.
- **Cómo verifiqué el trabajo de los agentes delegados:**
  - Cada encargo era cerrado: alcance, restricciones y evidencia obligatoria (build, lint,
    `npm audit`, rutas en 200, contraste, recorrido en el navegador). Un build o un lint
    fallido significaba que la tarea no estaba terminada.
  - Los workers no hacían commits. Claude Code, como coordinador, revisaba el diff contra
    la arquitectura acordada y repetía las pruebas contra el backend real, porque algunos
    agentes probaban con la API simulada.
  - Yo revisaba el resultado en el navegador y devolvía lo que no cumplía. Por ejemplo, el
    botón «Cerrar» del aviso casi no se leía y se lo devolví a Codex; en la revisión de la
    etapa 11 salieron el tema oscuro con 7 de 11 pares sin contraste suficiente y un
    `AgentList` de 432 líneas, y se corrigieron antes de confirmar.
  - Solo se hacía commit después de mi aprobación.
- **Lo que revisé leyendo el código**, y pregunté hasta entenderlo:
  - Por qué había `useCallback` en todas las funciones de `AgentsPage`: no hacía falta y
    se quitó.
  - Qué hacía `window.location.search` en `useAgentsListParams`: la IA propuso revertirlo;
    se comprobó que corregía un fallo real y lo mantuve.
  - Por qué `onSubmit` estaba envuelto en una función (regla de refs del lint).
  - Qué cambia con `queryOptions` en TanStack Query y por qué la invalidación por prefijo
    refresca a la vez el listado y el selector.
  - Cómo funciona CORS y el proxy de Vite, antes de aprobar el cambio.
  - En el backend, la comparación con mi proyecto Express (`Sistema-de-Notas-Backend`),
    para entender por qué NestJS organiza por funcionalidad.

## Qué haría distinto

- **Fijar la arquitectura antes de delegar la interfaz.** La repartí entre varios agentes
  (Codex, Antigravity, Sonnet, Claude) antes de cerrar la estructura del frontend. Se
  rehízo unas diez veces entre cinco autores y luego hubo que consolidarla (etapas 20–22).
  Hoy fijaría primero las carpetas y las reglas de composición, y después delegaría.
- **Probar siempre contra el backend real.** Algunos agentes comprobaban su trabajo con la
  API simulada; los fallos de integración solo aparecían al revisarlo con el servidor en
  marcha.
- **Registrar quién hizo qué desde el principio.** La bitácora tuvo huecos hasta que la
  audité contra las sesiones reales (etapa 35); es más fácil anotarlo en el momento.

## Errores y recomendaciones de la IA corregidos o descartados

| Qué pasó | Cómo se detectó | Qué se hizo |
| --- | --- | --- |
| La IA afirmó que Zod no era idiomático en NestJS | Lo cuestioné; se verificó en las notas de la versión 12 | Se cambió la recomendación |
| El proyecto generado por NestJS traía 5 vulnerabilidades (2 altas) | `npm audit` | Venían de `@nestjs/mau`, una herramienta de despliegue sin uso; se eliminó |
| La versión de Node instalada (26.13.0) no tenía el último parche de seguridad | Comparando con el índice oficial de versiones | Se instaló la 26.13.1 y se fijó en `.nvmrc` |
| Error de compilación: importar un tipo en una firma decorada sin `import type` | `npm run build` | Se corrigió a `import type` |
| Mensaje con mala concordancia: "Las instrucciones es obligatorio" | Prueba con `curl` | Se reescribieron los mensajes |
| Se subió por error un archivo de caché (`.tsbuildinfo`) | Revisando `git status` | Se añadió a `.gitignore` y se quitó del repositorio |
| El botón "Seleccionar" ocupaba casi todo el ancho | Captura en el navegador | Se corrigió con la clase `list-col-grow` de daisyUI |
| El tema oscuro que diseñé tenía 7 de 11 pares de color por debajo del contraste mínimo 4.5:1 | Cálculo de contraste de los colores OKLCH durante la revisión | Texto oscuro sobre los colores vivos; mínimo actual 5.11:1 |
| El worker de Codex dejó el botón "Cerrar" del aviso de éxito casi ilegible (texto oscuro sobre verde) | Revisión visual en el navegador antes de confirmar | Se le devolvió la corrección; pasó a un botón con contraste 13.85:1 |
| El revisor (Sonnet) sugirió sustituir NestJS por Express | Revisión del plan | Descartado: mantuve NestJS y lo justifico en el README |
| La IA propuso convertir los esquemas Zod a mano (`z.toJSONSchema`) para Swagger | Le pedí verificarlo en la documentación; leyó el código de `@nestjs/swagger` 12 y generó el documento | No hacía falta: Swagger 12 lee los esquemas de `@Body({ schema })` directamente. Se usó esa vía |
| Reglas por palabras clave para simular inteligencia en el mock | Discusión de diseño | Descartado: darían respuestas falsas; el mock responde con el agente, sus instrucciones y la consulta |
| La IA puso `useCallback` en todas las funciones de `AgentsPage` | Pregunté qué hacía cada uno; ningún hijo usaba `React.memo` | Se quitaron: no aportaban nada |
| La IA metió un contexto (`AgentActionsProvider`) siguiendo una skill pensada para librerías de componentes | Seguir un clic en «Editar» obligaba a abrir 7 archivos | Se sustituyó por estado en la página y props |
| La IA propuso revertir `window.location.search` en `useAgentsListParams` por «innecesario» | Pregunté en qué caso servía; la propia bitácora tenía el fallo reproducido | Lo mantuve: sin él, limpiar la búsqueda y ordenar seguido devolvía la búsqueda |
| La IA «simplificó» `onSubmit={handleSubmit(save)}` | El lint (regla de refs) lo marcó | Se volvió a la forma anterior y se dejó un comentario con el motivo |
| Con el puerto 5173 ocupado, Vite pasaba al 5174 y CORS bloqueaba la app con un mensaje falso de «sin conexión». Venía de mi decisión inicial de no usar proxy | Prueba en el navegador con Vite en otro puerto | Proxy de Vite: mismo origen, sin CORS, en cualquier puerto |
| Buscar «INGLÉS» no encontraba «inglés» y «Ángel» se ordenaba después de la Z | Pregunté «¿estás seguro de que no hay nada más?» y se probaron casos límite contra el servidor | Función `normalize_text` en SQLite y una prueba que lo cubre |
| Las estimaciones de la IA en las reorganizaciones («unas 300 líneas menos») | Se midió antes y después | Optimistas: la mejora real fue la legibilidad, no el tamaño; queda registrado |
| La IA propuso `vite preview` para servir el frontend en Docker | Le pedí buscar el estándar antes de implementar; la documentación de Vite dice que no es un servidor de producción | Retirada: nginx, el patrón habitual |
| La comprobación de salud de nginx fallaba aunque la web funcionaba | Probé la comprobación dentro del contenedor | `localhost` apuntaba a IPv6 y nginx escucha en IPv4: se usa `127.0.0.1` |
| El backend nunca leía `backend/.env`, aunque el README decía que se podía configurar ahí | Al preparar el LLM real, revisando cómo llegaba la clave | `process.loadEnvFile` de Node, sin dependencias, y una prueba con un `.env` real |
| Con el servidor caído, Consultar mostraba dos errores iguales y un «Elige un agente» falso; con una clave inválida decía «Inténtalo de nuevo» | Lo vi yo en el navegador y pedí reproducirlo | Un solo error con un «Reintentar» que recupera todo, y un mensaje que dice que la clave fue rechazada |

El registro completo, etapa por etapa, está en `BITACORA.md`.
