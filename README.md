# @ugogalliano/pm-design-system-vue 🎨

Vue 3 (Composition API, `<script setup>`) + TypeScript Design System for Project
Management applications. 🚀

## Stack

| Layer | Technology |
|-------|------------|
| UI primitives | Reka UI (resolved 2.10.5) |
| Styling | Tailwind CSS + CSS variables in `src/tokens/` (`darkMode: ['class']`) |
| Forms | Vee-Validate >= 4.15.1 + Zod 4 (>= 4.6.5) |
| Testing | Vitest + @vue/test-utils (jsdom) |
| Docs/showcase | Storybook 8 (CSF3) |
| Build | Vite library mode + vite-plugin-dts, CSS precompiled into `dist/tokens.css` |

Requirements: Node >= 20, pnpm 10 (`packageManager` in `package.json`). ⚙️

## Setup

```bash
pnpm install          # activates Husky hooks via "prepare"
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run typecheck` | Typecheck (`vue-tsc --noEmit`) |
| `pnpm run test` | One-off test run (`vitest run`); `test:watch` in watch mode |
| `pnpm run lint` | ESLint with `--fix` |
| `pnpm run format` | Prettier on `src/` and `tests/` |
| `pnpm run build` | Typecheck + library build (`dist/`) |
| `pnpm run storybook` | Storybook on `localhost:6006` |
| `pnpm run build-storybook` | Static Storybook build |

### Minimum checks before every delivery ✅

```bash
pnpm exec vue-tsc --noEmit
pnpm exec vitest run
pnpm exec eslint .
pnpm run build
```

## Structure

```
src/
  components/
    ui/            Button, Badge (primitives)
    form/          Input, Checkbox, RadioGroup, Autocomplete
    feedback/      Dialog, Toast/Toaster
    data-display/  (in progress)
    navigation/    (in progress)
    layout/        (in progress)
  composables/     useToast (singleton store)
  lib/utils.ts     cn() and variants()
  tokens/          variables.css (semantic tokens + dark theme), index.css
  index.ts         public barrel (explicit exports)
tests/             jsdom setup and shared test-utils
tailwind.preset.mjs  Tailwind preset shipped with the package
```

## Consumer usage

### 1. Installation 📦

The package lives on GitHub Packages, so you have to add .npmrc file:

```npmrc
@ugogalliano:registry=https://npm.pkg.github.com
```

```bash
pnpm add @ugogalliano/pm-design-system-vue
# peers: vue, reka-ui, vee-validate, zod, @vee-validate/zod
```

### 2. Tailwind 🌬️

The preset exposes the tokens (colors, radius, fonts) and scans `dist/` for the
utilities used by the components:

```js
// tailwind.config.js
import preset from '@ugogalliano/pm-design-system-vue/tailwind-preset'

export default {
  presets: [preset],
  content: ['./src/**/*.{vue,ts,tsx}'],
}
```

For dark mode, add the `dark` class on `<html>`.

### 3. CSS 💅

```ts
import '@ugogalliano/pm-design-system-vue/style.css'
```

(emits the tokens + all utilities; no extra Tailwind config is required for the
components' internal classes).

### 4. Components 🧩

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Badge, Button, Dialog, Toaster, useToast } from '@ugogalliano/pm-design-system-vue'

const open = ref(false)
const { toast } = useToast()

function save() {
  open.value = false
  toast({ title: 'Saved', message: 'Your changes have been applied.', variant: 'success' })
}
</script>

<template>
  <Badge variant="owner">Owner</Badge>
  <Badge variant="editor">Editor</Badge>
  <Badge variant="viewer">Viewer</Badge>

  <Dialog v-model:open="open" title="Settings" description="Edit the board.">
    <p>Default slot content.</p>
    <template #footer>
      <Button variant="ghost" @click="open = false">Cancel</Button>
      <Button @click="save">Save</Button>
    </template>
  </Dialog>

  <!-- mount once in the app -->
  <Toaster />
</template>
```

## Git and commits 🌿

- Husky v9: `pre-commit` (lint-staged), `commit-msg` (commitlint),
  `pre-push` (typecheck).
- Message format: `[Type] Description` with types from `type-enum`
  (`Bootstrap`, `Feature`, `Fix`, `Refactor`, `Design System`, `Release`,
  `Docs`, `Test`, `Chore`, `Perf`).

## Release 🚢

1. `pnpm run changeset` — describe the change.
2. `pnpm run version-packages` — bump the version + update `CHANGELOG.md`.
3. `pnpm ci:publish` — publish to GitHub Packages (the `prepublishOnly` script
   runs the build).


