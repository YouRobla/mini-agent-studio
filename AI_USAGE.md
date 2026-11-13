# Uso de IA durante el desarrollo

> **Borrador generado a partir de `BITACORA.md`.** Debo revisarlo y ajustarlo con mis
> palabras antes de entregar, sobre todo las secciones marcadas con _(completar)_.

## Herramientas utilizadas

| Herramienta | Para qué |
| --- | --- |
| Claude Code (modelo Claude Fable 5.2) | Análisis de requisitos, propuesta de arquitectura, generación del código, pruebas manuales y documentación |
| Subagente Claude Sonnet | Revisión independiente del plan contra el enunciado, antes de escribir código |
| Antigravity con Gemini 4 Hydrogen (worker en Orca) | Icono de la aplicación y favicon: exploró conceptos con su generador de imágenes y entregó el SVG final dibujado a mano |
| Codex (worker en Orca, coordinado desde Claude Code) | Mejora de la interfaz: panel con navegación, dos vistas con React Router, skeletons y temas claro/oscuro |
| Skills `nestjs-best-practices` y `daisyui` | Guías de referencia para NestJS y para los componentes de daisyUI 5 |
| Skills `tanstack-query-best-practices` y `vercel-composition-patterns` | Reglas para la capa de datos (claves de caché, `placeholderData`, invalidación) y para componer componentes sin props booleanas ni UI acoplada al estado |
| CLI `npx skills` | Búsqueda y evaluación de skills; se revisó su contenido antes de instalarlas |
| Orca | _(completar: cómo lo usé)_ |

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

**4. Decisión de persistencia con criterio:**

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
visual de nodos, tipos de agente preseleccionables, Zustand y React Router.

_(completar: cambios que hice a mano en el código después de revisarlo)_

## Cómo comprobé que funciona

- **API con `curl`** tras cada commit del backend: crear, listar, ejecutar, campos vacíos,
  cuerpo ausente, JSON inválido, texto demasiado largo, agente inexistente y ruta inexistente.
- **Persistencia:** detener el backend, arrancarlo de nuevo y comprobar que el agente sigue.
- **Flujo completo en el navegador:** formulario vacío (errores por campo), crear agente,
  selección automática, consulta vacía, consulta válida con respuesta, backend detenido
  (mensaje de conexión y botón de reintento) y recuperación sin recargar.
- **CORS:** petición `OPTIONS` desde el origen del frontend.
- **Seguridad de dependencias:** `npm audit` en backend y frontend, con 0 vulnerabilidades.
- **Instalación limpia:** clonar el repositorio en otra carpeta y seguir el README.
- _(completar: lo que revisé yo leyendo el código)_

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
