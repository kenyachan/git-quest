# Git Quest

A video-game-style tutorial for refreshing your Git skills. You work through 9 levels of hands-on objectives in your own terminal, ticking each one off as you go to earn XP, unlock the next level and fight two boss levels.

## Getting started

Requires [Node.js](https://nodejs.org/) 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173). The page reloads automatically when you edit files.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with live reload |
| `npm run build` | Build a production version into `dist/` |
| `npm run preview` | Serve the built `dist/` folder locally |

## Project structure

```
index.html          Page markup (HUD, title screen, credits, dialogs)
src/
├── main.js         Entry point: renders levels, the level map and HUD
├── levels.js       Quest content: every level, step, command and hint
├── progress.js     Saved progress, XP, ranks and level unlocking
├── ui.js           Toasts, the reset dialog and copy-to-clipboard
└── styles/
    └── style.css   All styles
```

## Editing the quest

All content lives in `src/levels.js`. Each level looks like this:

```js
{
  icon: '🌳',
  name: 'Branching Paths',
  intro: 'Shown under the level heading (HTML allowed).',
  boss: true,               // optional: red boss styling
  steps: [
    {
      t: 'Step title',
      d: 'Description (HTML allowed)',
      c: 'git command\nanother command',  // HTML-escape < and > as &lt; &gt;
      e: 'What you should see (HTML allowed)',
      xp: 25,               // optional, defaults to 10
    },
  ],
}
```

Progress is saved in the browser's localStorage, keyed by each step's position. If you insert or reorder steps, previously saved ticks may land on the wrong steps, so press **RESET** after big changes.
