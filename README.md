# Portfolio — Joel G. Stadelman

Portfolio personal estilo terminal/OS (inspirado en el diseño de [abdulmomin.dev](https://www.abdulmomin.dev)),
con datos e información obtenidos en vivo desde GitHub: [@HellooImJoel](https://github.com/HellooImJoel).

## 🖥️ Stack del sitio

- HTML5 + CSS3 + JavaScript vanilla (sin build, sin dependencias)
- Fuentes: JetBrains Mono + Space Grotesk · Iconos: Devicon
- Datos dinámicos: los stars, repositorios y avatar se consultan en tiempo real a la GitHub API
- Tema oscuro por defecto + toggle a tema claro (persistido en `localStorage`)

## 🌐 Publicar en GitHub (repo asignado: `HellooImJoel/portfolio`)

URL del repositorio destino: **https://github.com/HellooImJoel/portfolio**
Sitio una vez publicado: **https://HellooImJoel.github.io/portfolio/**

**Opción A — push con Personal Access Token (recomendada, no requiere instalar nada):**
1. Creá un token con permiso `repo` en:
   https://github.com/settings/tokens/new?scopes=repo&description=portfolio-push
2. Desde la carpeta del proyecto corré:
```bash
git remote add origin https://github.com/HellooImJoel/portfolio.git 2>/dev/null || true
git push "https://HellooImJoel:<TU_TOKEN>@github.com/HellooImJoel/portfolio.git" HEAD:main
```
3. Activá Pages: **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.

**Opción B — GitHub CLI:**
```bash
gh auth login
gh repo create HellooImJoel/portfolio --public --source=. --push
gh api repos/HellooImJoel/portfolio/pages -X POST -f build_type=legacy
```

> ⚠️ Nota: este entorno de trabajo no tiene credenciales de escritura para GitHub configuradas (`gh` no está instalado y no hay token disponible), por lo que el push final debe ejecutarse con tu token (Opción A) o con `gh` autenticado (Opción B). Todo el código ya está commiteado en la rama local y listo para subir sin cambios.

## 🚀 Correr localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## 📄 Estructura

| Archivo      | Descripción                                        |
|--------------|----------------------------------------------------|
| `index.html` | Secciones: Hero, About.system, Skills.json, git log --timeline, ~/projects, ./contact.exe |
| `style.css`  | Tema OS/terminal, animaciones, responsive          |
| `app.js`     | Typewriter, scroll spy, reveal, datos live GitHub, formulario mailto |

© 2026 Joel G. Stadelman
