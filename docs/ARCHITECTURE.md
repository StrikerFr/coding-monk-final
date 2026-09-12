# MediKiosk frontend architecture

## Overview

MediKiosk is a modular frontend monolith. One TanStack Start application hosts seven independently owned experiences while sharing a visual system and low-level utilities.

The current implementation is frontend-only. Feature API modules provide asynchronous boundaries over synthetic data so real services can be introduced later without coupling screens to transport or storage details.

## Dependency direction

```text
routes
  ↓
features
  ↓
shared UI, hooks, utilities, and assets
```

- Routes may import feature entry points and providers.
- Features may import their own modules and shared code.
- Shared code must not import a product feature.
- Features should not import another feature. The legacy patient intake route is the only documented compatibility exception and reuses a landing visual.

## Feature anatomy

```text
src/features/<feature>/
├── components/             # Feature-owned components
│   └── pages/              # Route-level page compositions
├── mock/                   # Synthetic fixtures
├── translations/           # Feature dictionaries, when needed
├── api.ts                  # Replaceable frontend service boundary
├── types.ts                # Domain models
└── <feature>-context.tsx   # Local state and actions
```

Not every feature needs every folder. Add structure only when a feature owns that responsibility.

## Feature ownership

| Feature          | Responsibility                                                |
| ---------------- | ------------------------------------------------------------- |
| `landing`        | Public MediKiosk website, content, and entry calls to action  |
| `patient-kiosk`  | Guided kiosk session and future intake steps                  |
| `patient`        | Personal health dashboard and patient record views            |
| `assisted-kiosk` | Staff-assisted queue, intake, and handoff flow                |
| `clinician`      | Clinical worklist and case-review workspace                   |
| `operations`     | Technical operations queues, health, audit, and replay        |
| `admin`          | Controlled users, roles, facilities, audit, and configuration |

## Route layer

`src/routes/` remains flat and follows TanStack Router's file naming rules. Parent routes own providers and shells and must render `<Outlet />`; leaf routes render feature pages and own route metadata.

Do not move feature implementation into route files. Do not edit `src/routeTree.gen.ts`; it is generated automatically.

## State and data

- Product state stays within the product's provider.
- Mock API adapters return typed promises and model future service calls.
- Synthetic fixtures live under each feature's `mock/` folder.
- Components consume providers or passed props rather than importing fixtures directly.
- No screen should imply that demonstration actions are persisted or connected to a live service.

## Shared code

- `src/components/ui/`: accessible base controls and design-system primitives.
- `src/hooks/`: reusable behavior with no product ownership.
- `src/lib/`: utilities, language support, and application-wide error handling.
- `src/assets/`: bundled media and managed asset references.
- `src/styles.css`: semantic tokens, typography, global states, and accessibility utilities.

Promote code to a shared folder only after it is genuinely reused and its API is product-neutral.

## Adding a screen

1. Add models or mock API methods inside the owning feature.
2. Build the page under `src/features/<feature>/components/pages/`.
3. Add a thin route under `src/routes/` using the existing flat naming convention.
4. Add unique metadata and indexing rules to the route.
5. Add typed navigation with TanStack Router.
6. Run `bun run check`, `bun run format:check`, and `bun run build`.
7. Verify desktop and mobile layouts with no console errors or horizontal overflow.

## Accessibility baseline

Every surface must retain semantic landmarks, keyboard access, visible focus, sufficient contrast, touch-friendly controls, reduced-motion behavior, and statuses that do not rely on color alone.

## Future service integration

When backend work begins, replace implementations behind feature `api.ts` modules rather than calling services directly from components. Authentication, authorization, clinical processing, document handling, and healthcare integrations require separate secure server-side designs and are not represented by the current mock actions.
