/* ============================================================
   PORTFOLIO — Joel G. Stadelman · app.ts (TypeScript)
   Live data from the GitHub API + UI interactions.
   Compiled with `tsc` to dist/app.js (plain browser JS, no bundler).
   ============================================================ */

const GH_USER = "HellooImJoel";

/* ---------- typed DOM helpers ---------- */
const $ = <T extends Element = HTMLElement>(sel: string, ctx: ParentNode = document): T | null =>
  ctx.querySelector<T>(sel);

const $$ = <T extends Element = HTMLElement>(sel: string, ctx: ParentNode = document): T[] =>
  Array.from(ctx.querySelectorAll<T>(sel));

/** querySelector that throws if the element is missing (for required nodes). */
const must$ = <T extends Element = HTMLElement>(sel: string, ctx: ParentNode = document): T => {
  const el = $(sel, ctx);
  if (!el) throw new Error(`Required element not found: ${sel}`);
  return el as unknown as T;
};

/* ---------- shared types ---------- */
interface GitHubUser {
  login: string;
  public_repos: number;
  avatar_url: string;
}

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  fork: boolean;
}

/* ---------- 1. Typewriter hero ---------- */
(() => {
  const el = $<HTMLElement>("#typewriter");
  if (!el) return;
  const phrases: string[] = [
    "while(alive) { code(); learn(); }",
    "$ sudo build distributed-systems",
    "> producer.send('hello', topic='world')",
    "$ docker compose up --watch",
    "> git commit -m 'always learning'",
  ];
  let pi = 0;
  let ci = 0;
  let deleting = false;

  function tick(): void {
    const p: string = phrases[pi];
    ci += deleting ? -1 : 1;
    el!.textContent = p.slice(0, ci);
    let delay: number = deleting ? 28 : 55;
    if (!deleting && ci === p.length) {
      delay = 2400;
      deleting = true;
    } else if (deleting && ci === 0) {
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
  const nav = $<HTMLElement>("#navbar");
  if (!nav) return;
  const links = $$<HTMLAnchorElement>(".nav-link");
  const sections: HTMLElement[] = links
    .map((l: HTMLAnchorElement): HTMLElement | null =>
      l.dataset.section ? document.getElementById(l.dataset.section) : null,
    )
    .filter((s): s is HTMLElement => s !== null);

  addEventListener("scroll", (): void => {
    nav.classList.toggle("border-line", scrollY > 30);
  }, { passive: true });

  const spy: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
    entries.forEach((e: IntersectionObserverEntry): void => {
      if (!e.isIntersecting) return;
      links.forEach((l: HTMLAnchorElement): void => {
        l.classList.toggle("text-accent2", l.dataset.section === e.target.id);
        l.classList.toggle("bg-accent/10", l.dataset.section === e.target.id);
      });
      $$<HTMLAnchorElement>(".mn-link").forEach((l: HTMLAnchorElement): void => {
        l.classList.toggle("text-accent2", l.getAttribute("href") === `#${e.target.id}`);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach((s: HTMLElement): void => spy.observe(s));

  const burger = $<HTMLButtonElement>("#burger");
  const menu = $<HTMLElement>("#navLinks");
  burger?.addEventListener("click", (): void => {
    menu?.classList.toggle("open");
  });
  menu?.addEventListener("click", (e: Event): void => {
    if ((e.target as HTMLElement).tagName === "A") {
      menu.classList.remove("open");
    }
  });
})();

/* ---------- 3. Theme toggle (persisted in localStorage) ---------- */
(() => {
  type Theme = "dark" | "light";
  const btn = $<HTMLButtonElement>("#themeToggle");
  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  btn?.addEventListener("click", (): void => {
    const cur: Theme =
      document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("theme", cur);
  });
})();

/* ---------- 4. Reveal on scroll + animated counters ---------- */
(() => {
  const io: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
    entries.forEach((e: IntersectionObserverEntry): void => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  $$<HTMLElement>(".reveal").forEach((el: HTMLElement): void => io.observe(el));

  // animated counters (stat numbers)
  const cio: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
    entries.forEach((entry: IntersectionObserverEntry): void => {
      if (!entry.isIntersecting) return;
      const target = entry.target as HTMLElement;
      cio.unobserve(target);
      const finalValue: number = Number(target.dataset.count ?? 0);
      const t0: number = performance.now();
      const dur: number = 1200;
      const step = (t: number): void => {
        const k: number = Math.min((t - t0) / dur, 1);
        target.textContent = String(Math.round(finalValue * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$<HTMLElement>(".stat-num[data-count]").forEach((el: HTMLElement): void => cio.observe(el));

  // skill bars grow when their card becomes visible
  const bio: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
    entries.forEach((e: IntersectionObserverEntry): void => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      bio.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  $$<HTMLElement>(".skill-cat").forEach((el: HTMLElement): void => bio.observe(el));
})();

/* ---------- 5. Cursor glow (desktop only) ---------- */
(() => {
  const glow = $<HTMLElement>("#cursorGlow");
  if (!glow || matchMedia("(pointer: coarse)").matches) {
    if (glow) glow.style.display = "none";
    return;
  }
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener("mousemove", (e: MouseEvent): void => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });
  const loop = (): void => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    glow!.style.left = `${x}px`;
    glow!.style.top = `${y}px`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

/* ---------- 6. GitHub live data ---------- */
(async (): Promise<void> => {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error(`GitHub API ${userRes.status}`);
    const user: GitHubUser = await userRes.json() as GitHubUser;
    const repos: GitHubRepo[] = await reposRes.json() as GitHubRepo[];

    // dynamic repository count
    const statRepos = $<HTMLElement>(".stat-num[data-count]");
    if (statRepos) statRepos.dataset.count = String(user.public_repos ?? repos.length);

    // stars / forks per project card (map repo name -> card)
    const byName: Map<string, GitHubRepo> = new Map(
      repos.map((r: GitHubRepo): [string, GitHubRepo] => [r.name.toLowerCase(), r]),
    );
    $$<HTMLElement>(".proj-card").forEach((card: HTMLElement): void => {
      const link = $<HTMLAnchorElement>("a.pc-link", card);
      if (!link?.href) return;
      const m: RegExpMatchArray | null = link.href.match(/github\.com\/[^/]+\/([^/?#]+)/);
      if (!m) return;
      const repo: GitHubRepo | undefined = byName.get(m[1].toLowerCase());
      if (!repo) return;
      const starsEl = $<HTMLElement>(".stars", card);
      if (starsEl) starsEl.textContent = String(repo.stargazers_count);
      const corner = $<HTMLElement>(".pc-corner", card);
      if (corner) {
        corner.textContent = `${repo.fork ? "Fork" : "Public"}${repo.stargazers_count ? ` ★${repo.stargazers_count}` : ""}`;
      }
    });

    // profile badge with real avatar
    const badge = $<HTMLElement>(".kernel-badge");
    if (badge && user.avatar_url) {
      const img: HTMLImageElement = document.createElement("img");
      img.src = `${user.avatar_url}&s=48`;
      img.alt = user.login;
      img.className = "w-[18px] h-[18px] rounded-full border border-okc inline-block mr-1.5";
      badge.prepend(img);
    }
  } catch (err) {
    console.warn("GitHub API unavailable, using static values:", (err as Error).message);
    $$<HTMLElement>(".stars").forEach((el: HTMLElement): void => { el.textContent = "0"; });
  }
})();

/* ---------- 7. Contact form → mailto ---------- */
(() => {
  const form = $<HTMLFormElement>("#contactForm");
  if (!form) return;
  const sendBtn = must$<HTMLButtonElement>("button.mp-send", form);
  const originalHtml: string = sendBtn.innerHTML;

  form.addEventListener("submit", (e: SubmitEvent): void => {
    e.preventDefault();
    const d: FormData = new FormData(form);
    const value = (k: string): string => String(d.get(k) ?? "");
    const body: string =
      `Hi Joel,\n\n` +
      `${value("message")}\n\n` +
      `— ${value("name")} (${value("email")})\n` +
      `_Sent from portfolio (GitHub: @${GH_USER})_`;
    location.href =
      `mailto:?subject=${encodeURIComponent(`[Portfolio] ${value("subject")}`)}` +
      `&body=${encodeURIComponent(body)}`;
    sendBtn.innerHTML = "✓ Your mail client was opened";
    window.setTimeout((): void => { sendBtn.innerHTML = originalHtml; }, 3000);
  });
})();

/* ---------- 8. Footer year ---------- */
(() => {
  const year = $<HTMLElement>("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
