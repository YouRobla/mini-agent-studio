# Frontend de Mini Agent Studio

React 19 + TypeScript, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS y
daisyUI. Esta guía explica dónde está cada cosa, qué hace cada librería y cómo se
comunican los componentes.

## 1. Mapa de carpetas

```
src/
├── main.tsx              Arranque: crea la caché de TanStack Query y monta el router
├── router.tsx            Rutas: / (Agentes), /consultar/:agentId? (Consultar), * (404)
├── paths.ts              Enlaces: paths.agents, paths.consult(id). Nadie escribe URLs a mano
├── index.css             Tailwind, daisyUI y los dos temas
│
├── pages/                Una página por ruta. Es la que coordina la pantalla
│   ├── AgentsPage.tsx        Listado + «Nuevo agente» + diálogos
│   ├── ConsultPage.tsx       Selector + instrucciones + caja de consulta + diálogos
│   ├── NotFoundPage.tsx      404
│   └── ErrorPage.tsx         Error inesperado al pintar una ruta
│
├── components/
│   ├── layout/           El marco de la aplicación
│   │   ├── AppLayout.tsx     Ruta raíz: menú lateral, barra superior, avisos y <Outlet />
│   │   ├── Sidebar.tsx       Menú con la vista activa marcada
│   │   ├── ThemeToggle.tsx   Conmutador de tema (solo CSS de daisyUI)
│   │   └── AppLogo.tsx       Logotipo SVG
│   ├── agents/           Todo lo que muestra o cambia agentes
│   │   ├── AgentList.tsx     Sección del listado: pide los datos y elige qué estado pintar
│   │   ├── AgentsToolbar.tsx Búsqueda, orden y vista (cuadrícula o lista)
│   │   ├── AgentCard.tsx     Un agente en la cuadrícula
│   │   ├── AgentRow.tsx      Un agente en la lista
│   │   ├── AgentActions.tsx  AgentIconActions (listado) y AgentLabelActions (Consultar)
│   │   ├── AgentDialogs.tsx  Pinta el diálogo abierto (crear, editar o eliminar) y avisa
│   │   ├── AgentFormModal.tsx  Formulario de crear/editar en un modal
│   │   ├── DeleteAgentDialog.tsx  Confirmación de borrado
│   │   └── AgentAvatar, ConsultAgentLink, AgentsEmptyState (+ AgentsNoResults), AgentsSkeleton
│   ├── consult/          Todo lo de probar un agente
│   │   ├── AgentSelector.tsx    Selector del agente (pide sus opciones)
│   │   ├── AgentInstructions.tsx  Instrucciones del agente elegido
│   │   ├── ConsultBox.tsx       Ejecuta la consulta y reparte su estado
│   │   ├── ConsultMessages.tsx  Pregunta, espera, respuesta o error
│   │   └── ConsultForm.tsx      Campo de texto y botón de envío
│   └── ui/               Piezas sin dominio (no saben qué es un agente)
│       └── Modal, ConfirmDialog, ErrorAlert, Pagination, PageHeader, icons, toast
│
├── hooks/
│   ├── useAgents.ts          Datos del servidor (TanStack Query): lecturas y escrituras
│   ├── useAgentsListParams.ts  Página, orden y búsqueda guardados en la URL
│   └── useDebouncedValue.ts    Retrasa la búsqueda 250 ms
│
├── api/
│   ├── client.ts         fetch, errores legibles (ApiError) y errores por campo
│   └── agents.ts         Una función por endpoint
├── schemas/agent.schemas.ts  Reglas de los formularios (Zod), las mismas que el backend
├── types/agent.ts        Tipos de lo que devuelve la API
└── utils/formatDate.ts   Fecha corta en español
```

Las dependencias van en un solo sentido: `pages` → `components` → `hooks` → `api`.
`ui/` no importa nada de `agents/` ni de `consult/`.

### Vocabulario

- **Agente**: lo que se crea, se edita y se elimina.
- **Consulta** (`consult`): probar un agente. En la interfaz es «Consultar»; en el código,
  la carpeta `consult/` y los componentes `Consult*`.
- **Run**: solo en la capa de API, porque así se llama el endpoint
  (`POST /agents/:id/run`): `runAgent` y `useRunAgent`.
- `query` es solo el nombre del campo JSON que espera el backend (`{ "query": "…" }`).
  No se usa para nombrar componentes, para no confundirlo con TanStack Query.

## 2. Cómo se comunican los componentes

Tres reglas:

1. **Quien muestra datos del servidor, los pide.** Cada sección llama a su hook de
   `useAgents.ts` (`AgentList` → `useAgents`, `AgentSelector` → `useAgentOptions`,
   `ConsultPage` → `useAgent`). La caché de TanStack Query comparte los resultados y evita
   peticiones repetidas, así que no hace falta pasarlos por props.
2. **La página coordina lo que comparten sus secciones**: qué diálogo está abierto. Lo
   guarda con `useState` y lo baja por props (`onEdit`, `onDelete`, `onCreate`).
3. **El resto de componentes solo pintan y avisan.** Reciben datos por props y llaman a
   `onAlgo` cuando el usuario actúa. No hay contextos propios salvo el de los avisos.

```
AgentsPage                    useState: diálogo abierto
├── PageHeader + «Nuevo agente» ──► setDialog({ type: "create" })
├── AgentList                 useAgents + filtros de la URL
│   ├── AgentsToolbar
│   ├── AgentCard / AgentRow
│   │   └── AgentIconActions  ──► onEdit(agent) / onDelete(agent)
│   └── Pagination
└── AgentDialogs              crear / editar / eliminar + aviso

ConsultPage                   useAgent(agentId de la URL) + diálogo abierto
├── AgentSelector             useAgentOptions ──► navega a /consultar/:id
├── AgentLabelActions
├── AgentInstructions
├── ConsultBox                useRunAgent (se reinicia con key={agent.id})
│   ├── ConsultMessages
│   └── ConsultForm
└── AgentDialogs              al eliminar ──► navega a /consultar
```

Ejemplo, pulsar «Editar» en una tarjeta:

1. `AgentIconActions` llama a `onEdit(agent)`, que llega por props desde la página.
2. `AgentsPage` hace `setDialog({ type: "edit", agent })`.
3. `AgentDialogs` ve el diálogo `edit` y pinta `AgentFormModal` con ese agente.
4. Al guardar, `AgentFormModal` llama a `useUpdateAgent` → `api/agents.ts` →
   `PUT /api/agents/:id`. Después cierra el modal y `AgentDialogs` muestra el aviso.

## 3. Qué hace cada librería y dónde vive

### React

Pinta la interfaz a partir de componentes (funciones que devuelven JSX) y vuelve a
pintar cuando cambian sus datos.

- `useState`: estado local de un componente (diálogo abierto, vista cuadrícula o lista).
- `useEffect`: sincronizar con algo externo (el temporizador de un aviso, el debounce).
- `key`: si cambia, React monta el componente de cero. `ConsultBox` usa
  `key={agent.id}` para empezar limpio al cambiar de agente.
- Regla: si un dato viene del servidor, no va en `useState` sino en TanStack Query.

### React Router: las rutas y la URL

Decide qué página se ve según la dirección y guarda en la URL lo que debe sobrevivir a
una recarga.

- `router.tsx`: la lista de rutas. `AppLayout` es la ruta raíz y pinta cada página en
  su `<Outlet />`.
- `paths.ts`: construye cada URL para `<Link>` y `navigate()` (`paths.consult(agent.id)`
  ya codifica el id). Si cambia una ruta, se cambia aquí y en `router.tsx`.
- `useParams()`: lee `:agentId` en Consultar.
- `useNavigate()`: cambia de ruta desde código (al elegir agente, al eliminarlo).
- `useSearchParams()`: lee y escribe `?page=&sort=&search=`
  (en `useAgentsListParams.ts`).
- `<Link>` y `<NavLink>`: enlaces sin recargar. `NavLink` marca la vista activa.
- `ErrorBoundary: ErrorPage`: si una página falla al pintarse, se ve un mensaje dentro
  del panel en lugar de una pantalla en blanco.

### TanStack Query: los datos del servidor

Pide los datos al backend, los guarda en caché, sabe si están cargando o si fallaron, y
los vuelve a pedir cuando algo los cambia. Todo está en `hooks/useAgents.ts`.

```ts
// Lectura: se pide sola al montar el componente y se guarda con su clave.
const agents = useAgents({ page, sort, search });
agents.isPending; agents.isError; agents.data; agents.refetch();

// Escritura: se lanza a demanda.
const deleteAgent = useDeleteAgent();
deleteAgent.mutate(agent.id, { onSuccess: () => cerrar() });
```

- `queryKey`: el nombre del dato en la caché (`["agents", "list", filtros]`). Si cambian
  los filtros, cambia la clave y se hace una petición nueva.
- `queryFn`: la función de `api/` que lo trae.
- `agentQueries` (con `queryOptions`): clave y función juntas en un solo objeto por dato
  (`agentQueries.list(params)`, `agentQueries.detail(id)`). Los hooks lo extienden con
  sus ajustes (`...agentQueries.list(params), placeholderData`) y las mutaciones usan su
  `.queryKey`, así `setQueryData` sabe que guarda un `Agent`.
- `useMutation` + `onSuccess`: tras crear, editar o eliminar se invalidan los listados
  (`invalidateQueries`) y se vuelven a pedir solos.
- `placeholderData: keepPreviousData`: al cambiar de página se sigue viendo la anterior
  hasta que llega la nueva.
- Ajustes globales en `main.tsx`: un reintento y datos frescos durante 30 s.
- Regla: los componentes no llaman a `fetch` ni a `api/` directamente; siempre a través
  de un hook de `useAgents.ts`.

### Paginación, orden y búsqueda: los hace el backend

El frontend no filtra ni ordena nada: guarda los filtros en la URL, se los envía al
backend (`GET /api/agents?page=2&sort=name&search=…`) y pinta lo que responde. El
backend decide el tamaño de página (6) y devuelve `meta` con los totales. La búsqueda
espera 250 ms (`useDebouncedValue`) para no lanzar una petición por cada letra.

### React Hook Form: los formularios

`useForm()` es el hook de React Hook Form que gestiona un formulario completo: guarda el
valor de cada campo, ejecuta la validación al enviar y lleva la cuenta de los errores, sin
un `useState` por campo. Se usa dentro del propio formulario (`AgentFormModal`,
`ConsultForm`).

```tsx
const { register, handleSubmit, setError, formState: { errors } } =
  useForm<CreateAgentInput>({ resolver: zodResolver(createAgentSchema) });

<input {...register("name")} />          // conecta el campo con el formulario
{errors.name && <p>{errors.name.message}</p>}
<form onSubmit={handleSubmit(save)}>     // valida y, si todo es correcto, llama a save
setError("name", { message });           // coloca un error del servidor en su campo
```

### Zod: las reglas de los datos

Describe cómo deben ser los datos (texto obligatorio, máximo de caracteres) y da los
mensajes de error. `schemas/agent.schemas.ts` tiene las mismas reglas que el backend: aquí
avisan antes de enviar, pero la validación que cuenta es la del servidor. `z.infer` saca
de cada esquema el tipo de TypeScript (`CreateAgentInput`, `RunAgentInput`).

### Tailwind CSS y daisyUI: el aspecto

- **daisyUI** aporta los componentes por clase (`btn`, `card`, `modal`, `alert`,
  `toast`…), los colores semánticos (`primary`, `base-100`, `error`…) y los temas. Es solo
  CSS: no tiene JavaScript, así que no puede decidir cuándo aparece o desaparece algo.
  Eso lo hace React o, en los avisos, Sonner.
- **Tailwind** se usa para la maquetación (`flex`, `grid`, `gap-3`, `sm:`…).
- Reglas: primero la clase de daisyUI; Tailwind solo para lo que daisyUI no cubre; colores
  de daisyUI (`text-base-content/70`) en lugar de colores fijos, para que funcionen en los
  dos temas; sin CSS propio si una clase lo resuelve.

### Sonner: los avisos

[Sonner](https://sonner.emilkowal.ski/) gestiona la cola de avisos, el cierre a los 4 s y
la pausa con el ratón encima. `<Toaster />` está en `AppLayout` y `showSuccess()` (en
`ui/toast.tsx`) pinta cada aviso con `toast.custom()` y el `alert` de daisyUI, así sigue
el tema activo sin estilos propios de Sonner. Se instala el paquete `sonner` solo, sin
shadcn.

### fetch y `api/`: hablar con el backend

Sin librería. `client.ts` es el único sitio que conoce la dirección del backend. Convierte
cualquier fallo en un `ApiError` con un mensaje listo para mostrar:

- `errorMessage(error)`: texto para el usuario («No se pudo conectar con el servidor…»).
- `fieldError(error, "name")`: el error que el servidor asignó a un campo concreto.
- `isNotFound(error)`: si fue un 404.

## 4. Dónde vive cada estado

| Estado | Dónde | Ejemplo |
|---|---|---|
| Datos del servidor | TanStack Query (`useAgents.ts`) | Listado, agente elegido, respuesta |
| Lo que debe sobrevivir a una recarga | URL (React Router) | Página, orden, búsqueda, agente en Consultar |
| Lo que comparte una página | `useState` en la página | Diálogo abierto |
| Lo que solo usa un componente | `useState` en ese componente | Vista cuadrícula o lista, menú móvil |
| Campos de un formulario | React Hook Form | Nombre, instrucciones, consulta |
| Avisos | Sonner (`<Toaster />` en `AppLayout`) | «Agente creado» |
| Tema | CSS de daisyUI (`theme-controller`) | Claro u oscuro |

## 5. Cómo añadir algo nuevo

1. Función del endpoint en `api/agents.ts`.
2. Hook en `hooks/useAgents.ts`: si lee, una entrada en `agentQueries` y un `useQuery`
   que la usa; si escribe, un `useMutation` que invalida lo que cambia.
3. Componente en `components/agents/` o `components/consult/`, que llama al hook si
   muestra datos y recibe el resto por props.
4. Lo coloca la página, que decide qué pasa después (navegar, abrir un diálogo).

## 6. Detalles de la interfaz

- **Modal** (`ui/Modal.tsx`): `<dialog>` nativo con las clases de daisyUI. El navegador
  gestiona el foco y Escape, y al cerrar devuelve el foco al botón que lo abrió. Se monta
  al abrirse, así que cada apertura empieza limpia. Mientras guarda no se puede cerrar.
- **Errores**: los de un formulario o diálogo se quedan dentro (junto al campo si el
  servidor lo indica) y conservan lo escrito. Los de carga muestran `ErrorAlert` con
  «Reintentar».
- **Avisos** (`ui/toast.tsx`, con Sonner): solo de éxito, abajo a la derecha, con el
  `alert` de daisyUI. Se cierran a los 4 s, la cuenta se pausa con el ratón encima y hay
  como máximo 3 a la vez. El de crear incluye el enlace «Probar agente».
- **Tema**: al cargar se usa el del sistema (`prefersdark`). El conmutador es una casilla
  `theme-controller` dentro de un `swap`: su `value` es el tema contrario y, mientras está
  marcada, daisyUI lo aplica. No hay estado de React, `localStorage` ni script en
  `index.html`; al recargar se vuelve al tema del sistema.
- **Consulta**: al enviar, la pregunta aparece en el chat con un indicador de carga. Si
  va bien, el campo se limpia y recupera el foco; si falla, conserva el texto. Se muestra
  la última consulta, sin historial. `Ctrl + Enter` envía.

## 7. Editar los temas

Los bloques `@plugin "daisyui/theme"` están en `src/index.css`. `themes: false` evita
cargar los temas predefinidos.

- `studio-light`: tema por defecto. Bases blancas y grises con un leve tono violeta.
- `studio-dark`: `prefersdark: true` (modo oscuro del sistema). Fondos violeta noche.

Los dos tienen esquinas suaves, bordes de 1px y contraste mínimo de 4.5:1 (WCAG AA). Para
cambiar colores, edita sus tokens. Si cambias los nombres de los temas, actualiza también
`ThemeToggle.tsx`. Referencias:
[modal](https://daisyui.com/components/modal/),
[theme controller](https://daisyui.com/components/theme-controller/) y
[alert](https://daisyui.com/components/alert/).

## 8. Comprobaciones

```sh
npm run build
npm run lint
```

Revisión manual: crear (con y sin campos), ver el aviso y el listado; buscar, ordenar,
paginar y cambiar de vista; editar y eliminar desde el listado y desde Consultar;
seleccionar un agente y enviar una consulta (también vacía); abrir
`/consultar/no-existe`; detener el backend y recargar; cambiar el tema.
