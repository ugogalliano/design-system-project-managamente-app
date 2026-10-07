# @ugogalliano/pm-design-system-vue

## 0.5.0

### Minor Changes

- 4e587e5: Nuovi componenti pubblici e nuova emissione CSS.

  - **UI**: `Button` e `Badge` (Badge con varianti `owner` / `editor` / `viewer`).
  - **Feedback**: `Dialog` (chiusura con Escape e backdrop-click, disattivabile con `dismissable`) e lo stack toast `Toast` / `Toaster` / `useToast` (auto-dismiss configurabile, animazioni di ingresso/uscita, swipe-to-dismiss, `prefers-reduced-motion` rispettato).
  - **Barrel**: `src/index.ts` ora esporta `Dialog`, `Button`, `Badge`, `Toast`, `Toaster`, `useToast` e i tipi `ToastInput`, `ToastItem`, `ToastVariant`.
  - **CSS**: `src/index.ts` importa `src/tokens/index.css`, così la build della libreria emette il foglio di stile compilato (`dist/tokens.css`, esposto sia come `/tokens.css` sia come `/style.css`) con i token semantici (inclusi tema scuro, token `success`/`warning`/`info` e il nuovo `--overlay`) e le utility Tailwind usate dai componenti. Nessuna configurazione Tailwind aggiuntiva è richiesta al consumer per le classi interne dei componenti.

## 0.4.0

### Minor Changes

- 2ae56b2: Esportato il Tailwind preset del design system (`/tailwind-preset`) e i soli token CSS (`/tokens.css`). Il bundle `dist/style.css` (ora alias di `tokens.css`) non contiene più le utility Tailwind: i progetti consumer devono usare il preset nel proprio `tailwind.config` così che le utility vengano generate dal loro build con il tema del design system.

  Setup consumer:

  ```js
  // tailwind.config.js
  export default {
    presets: [require('@ugogalliano/pm-design-system-vue/tailwind-preset')],
    content: ['./index.html', './src/**/*.{vue,ts}'],
  }
  ```

  ```css
  /* main.css */
  @import '@ugogalliano/pm-design-system-vue/tokens.css';
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

- c37d08a: Migrazione a **Zod 4**: i peer `zod` e le dipendenze form passano da `^3.23.0` a **`^4.6.5`**, con `vee-validate` e `@vee-validate/zod` allineati a **`^4.15.1`**. È un breaking change per i consumer che installano Zod.

  - Importa **solo** da `zod` (entry principale v4): vietato `zod/v3`.
  - La catena deprecata `z.string().email('...')` va sostituita con `z.email('...')` oppure `z.string().check(z.email('...'))`; gli schemi del design system (Input, Autocomplete) sono già migrati.
  - Nei `.refine()` il messaggio va passato con `error: '...'` (non `message`, deprecato in v4), mantenendo `path: ['campo']` per il target.
  - `@vee-validate/zod@4.15.1` dichiara peer `zod ^3.24.0`: il warning peer di pnpm è atteso, l'adapter funziona con gli schemi v4 tramite la compat `ZodFirstPartyTypeKind`/`_def`.

  Setup consumer:

  ```bash
  pnpm add zod@^4.6.5 vee-validate@^4.15.1 @vee-validate/zod@^4.15.1
  ```

## 0.3.0

### Minor Changes

- cd6e8b1: Test end-to-end della release pipeline (tag + GitHub Release).
