# Frontend de Mini Agent Studio

React + TypeScript, React Router, TanStack Query, React Hook Form, Zod y daisyUI.

## Organización

El código se separa por responsabilidades, agrupado por dominio
(agentes y consulta) y adaptado a las dos pantallas de la aplicación:

- `main.tsx`: montaje de React.
- `app/AppProviders.tsx`: proveedor de TanStack Query y BrowserRouter.
- `App.tsx`: composición de la aplicación; `app/AppRoutes.tsx`: rutas anidadas con layout y 404.
- `pages/`: composición de pantallas y navegación.
- `components/agents/`: formulario de crear/editar, confirmación de borrado, acciones rápidas (editar y eliminar) y listado (tarjeta, fila, barra de herramientas, estados vacíos).
- `components/consultation/`: selección, formulario y resultado de consultas.
- `components/layout/`: navegación y estructura de la aplicación.
- `components/ui/`: elementos compartidos, independientes del dominio (`ConfirmDialog`, `toast/`).
- `hooks/`: peticiones/cache y lógica de formularios, incluyendo validación y errores de campos.
- `api/`: transporte HTTP y endpoints.
- `schemas/`: validación de entradas; `types/`: contratos del dominio.
- `components/layout/ThemeToggle.tsx`: control nativo de daisyUI con persistencia local.

Las páginas componen componentes y conectan la navegación. Los hooks gestionan
formularios y datos; la API no depende de componentes. Los componentes compartidos
no conocen los endpoints. El estado remoto permanece en TanStack Query.

Para agregar una función, extiende primero la API y su hook cuando sea necesario,
crea su componente dentro del grupo correspondiente y compón la página. Extrae
elementos a `ui/` cuando tengan una responsabilidad independiente o se reutilicen.
No se necesitan stores, buses de eventos ni una capa adicional de servicios.

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
