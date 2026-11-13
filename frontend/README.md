# Frontend de Mini Agent Studio

React + TypeScript, React Router, TanStack Query, React Hook Form, Zod y daisyUI.

## Organización

Organización por capas, y dentro de cada capa por dominio (agentes y consulta):

```
src/
├── main.tsx                 Monta la caché de TanStack Query y el RouterProvider
├── app/
│   ├── router.tsx           Rutas con createBrowserRouter (objetos de ruta)
│   ├── RootLayout.tsx       Ruta raíz: avisos (toasts) y panel con <Outlet />
│   └── queryClient.ts       Caché compartida de TanStack Query
├── pages/                   Un componente por ruta: Agents, Consult, NotFound, Error
├── components/
│   ├── layout/              Panel: menú lateral, barra superior, logo y tema
│   ├── agents/              Listado, tarjeta, fila, formulario, borrado, acciones
│   ├── consultation/        Contexto del agente, selector, chat y consulta
│   └── ui/                  Piezas sin dominio: toasts, diálogo, paginación, iconos
├── hooks/
│   ├── agents/              agentKeys (claves de caché), useAgentQueries,
│   │                        useAgentMutations, useAgentForm, useAgentsListParams
│   ├── consultation/        useQueryForm
│   └── useDebouncedValue.ts
├── api/                     client.ts (fetch y ApiError) y agents.ts (endpoints)
├── schemas/                 Validación con Zod (mismas reglas que el backend)
├── types/                   Tipos del dominio
└── utils/                   formatDate
```

Dependencias en un solo sentido: `pages` → `components` → `hooks` → `api`.
Las páginas componen; los componentes pintan y llaman a hooks; los hooks gestionan
datos (TanStack Query), formularios y la URL; `api/` es el único sitio que conoce el
backend. `components/ui/` no conoce endpoints ni el dominio.

**Enrutado.** `app/router.tsx` usa el modo de datos de React Router: un array de
objetos de ruta con `Component` y `ErrorBoundary`. La ruta raíz pinta el panel; una
ruta sin `path` agrupa las páginas para que un error inesperado se muestre con
`ErrorPage` dentro del panel, sin perder el menú. Las rutas son `/` (Agentes),
`/consultar/:agentId?` (Consultar, con el agente en la URL) y `*` (404).

**Estado.** El estado del servidor vive en TanStack Query. La página, el orden y la
búsqueda del listado viven en la URL con `useAgentsListParams`: cualquier componente
lo lee sin pasar props, y la vista se puede recargar o compartir. El resto es estado
local de cada componente (modal abierto, vista tarjetas/lista). No hay librería de
estado global. Solo `ToastProvider` usa `useCallback`/`useMemo`: el temporizador de
cada aviso depende de la función de cierre, que debe ser estable.

Para añadir una función: endpoint en `api/`, hook en `hooks/<dominio>/`, componente
en `components/<dominio>/` y composición en la página.

## Interfaz

El listado ocupa el ancho disponible. «Nuevo agente» abre `AgentFormModal` en modo
crear; el icono de lápiz de cada tarjeta o fila (y el botón Editar de la ficha en Consultar) lo
abre en modo editar con los valores del agente. Es un solo formulario (`useAgentForm`):
el modo decide el título, el texto del botón y los valores iniciales. Usa `<dialog>` con
`showModal()` y las clases de daisyUI; el navegador gestiona el foco y la modalidad.
Escape, Cancelar y el fondo cierran el formulario; durante el guardado se bloquea el
cierre. Los errores (por campo o generales) se muestran dentro del modal y conservan lo
escrito. El modal se monta al abrirse y se desmonta al cerrar, así que cada apertura
empieza limpia.

`ConfirmDialog` (`ui/`) es un `<dialog>` genérico para acciones destructivas: título,
mensaje, botón `btn-error`, estado de carga y error dentro del diálogo. No conoce
endpoints; `DeleteAgentDialog` le aporta el texto y la mutación. Tras eliminar se
muestra un aviso y, si se hizo desde Consultar, se navega a `/consultar`.

Los avisos usan `ToastProvider` (contexto de React, montado en `AppProviders`) y el hook
`useToast()` con `success(mensaje, acción?)`, `error` e `info`. `ToastViewport` los dibuja
con `toast toast-end toast-bottom` y `alert` de daisyUI. Desaparecen a los 4 s; el
temporizador se pausa con el ratón encima o con foco dentro; hay como máximo 3 a la vez.
Éxito e info usan `role="status"` y los errores `role="alert"`. La animación de entrada es
la del `toast` de daisyUI y se desactiva con `prefers-reduced-motion`. La acción opcional («Probar agente») es un
enlace dentro del aviso; como caduca, la misma acción existe en el botón Consultar del
listado. Los errores de una mutación no usan toast: se quedan en su modal o diálogo.

El selector de tema usa `theme-controller` y `swap`, sin React Context ni store.
daisyUI aplica los colores mediante CSS. El estado local del control guarda la
preferencia en localStorage y sincroniza data-theme. El script inicial de
`index.html` restaura la preferencia antes de montar React para evitar destellos;
en ausencia de preferencia usa el tema del sistema.

«Selecciona un agente» es un placeholder visible y deshabilitado. Cuando no hay
agentes, se deshabilita el selector completo y se ofrece crear el primero.

Referencias: [modal](https://daisyui.com/components/modal/) y
[theme controller](https://daisyui.com/components/theme-controller/).

## Comprobaciones

```sh
npm run build
npm run lint
```

Revisión manual: abrir/cancelar el modal, validar campos y crear un agente;
comprobar actualización del listado y el toast; editar y eliminar desde el listado y
desde Consultar; seleccionar un agente
y enviar una consulta; cambiar de agente y comprobar el reinicio del formulario;
revisar navegación directa, móvil, teclado y persistencia del tema.


## Editar los temas

Los dos bloques `@plugin "daisyui/theme"` viven en `src/index.css`, después del
plugin principal. `themes: false` evita cargar los temas predefinidos.

- `studio-light`: tema por defecto. Bases blancas y grises muy claros con un leve tono
  violeta; primario violeta.
- `studio-dark`: con `prefersdark: true` (modo oscuro del sistema). Fondos violeta
  noche y un primario violeta más claro.

Forma común: esquinas suaves (`--radius-box: 1rem`, campos a `0.5rem`), bordes de 1px,
sombra sutil y sin textura. Todo texto sobre su fondo cumple un contraste mínimo de
4.5:1 (WCAG AA); en `studio-dark` el texto sobre los colores vivos es oscuro por ese
motivo. El foco de teclado y el de los campos usan el primario.

La interfaz se apoya en componentes de daisyUI y deja Tailwind para la maquetación:
`drawer`, `menu` y `navbar` (estructura), `card` (tarjetas), `list` (vista en lista),
`avatar` (inicial del agente), `join` (vista y paginación), `modal` (formulario y
confirmación, desde abajo en móvil), `fieldset` (campos), `collapse` (instrucciones en
Consultar), `chat` (conversación), `toast` y `alert` (avisos, con su aspecto y animación
nativos), `skeleton` y `loading` (carga), `tooltip`, `badge` y `kbd`.

Para cambiar colores, edita sus tokens en CSS. Si cambias nombres, actualiza también
`ThemeToggle.tsx` e `index.html`. La preferencia guardada sigue usando
`light` / `dark`, por lo que las elecciones anteriores se conservan.


## Distribución de la consulta

La sección 3.B del PDF de la prueba pide un campo de consulta al agente
seleccionado, un botón que llame al backend y estados de carga/error.
La sección 8 comprueba seleccionar → escribir → recibir una respuesta.

`ConsultPage` apila dos bloques. Arriba, `AgentPanel` es el encabezado de contexto:
`AgentSelector` con los botones Editar y Eliminar al lado, y debajo `AgentDetails`, un
`collapse` abierto por defecto con las instrucciones, el número de caracteres y la
fecha (se puede plegar para dar más espacio al chat). Debajo, `QueryPanel` muestra
`AgentChat` a todo el ancho (o una invitación a elegir agente): cabecera, mensajes con su
propio scroll (los tuyos en burbuja violeta; los del agente con su avatar y el proveedor
al pie) y `QueryForm` fijo abajo. El chat ocupa el alto restante de la pantalla
(`chatLayout.ts`). El nombre del agente aparece una sola vez, en el selector. En móvil
el botón de envío muestra solo el icono, con «Enviar consulta» como nombre accesible.

Al enviar, el mensaje se muestra en el chat y aparece un indicador de carga.
Si la respuesta llega correctamente, el campo se limpia y recupera el foco.
Si falla, conserva el texto para reintentar. Cambiar de agente reinicia
consulta y resultado. Se muestra la última ejecución, sin memoria conversacional
ni cambios en el contrato del backend.
