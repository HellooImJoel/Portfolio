# Portfolio — Joel G. Stadelman

Portfolio personal estilo terminal/OS (inspirado en el diseño de [abdulmomin.dev](https://www.abdulmomin.dev)),
con datos e información obtenidos en vivo desde GitHub: [@HellooImJoel](https://github.com/HellooImJoel).

## 🖥️ Stack del sitio

- HTML5 + CSS3 + JavaScript vanilla (sin build, sin dependencias)
- Fuentes: JetBrains Mono + Space Grotesk · Iconos: Devicon
- Datos dinámicos: los stars, repositorios y avatar se consultan en tiempo real a la GitHub API
- Tema oscuro por defecto + toggle a tema claro (persistido en `localStorage`)

## 🚀 Correr localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

O simplemente publicar en **GitHub Pages** (repo → Settings → Pages → branch `main` / root).

## 📄 Estructura

| Archivo      | Descripción                                        |
|--------------|----------------------------------------------------|
| `index.html` | Secciones: Hero, About.system, Skills.json, git log --timeline, ~/projects, ./contact.exe |
| `style.css`  | Tema OS/terminal, animaciones, responsive          |
| `app.js`     | Typewriter, scroll spy, reveal, datos live GitHub, formulario mailto |

© 2026 Joel G. Stadelman
