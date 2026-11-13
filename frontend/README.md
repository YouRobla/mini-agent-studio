# Frontend de Mini Agent Studio

React + TypeScript, React Router, TanStack Query, React Hook Form, Zod y daisyUI.

## Organización

El código se separa por responsabilidades, agrupado por dominio
(agentes y consulta) y adaptado a las dos pantallas de la aplicación:

- `main.tsx`: montaje de React.
- `app/AppProviders.tsx`: proveedor de TanStack Query y BrowserRouter.
- `App.tsx`: composición de la aplicación; `app/AppRoutes.tsx`: rutas anidadas con layout y 404.
- `pages/`: composición de pantallas y navegación.
- `components/agents/`: creación, listado (tarjeta, fila, barra de herramientas, estados vacíos) y detalle de agentes.
- `components/consultation/`: selección, formulario y resultado de consultas.
- `components/layout/`: navegación y estructura de la aplicación.
- `components/ui/`: elementos compartidos, independientes del dominio.
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

El listado ocupa el ancho disponible. «Nuevo agente» abre el componente
`CreateAgentModal`, que usa `<dialog>` con `showModal()` y las clases de daisyUI.
El navegador gestiona el foco y la modalidad. Escape, Cancelar y el fondo cierran
el formulario; durante el guardado se bloquea el cierre. Los errores mantienen el
modal abierto. Al cerrar se limpian los campos y los errores.

Una creación correcta cierra el modal, actualiza el listado y muestra
`SuccessAlert`: un `alert alert-success` dentro de la página, con icono y cierre
manual. No hay toast, temporizador ni contexto global de notificaciones.

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
comprobar actualización del listado y alert; cerrar el aviso; seleccionar un agente
y enviar una consulta; cambiar de agente y comprobar el reinicio del formulario;
revisar navegación directa, móvil, teclado y persistencia del tema.


## Editar los temas

Los dos bloques `@plugin "daisyui/theme"` viven en `src/index.css`, después del
plugin principal. `themes: false` evita cargar los temas predefinidos.

- `coffee`: paleta nocturna personalizada suministrada desde el generador,
  con `prefersdark: true` para el modo oscuro del sistema.
- `coffee-light`: pareja diurna propia, con bases claras y acentos de las mismas
  familias, ajustados para superficies claras; es el tema por defecto.

Ambos mantienen los mismos radios, tamaños, profundidad y textura. Todo texto sobre
su fondo cumple un contraste mínimo de 4.5:1 (WCAG AA); en `coffee`, el texto sobre
los colores vivos (botón primario, avisos) es oscuro por ese motivo. El nombre
`coffee-light` es propio del proyecto, no un tema predefinido de daisyUI.
Para cambiar colores, edita sus tokens en CSS. Si cambias nombres, actualiza también
`ThemeToggle.tsx` e `index.html`. La preferencia guardada sigue usando
`light` / `dark`, por lo que las elecciones anteriores se conservan.


## Distribución de la consulta

La sección 3.B del PDF de la prueba pide un campo de consulta al agente
seleccionado, un botón que llame al backend y estados de carga/error.
La sección 8 comprueba seleccionar → escribir → recibir una respuesta.

`ConsultPage` alinea el encabezado y `AgentSelector` en escritorio.
`QueryPanel` coordina el estado entre la ficha `AgentDetails`, con el nombre y
las instrucciones siempre visibles, y `AgentChat`, con mensajes en burbujas
y `QueryForm` integrado al pie del chat. En móvil la ficha aparece antes del chat.

Al enviar, el mensaje se muestra en el chat y aparece un indicador de carga.
Si la respuesta llega correctamente, el campo se limpia y recupera el foco.
Si falla, conserva el texto para reintentar. Cambiar de agente reinicia
consulta y resultado. Se muestra la última ejecución, sin memoria conversacional
ni cambios en el contrato del backend.
