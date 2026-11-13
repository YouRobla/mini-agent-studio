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
| Antigravity, worker en Orca | `gemini-4-hydrogen-xhigh` | Icono y favicon: exploró conceptos con su generador de imágenes y entregó el SVG final dibujado a mano |
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
5. Implementación por commits pequeños, probando cada uno.

## Ejemplos de prompts

**1. Análisis de requisitos (antes de elegir stack):**

> Actúa como analista de requisitos y arquitecto. Analiza exhaustivamente el documento y
> ayúdame a establecer las bases del proyecto antes de seleccionar el stack, diseñar la
> arquitectura o escribir código. Distingue siempre entre lo explícitamente solicitado, lo
> que se infiere razonablemente y lo que propones como mejora. No escribas código todavía.

**2. Revisión independiente con otro modelo:**

> Eres un revisor técnico independiente. Lee el PDF y valida este plan. Tu trabajo es
> encontrar errores, omisiones y sobreingeniería, no confirmar. Indica requisitos omitidos,
> elementos sin respaldo en el PDF que añadan riesgo, y riesgos frente al escenario de
> evaluación. Da un veredicto.

**3. Encargo cerrado a otro agente (Codex):** especificación con el objetivo, las rutas,
lo que se podía y no se podía tocar, y la evidencia obligatoria para darla por terminada:

> Solo edita `frontend/`. No añadas otras dependencias. Mantén todo el manejo de errores
> actual. Sin CDN ni fuentes externas. No hagas commits. Un build o lint fallido significa
> que la tarea NO está terminada. Entrega: build, lint, `npm audit`, rutas en 200, archivos
> modificados y los pares de contraste de los dos temas.

**4. Dirigiendo yo a Codex, sin Claude de por medio:**

> Necesito que me ayudes a pulir, organizar y mejorar la presentación y la
> componentización de mi proyecto de React. Quiero imitar la arquitectura de frontend de
> mi otro proyecto, no a esa escala, pero sí hay cosas que me gustaría ordenar.

**5. Decisión de persistencia con criterio:**

> De manera crítica y objetiva, ¿cuál escogerías para el alcance principal que pide el
> documento, teniendo en cuenta los extras?

## Qué hizo la IA y qué decidí o cambié yo

La IA generó el código del backend y del frontend siguiendo el diseño acordado. Las
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
- **Instalación limpia:** clonar el repositorio en otra carpeta y seguir el README.
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
| Reglas por palabras clave para simular inteligencia en el mock | Discusión de diseño | Descartado: darían respuestas falsas; el mock muestra lo que se enviaría al modelo |

El registro completo, etapa por etapa, está en `BITACORA.md`.
