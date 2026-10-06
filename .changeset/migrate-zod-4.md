---
"@ugogalliano/pm-design-system-vue": minor
---

Migrazione a **Zod 4**: i peer `zod` e le dipendenze form passano da `^3.23.0` a **`^4.6.5`**, con `vee-validate` e `@vee-validate/zod` allineati a **`^4.15.1`**. È un breaking change per i consumer che installano Zod.

- Importa **solo** da `zod` (entry principale v4): vietato `zod/v3`.
- La catena deprecata `z.string().email('...')` va sostituita con `z.email('...')` oppure `z.string().check(z.email('...'))`; gli schemi del design system (Input, Autocomplete) sono già migrati.
- Nei `.refine()` il messaggio va passato con `error: '...'` (non `message`, deprecato in v4), mantenendo `path: ['campo']` per il target.
- `@vee-validate/zod@4.15.1` dichiara peer `zod ^3.24.0`: il warning peer di pnpm è atteso, l'adapter funziona con gli schemi v4 tramite la compat `ZodFirstPartyTypeKind`/`_def`.

Setup consumer:

```bash
pnpm add zod@^4.6.5 vee-validate@^4.15.1 @vee-validate/zod@^4.15.1
```
