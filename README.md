# Portfolio — Joel G. Stadelman

Personal terminal/OS-style portfolio (design inspired by [abdulmomin.dev](https://www.abdulmomin.dev)),
with information and projects pulled live from GitHub: [@HellooImJoel](https://github.com/HellooImJoel).

> The site is fully in English (`lang="en"`).

## 🖥️ Site stack

- HTML5 + CSS3 + vanilla JavaScript (no build step, no dependencies)
- Fonts: JetBrains Mono + Space Grotesk · Icons: Devicon
- Live data: stars, repositories and avatar are fetched in real time from the GitHub API
- Dark theme by default + light theme toggle (persisted in `localStorage`)

## 🌐 Published on GitHub

Repository: **https://github.com/HellooImJoel/Portfolio**
Live site: **https://hellooimjoel.github.io/Portfolio/**

To deploy updates:

```bash
git push origin main
```

GitHub Pages is already enabled for the `main` branch (root source), so pushes publish automatically.

## 🚀 Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## 📄 Structure

| File         | Description                                          |
|--------------|------------------------------------------------------|
| `index.html` | Sections: Hero, About.system, Skills.json, git log --timeline, ~/projects, ./contact.exe |
| `style.css`  | OS/terminal theme, animations, responsive layout     |
| `app.js`     | Typewriter, scroll spy, reveal, live GitHub data, mailto form |

© 2026 Joel G. Stadelman
