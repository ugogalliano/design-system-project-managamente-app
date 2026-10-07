---
'@ugogalliano/pm-design-system-vue': minor
---

Nuovi componenti pubblici e nuova emissione CSS.

- **UI**: `Button` e `Badge` (Badge con varianti `owner` / `editor` / `viewer`).
- **Feedback**: `Dialog` (chiusura con Escape e backdrop-click, disattivabile con `dismissable`) e lo stack toast `Toast` / `Toaster` / `useToast` (auto-dismiss configurabile, animazioni di ingresso/uscita, swipe-to-dismiss, `prefers-reduced-motion` rispettato).
- **Barrel**: `src/index.ts` ora esporta `Dialog`, `Button`, `Badge`, `Toast`, `Toaster`, `useToast` e i tipi `ToastInput`, `ToastItem`, `ToastVariant`.
- **CSS**: `src/index.ts` importa `src/tokens/index.css`, così la build della libreria emette il foglio di stile compilato (`dist/tokens.css`, esposto sia come `/tokens.css` sia come `/style.css`) con i token semantici (inclusi tema scuro, token `success`/`warning`/`info` e il nuovo `--overlay`) e le utility Tailwind usate dai componenti. Nessuna configurazione Tailwind aggiuntiva è richiesta al consumer per le classi interne dei componenti.
