---
"@ugogalliano/pm-design-system-vue": minor
---

Esportato il Tailwind preset del design system (`/tailwind-preset`) e i soli token CSS (`/tokens.css`). Il bundle `dist/style.css` (ora alias di `tokens.css`) non contiene più le utility Tailwind: i progetti consumer devono usare il preset nel proprio `tailwind.config` così che le utility vengano generate dal loro build con il tema del design system.

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
