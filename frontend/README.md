# Frontend de Mini Agent Studio

React + TypeScript, React Router, TanStack Query, React Hook Form, Zod y daisyUI.

## Organización

Organización por capas y, dentro de cada capa, por dominio (agentes y consulta):

```
src/
├── main.tsx                 Monta la caché de TanStack Query y el RouterProvider
├── app/
│   ├── router.tsx           Rutas con createBrowserRouter (objetos de ruta)
│   └── RootLayout.tsx       Ruta raíz: avisos (toasts) y panel con <Outlet />
├── pages/                   Un componente por ruta: Agents, Consult, NotFound, Error
├── components/
│   ├── layout/              StudioLayout (panel), Sidebar, ThemeToggle, AppLogo
│   ├── agents/              AgentList, AgentsToolbar, AgentCard, AgentRow,
│   │                        AgentFormModal, DeleteAgentDialog, AgentActionsProvider,
│   │                        AgentActionButtons, estados vacíos y de carga
│   ├── consultation/        AgentPanel, AgentSelector, AgentChat, ChatMessages, QueryForm
│   └── ui/                  Sin dominio: Modal, ConfirmDialog, ErrorAlert, Pagination,
│                            PageHeader, icons y toast/
├── hooks/
│   ├── agents/              useAgentQueries (con las claves de caché), useAgentMutations,
│   │                        useAgentForm, useAgentActions, useAgentsListParams
│   ├── consultation/        useQueryForm
│   └── useDebouncedValue.ts
├── api/                     client.ts (fetch y errores) y agents.ts (endpoints)
├── schemas/                 Validación con Zod (mismas reglas que el backend)
├── types/                   Tipos del dominio
└── utils/                   formatDate
```

Dependencias en un solo sentido: `pages` → `components` → `hooks` → `api`.
`consultation/` puede usar piezas de `agents/` (consulta agentes), nunca al revés, y
`ui/` no conoce ni el dominio ni los endpoints.

### Reglas del código

1. **Contenedores y vistas.** Las páginas y unos pocos contenedores (`AgentList`,
   `AgentPanel`, `AgentChat`) llaman a los hooks de datos y deciden qué estado mostrar.
   El resto de componentes solo recibe datos y funciones por props.
2. **Ningún componente recibe un hook entero por props.** Cada formulario llama a su
   propio hook (`AgentFormModal` → `useAgentForm`, `QueryForm` → `useQueryForm`); la
   lógica vive en el hook y el marcado en el componente.
3. **Un solo camino para escribir.** Crear, editar y eliminar pasan por
   `useAgentActions()`. `AgentActionsProvider` guarda qué diálogo está abierto, lo pinta
   y avisa del resultado con un toast; cada página lo monta con lo que debe ocurrir
   después (`onCreated`, `onDeleted`). Así los botones no reciben funciones en cadena.
4. **Piezas compartidas una sola vez.** `Modal` (el `<dialog>` nativo), `ConfirmDialog`,
   `ErrorAlert` (error con «Reintentar») y todos los iconos (`ui/icons.tsx`).
5. **Estado donde corresponde.** Datos del servidor en TanStack Query; página, orden y
   búsqueda en la URL (`useAgentsListParams`); lo demás, estado local. No hay librería
   de estado global. Solo `ToastProvider` usa `useCallback`/`useMemo`, porque el
   temporizador de cada aviso depende de una función estable.

**Enrutado.** `app/router.tsx` usa el modo de datos de React Router: un array de
objetos de ruta con `Component` y `ErrorBoundary`. La ruta raíz pinta el panel; una
ruta sin `path` agrupa las páginas para que un error inesperado se muestre con
`ErrorPage` dentro del panel, sin perder el menú. Las rutas son `/` (Agentes),
`/consultar/:agentId?` (Consultar, con el agente en la URL) y `*` (404).

**Datos.** `useAgent` muestra al instante el agente si ya está en un listado en caché
(`placeholderData`), pero siempre lo confirma con el backend. Las mutaciones invalidan
los listados con `agentKeys.lists`.

Para añadir una función: endpoint en `api/`, hook en `hooks/<dominio>/`, componente
en `components/<dominio>/` y composición en la página.

## Interfaz

«Nuevo agente» y el icono de lápiz abren `AgentFormModal`, el mismo formulario para
crear y editar: con un agente parte de sus valores y cambia el título y el botón.
`Modal` usa `<dialog>` con `showModal()` y las clases de daisyUI; el navegador gestiona
el foco y la modalidad, y al cerrar devuelve el foco al botón que lo abrió. Escape,
Cancelar y el fondo cierran; durante el guardado se bloquea el cierre. Los errores (por
campo o generales) se muestran dentro del modal y conservan lo escrito. El modal se
monta al abrirse y se desmonta al cerrar, así que cada apertura empieza limpia.

`ConfirmDialog` es genérico para acciones destructivas: título, mensaje, botón
`btn-error`, estado de carga y error dentro del diálogo. `DeleteAgentDialog` le aporta
el texto y la mutación. Tras eliminar se muestra un aviso y, si se hizo desde
Consultar, se navega a `/consultar`.

Los avisos usan `ToastProvider` (montado en la ruta raíz) y `useToast()` con
`success(mensaje, acción?)`, `error` e `info`. Se pintan con `toast toast-end
toast-bottom` y `alert` de daisyUI. Desaparecen a los 4 s; el temporizador se pausa con
el ratón encima o con foco dentro; hay como máximo 3 a la vez. Éxito e info usan
`role="status"` y los errores `role="alert"`. La acción opcional («Probar agente») es un
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
`AgentSelector` con los botones Editar y Eliminar al lado, y debajo un `collapse`
abierto por defecto con las instrucciones, el número de caracteres y la fecha (se puede
plegar para dar más espacio al chat). Debajo va `AgentChat` a todo el ancho (o
`ChatPlaceholder`, la invitación a elegir agente). `AgentChat` ejecuta la consulta y
reparte su estado entre `ChatMessages` (mensajes con su propio scroll: los tuyos en
burbuja violeta; los del agente con su avatar y el proveedor al pie) y `QueryForm`, fijo
abajo. El chat ocupa el alto restante de la pantalla. El nombre del agente aparece una
sola vez, en el selector. En móvil el botón de envío muestra solo el icono, con
«Enviar consulta» como nombre accesible.

Al enviar, el mensaje se muestra en el chat y aparece un indicador de carga.
Si la respuesta llega correctamente, el campo se limpia y recupera el foco.
Si falla, conserva el texto para reintentar. Cambiar de agente reinicia
consulta y resultado. Se muestra la última ejecución, sin memoria conversacional
ni cambios en el contrato del backend.
