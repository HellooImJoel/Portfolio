"use strict";
/* ============================================================
   PORTFOLIO — Joel G. Stadelman · app.ts (TypeScript)
   Live data from the GitHub API + UI interactions.
   Compiled with `tsc` to dist/app.js (plain browser JS, no bundler).
   ============================================================ */
const GH_USER = "HellooImJoel";
/* ---------- typed DOM helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
/** querySelector that throws if the element is missing (for required nodes). */
const must$ = (sel, ctx = document) => {
    const el = $(sel, ctx);
    if (!el)
        throw new Error(`Required element not found: ${sel}`);
    return el;
};
/* ---------- 1. Typewriter hero ---------- */
(() => {
    const el = $("#typewriter");
    if (!el)
        return;
    const phrases = [
        "while(alive) { code(); learn(); }",
        "$ sudo build distributed-systems",
        "> producer.send('hello', topic='world')",
        "$ docker compose up --watch",
        "> git commit -m 'always learning'",
    ];
    let pi = 0;
    let ci = 0;
    let deleting = false;
    function tick() {
        const p = phrases[pi];
        ci += deleting ? -1 : 1;
        el.textContent = p.slice(0, ci);
        let delay = deleting ? 28 : 55;
        if (!deleting && ci === p.length) {
            delay = 2400;
            deleting = true;
        }
        else if (deleting && ci === 0) {
            deleting = false;
            pi = (pi + 1) % phrases.length;
            delay = 500;
        }
        window.setTimeout(tick, delay);
    }
    tick();
})();
/* ---------- 2. Navbar: scroll state, active link, burger ---------- */
(() => {
    const nav = $("#navbar");
    if (!nav)
        return;
    const links = $$(".nav-link");
    const sections = links
        .map((l) => l.dataset.section ? document.getElementById(l.dataset.section) : null)
        .filter((s) => s !== null);
    addEventListener("scroll", () => {
        nav.classList.toggle("border-line", scrollY > 30);
    }, { passive: true });
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting)
                return;
            links.forEach((l) => {
                l.classList.toggle("text-accent2", l.dataset.section === e.target.id);
                l.classList.toggle("bg-accent/10", l.dataset.section === e.target.id);
            });
            $$(".mn-link").forEach((l) => {
                l.classList.toggle("text-accent2", l.getAttribute("href") === `#${e.target.id}`);
            });
        });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => spy.observe(s));
    const burger = $("#burger");
    const menu = $("#navLinks");
    burger?.addEventListener("click", () => {
        menu?.classList.toggle("open");
    });
    menu?.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            menu.classList.remove("open");
        }
    });
})();
/* ---------- 3. Theme toggle (persisted in localStorage) ---------- */
(() => {
    const btn = $("#themeToggle");
    const saved = localStorage.getItem("theme");
    if (saved)
        document.documentElement.setAttribute("data-theme", saved);
    btn?.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", cur);
        localStorage.setItem("theme", cur);
    });
})();
/* ---------- 4. Reveal on scroll + animated counters ---------- */
(() => {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("is-visible");
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
    // animated counters (stat numbers)
    const cio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            const target = entry.target;
            cio.unobserve(target);
            const finalValue = Number(target.dataset.count ?? 0);
            const t0 = performance.now();
            const dur = 1200;
            const step = (t) => {
                const k = Math.min((t - t0) / dur, 1);
                target.textContent = String(Math.round(finalValue * (1 - Math.pow(1 - k, 3))));
                if (k < 1)
                    requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    $$(".stat-num[data-count]").forEach((el) => cio.observe(el));
    // skill bars grow when their card becomes visible
    const bio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting)
                return;
            e.target.classList.add("is-visible");
            bio.unobserve(e.target);
        });
    }, { threshold: 0.25 });
    $$(".skill-cat").forEach((el) => bio.observe(el));
})();
/* ---------- 5. Cursor glow (desktop only) ---------- */
(() => {
    const glow = $("#cursorGlow");
    if (!glow || matchMedia("(pointer: coarse)").matches) {
        if (glow)
            glow.style.display = "none";
        return;
    }
    let tx = 0, ty = 0, x = 0, y = 0;
    addEventListener("mousemove", (e) => {
        tx = e.clientX;
        ty = e.clientY;
    }, { passive: true });
    const loop = () => {
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
})();
/* ---------- 6. GitHub live data ---------- */
(async () => {
    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GH_USER}`),
            fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`),
        ]);
        if (!userRes.ok || !reposRes.ok)
            throw new Error(`GitHub API ${userRes.status}`);
        const user = await userRes.json();
        const repos = await reposRes.json();
        // dynamic repository count
        const statRepos = $(".stat-num[data-count]");
        if (statRepos)
            statRepos.dataset.count = String(user.public_repos ?? repos.length);
        // stars / forks per project card (map repo name -> card)
        const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
        $$(".proj-card").forEach((card) => {
            const link = $("a.pc-link", card);
            if (!link?.href)
                return;
            const m = link.href.match(/github\.com\/[^/]+\/([^/?#]+)/);
            if (!m)
                return;
            const repo = byName.get(m[1].toLowerCase());
            if (!repo)
                return;
            const starsEl = $(".stars", card);
            if (starsEl)
                starsEl.textContent = String(repo.stargazers_count);
            const corner = $(".pc-corner", card);
            if (corner) {
                corner.textContent = `${repo.fork ? "Fork" : "Public"}${repo.stargazers_count ? ` ★${repo.stargazers_count}` : ""}`;
            }
        });
        // profile badge with real avatar
        const badge = $(".kernel-badge");
        if (badge && user.avatar_url) {
            const img = document.createElement("img");
            img.src = `${user.avatar_url}&s=48`;
            img.alt = user.login;
            img.className = "w-[18px] h-[18px] rounded-full border border-okc inline-block mr-1.5";
            badge.prepend(img);
        }
    }
    catch (err) {
        console.warn("GitHub API unavailable, using static values:", err.message);
        $$(".stars").forEach((el) => { el.textContent = "0"; });
    }
})();
/* ---------- 7. Contact form → mailto ---------- */
(() => {
    const form = $("#contactForm");
    if (!form)
        return;
    const sendBtn = must$("button.mp-send", form);
    const originalHtml = sendBtn.innerHTML;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const d = new FormData(form);
        const value = (k) => String(d.get(k) ?? "");
        const body = `Hi Joel,\n\n` +
            `${value("message")}\n\n` +
            `— ${value("name")} (${value("email")})\n` +
            `_Sent from portfolio (GitHub: @${GH_USER})_`;
        location.href =
            `mailto:?subject=${encodeURIComponent(`[Portfolio] ${value("subject")}`)}` +
                `&body=${encodeURIComponent(body)}`;
        sendBtn.innerHTML = "✓ Your mail client was opened";
        window.setTimeout(() => { sendBtn.innerHTML = originalHtml; }, 3000);
    });
})();
/* ---------- 8. Footer year ---------- */
(() => {
    const year = $("#year");
    if (year)
        year.textContent = String(new Date().getFullYear());
})();
