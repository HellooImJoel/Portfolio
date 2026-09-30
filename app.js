/* ============================================================
   PORTFOLIO — Joel G. Stadelman · app.js
   Live data from the GitHub API + UI interactions.
   ============================================================ */

const GH_USER = "HellooImJoel";

/* ---------- helpers ---------- */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ---------- 1. Typewriter hero ---------- */
(() => {
  const el = $("#typewriter");
  if (!el) return;
  const phrases = [
    "while(alive) { code(); learn(); }",
    "$ sudo build distributed-systems",
    "> producer.send('hello', topic='world')",
    "$ docker compose up --watch",
    "> git commit -m 'always learning'",
  ];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const p = phrases[pi];
    ci += deleting ? -1 : 1;
    el.textContent = p.slice(0, ci);
    let delay = deleting ? 28 : 55;
    if (!deleting && ci === p.length) { delay = 2400; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 500; }
    setTimeout(tick, delay);
  }
  tick();
})();

/* ---------- 2. Navbar: scroll state, active link, burger ---------- */
(() => {
  const nav = $("#navbar");
  const links = $$(".nav-link");
  const sections = links.map(l => document.getElementById(l.dataset.section)).filter(Boolean);

  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });

  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle("active", l.dataset.section === e.target.id));
        $$(".mn-link").forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => spy.observe(s));

  const burger = $("#burger"), menu = $("#navLinks");
  burger?.addEventListener("click", () => menu.classList.toggle("open"));
  menu?.addEventListener("click", e => e.target.tagName === "A" && menu.classList.remove("open"));
})();

/* ---------- 3. Theme toggle (persisted) ---------- */
(() => {
  const btn = $("#themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  btn?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("theme", cur);
  });
})();

/* ---------- 4. Reveal on scroll + skill bars + counters ---------- */
(() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal, .skill-cat").forEach(el => io.observe(el));

  // animated counters
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const target = +e.target.dataset.count;
      const t0 = performance.now(), dur = 1200;
      (function step(t) {
        const k = Math.min((t - t0) / dur, 1);
        e.target.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$(".stat-num[data-count]").forEach(el => cio.observe(el));
})();

/* ---------- 5. Cursor glow ---------- */
(() => {
  const glow = $("#cursorGlow");
  if (!glow || matchMedia("(pointer: coarse)").matches) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop() {
    x += (tx - x) * 0.08; y += (ty - y) * 0.08;
    glow.style.left = x + "px"; glow.style.top = y + "px";
    requestAnimationFrame(loop);
  })();
})();

/* ---------- 6. GitHub live data ---------- */
(async () => {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API " + userRes.status);
    const user = await userRes.json();
    const repos = await reposRes.json();

    // dynamic stats
    const statRepos = $('.stat-num[data-count]');
    if (statRepos) statRepos.dataset.count = user.public_repos ?? repos.length;

    // total stars
    const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);

    // stars per project (map name -> card)
    const byName = Object.fromEntries(repos.map(r => [r.name.toLowerCase(), r]));
    $$(".proj-card").forEach(card => {
      const link = $("a.pc-link", card);
      if (!link) return;
      const m = link.href.match(/github\.com\/[^/]+\/([^/?#]+)/);
      if (!m) return;
      const repo = byName[m[1].toLowerCase()];
      if (!repo) return;
      const starsEl = $(".stars", card);
      if (starsEl) starsEl.textContent = repo.stargazers_count;
      const corner = $(".pc-corner", card);
      if (corner) corner.textContent = (repo.fork ? "Fork" : "Public") + (repo.stargazers_count ? ` ★${repo.stargazers_count}` : "");
    });

    // profile badge with real avatar
    const badge = $(".kernel-badge");
    if (badge && user.avatar_url) {
      const img = document.createElement("img");
      img.src = user.avatar_url + "&s=48";
      img.alt = user.login;
      img.style.cssText = "width:18px;height:18px;border-radius:50%;border:1px solid var(--green)";
      badge.prepend(img);
    }
  } catch (err) {
    console.warn("GitHub API unavailable, using static values:", err.message);
    $$(".stars").forEach(el => (el.textContent = "0"));
  }
})();

/* ---------- 7. Contact form → mailto ---------- */
(() => {
  const form = $("#contactForm");
  form?.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const body =
      `Hi Joel,\n\n` +
      `${d.get("message")}\n\n` +
      `— ${d.get("name")} (${d.get("email")})\n` +
      `_Sent from portfolio (GitHub: @${GH_USER})_`;
    location.href =
      `mailto:?subject=${encodeURIComponent("[Portfolio] " + d.get("subject"))}` +
      `&body=${encodeURIComponent(body)}`;
    const btn = $(".mp-send", form);
    if (btn) { btn.innerHTML = "✓ Your mail client was opened"; setTimeout(() => (btn.innerHTML = "Send Message <span class='mono dim'>↵</span>"), 3000); }
  });
})();

/* ---------- 8. Footer year ---------- */
$("#year") && ($("#year").textContent = new Date().getFullYear());
