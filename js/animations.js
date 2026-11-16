/* ============================================================
   ANIMASI UI — tombol kurangi animasi, navigasi, efek explode-view saat scroll,
   dan kabel LAN yang menjalar di sisi kiri halaman.
   ============================================================ */
(function () {
  "use strict";
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* diabaikan */ } }
  };

  /* ---------- Pengaturan gerak ---------- */
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionBtn = $("motion-toggle");
  function setMotion(mode, persist) {
    root.dataset.motion = mode;
    motionBtn.setAttribute("aria-pressed", String(mode === "reduce"));
    motionBtn.title = mode === "reduce" ? "Enable animations" : "Reduce motion";
    if (persist) store.set("motion", mode);
    window.dispatchEvent(new Event("motionchange"));
  }
  setMotion(store.get("motion") || (prefersReduce ? "reduce" : "full"), false);
  motionBtn.addEventListener("click", () => setMotion(root.dataset.motion === "reduce" ? "full" : "reduce", true));

  /* ---------- Mode ringan untuk HP / layar sentuh ---------- */
  const lite = window.matchMedia("(pointer: coarse)").matches;
  if (lite) root.classList.add("lite");

  // Hero memenuhi layar pertama pada layar potret (HP), tanpa bergantung pada satuan vh
  const hero = $("hero");
  let heroW = 0;
  function fitHero() {
    if (window.innerWidth === heroW) return;
    heroW = window.innerWidth;
    hero.style.minHeight = window.innerHeight > window.innerWidth ? window.innerHeight + "px" : "";
  }
  fitHero();

  /* ---------- Explode view: elemen berserakan, lalu menyatu saat di-scroll ---------- */
  const xps = [...document.querySelectorAll(".xp")];
  const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
  const clamp = (v) => Math.max(0, Math.min(1, v));
  let tops = [], lastP = [];
  const docTop = (el) => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
  function seedExplode() {
    const m = window.innerWidth < 820 ? 0.28 : 1;
    xps.forEach((el, i) => {
      const side = rnd(i, 1) > 0.5 ? 1 : -1;
      el.style.setProperty("--ox", (side * (120 + rnd(i, 2) * 260) * m).toFixed(0) + "px");
      el.style.setProperty("--oy", (110 + rnd(i, 3) * 190).toFixed(0) + "px");
      el.style.setProperty("--or", ((rnd(i, 4) * 2 - 1) * 15).toFixed(1) + "deg");
    });
    tops = xps.map(docTop);
    lastP = xps.map(() => -1);
  }
  // p dikejar pelan-pelan (bukan langsung mengikuti scroll), jadi tetap terlihat walau scroll cepat
  let target = [], cur = [], xRaf = 0, xLast = 0;

  // HP: efek menyatu dijalankan sekali per elemen (transisi CSS) saat elemen naik di layar.
  // Semua elemen terlihat secara default; baru disembunyikan (class "armed") setelah pemantau siap.
  if (lite && "IntersectionObserver" in window) {
    const order = new Map(xps.map((el, i) => [el, i]));
    const show = (el) => {
      if (el.classList.contains("in")) return;
      el.style.transitionDelay = ((order.get(el) % 3) * 0.14).toFixed(2) + "s"; // jeda kecil antar kartu
      el.classList.add("in");
    };
    // elemen baru menyatu setelah naik sampai ~65% tinggi layar, jadi bagian bawah layar tetap berantakan
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -35% 0px", threshold: 0 });
    xps.forEach((el) => io.observe(el));
    root.classList.add("armed");
    // di dasar halaman: semua elemen yang tersisa (Contact) tetap dimunculkan
    window.addEventListener("scroll", () => {
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80) xps.forEach(show);
    }, { passive: true });
  }

  function explode() {
    if (lite) return;
    const reduce = root.dataset.motion === "reduce";
    const vh = window.innerHeight, sy = window.scrollY;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    xps.forEach((el, i) => {
      let p = 1;
      if (!reduce) {
        const lag = (i % 3) * 46;
        // elemen di dasar halaman tidak bisa naik sampai tengah layar: garis selesai disesuaikan
        const rest = tops[i] - maxScroll;
        const finish = Math.max(vh * 0.45, rest + 110);
        const range = Math.max(60, vh * 0.98 - finish);
        const t = clamp((vh * 0.98 - (tops[i] - sy) - lag) / range);
        p = t * t * (3 - 2 * t);
      }
      target[i] = p;
      if (reduce) cur[i] = p;
    });
    if (reduce) { paintExplode(true); return; }
    if (!xRaf) { xLast = performance.now(); xRaf = requestAnimationFrame(stepExplode); }
  }
  function stepExplode(t) {
    xRaf = 0;
    const k = 1 - Math.pow(1 - 0.045, Math.min(64, t - xLast) / 16.67);
    xLast = t;
    let busy = false;
    xps.forEach((el, i) => {
      if (cur[i] == null) cur[i] = target[i];
      const d = target[i] - cur[i];
      if (Math.abs(d) > 0.002) { cur[i] += d * k; busy = true; } else cur[i] = target[i];
    });
    paintExplode(false);
    if (busy) xRaf = requestAnimationFrame(stepExplode);
  }
  function paintExplode(force) {
    xps.forEach((el, i) => {
      const p = cur[i] == null ? 1 : cur[i];
      if (force || Math.abs(p - lastP[i]) > 0.002) { lastP[i] = p; el.style.setProperty("--p", p.toFixed(3)); }
    });
  }
  window.addEventListener("motionchange", () => { lastP = xps.map(() => -1); explode(); });

  /* ---------- Navigasi ---------- */
  const links = $("nav-links"), menuBtn = $("menu-btn");
  const anchors = [...links.querySelectorAll("a")];
  const sections = anchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- Kabel LAN menjalar mengikuti scroll ---------- */
  const lan = $("lan"), cable = $("lan-cable"), shadow = $("lan-shadow"), pulse = $("lan-pulse");
  const plug = $("lan-plug"), clip = $("lan-clip-rect");
  let total = 0, docH = 0;

  function buildCable() {
    docH = document.documentElement.scrollHeight;
    lan.setAttribute("height", docH);
    lan.style.height = docH + "px";
    const x = 34, step = 520;
    let d = `M ${x} -20 L ${x} 60`;
    let y = 60, dir = 1;
    while (y < docH) {
      const y2 = y + step;
      d += ` C ${x + 26 * dir} ${y + step * 0.3}, ${x - 26 * dir} ${y + step * 0.7}, ${x} ${y2}`;
      y = y2; dir *= -1;
    }
    [cable, shadow, pulse].forEach((p) => p.setAttribute("d", d));
    total = cable.getTotalLength();
    cable.style.strokeDasharray = total;
    shadow.style.strokeDasharray = total;
  }

  let ticking = false;
  function onScroll() {
    ticking = false;
    const sy = window.scrollY;
    explode();

    // section aktif
    let active = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) active = s; });
    anchors.forEach((a) => a.classList.toggle("active", !!active && a.getAttribute("href") === "#" + active.id));

    // kabel: panjang tampak mengikuti posisi bawah layar
    if (total && getComputedStyle(lan).display !== "none") {
      const max = Math.max(1, docH - window.innerHeight);
      const target = Math.min(1, (sy + window.innerHeight * 0.55) / (max + window.innerHeight * 0.55));
      const shown = total * target;
      cable.style.strokeDashoffset = total - shown;
      shadow.style.strokeDashoffset = total - shown;
      const pt = cable.getPointAtLength(shown);
      const pt2 = cable.getPointAtLength(Math.min(total, shown + 2));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI - 90;
      plug.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${ang})`);
      clip.setAttribute("height", pt.y);
    }
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { fitHero(); seedExplode(); buildCable(); request(); });
  window.addEventListener("load", () => { seedExplode(); buildCable(); onScroll(); });

  // Denyut data pada kabel
  let off = 0, last = 0;
  (function tick(t) {
    if (!lite && root.dataset.motion !== "reduce" && t - last > 33) {
      off -= 1.8; last = t;
      pulse.style.strokeDashoffset = off;
    }
    requestAnimationFrame(tick);
  })(0);

  seedExplode();
  buildCable();
  onScroll();
  // dokumen bisa berubah tinggi saat gambar/font selesai dimuat
  if ("ResizeObserver" in window) new ResizeObserver(() => { tops = xps.map(docTop); if (document.documentElement.scrollHeight !== docH) buildCable(); request(); }).observe(document.body);

  // --- DIAGNOSIS SEMENTARA: hapus blok ini setelah masalah ketemu ---
  const dbg = document.createElement("div");
  dbg.style.cssText = "position:fixed;left:20px;bottom:20px;z-index:99;padding:10px 18px;background:rgba(0,0,0,.85);color:#6f6;font:36px monospace;border-radius:12px";
  const upd = () => { dbg.textContent = "v3 lite=" + lite + " motion=" + root.dataset.motion + " armed=" + root.classList.contains("armed"); };
  upd();
  window.addEventListener("motionchange", upd);
  document.body.appendChild(dbg);
})();