/* ============================================================
   RENDER — membuat isi halaman dari folder /data,
   termasuk slider foto yang bisa digeser dan lightbox.
   Biasanya file ini tidak perlu diubah.
   ============================================================ */
(function () {
  "use strict";
  const D = window.DATA || {};
  const P = D.profile || {};
  // Jika elemen tidak ditemukan, kembalikan elemen kosong agar tidak error
  const $ = (id) => document.getElementById(id) || document.createElement("div");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (n) => (n || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  /* ---------- Slider foto ---------- */
  const PLACEHOLDER =
    '<figure class="slide nosignal"><div class="bars"></div><b>NO SIGNAL</b><small>add photo</small></figure>';

  function slider(photos, opts) {
    opts = opts || {};
    const list = (photos || []).map((p) => (typeof p === "string" ? { src: p, caption: "" } : p));
    const slides = list.length
      ? list.map((p) => `<figure class="slide"><img src="${esc(p.src)}" alt="${esc(p.caption || "")}" draggable="false" loading="lazy">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}</figure>`).join("")
      : PLACEHOLDER;
    const multi = list.length > 1;
    return `
      <div class="slider ${opts.contain ? "contain" : ""}" data-count="${list.length}" style="--ratio:${opts.ratio || "16 / 10"}">
        <div class="track">${slides}</div>
        ${multi ? `<button class="s-btn s-prev" type="button" aria-label="Previous photo">‹</button><button class="s-btn s-next" type="button" aria-label="Next photo">›</button>
        <div class="dots">${list.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>
        <span class="count">1/${list.length}</span>` : ""}
      </div>`;
  }

  /* ---------- Container skill berbentuk perangkat ---------- */
  const ICON = { router: "fa-tower-broadcast", switch: "fa-network-wired", rack: "fa-server", firewall: "fa-shield-halved", browser: "fa-code", cpu: "fa-microchip" };
  function deviceOf(title, i) {
    const t = String(title || "").toLowerCase();
    if (/mikrotik/.test(t)) return "router";
    if (/cisco|simulasi|simulation|switch/.test(t)) return "switch";
    if (/routing|route/.test(t)) return "rack";
    if (/vlan|firewall|security|keamanan/.test(t)) return "firewall";
    if (/web|database|code|program/.test(t)) return "browser";
    if (/hardware|pc|cpu|perakitan/.test(t)) return "cpu";
    return ["router", "switch", "rack", "firewall", "browser", "cpu"][i % 6];
  }
  const many = (n, cls, on) => Array.from({ length: n }, (_, k) => `<i class="${on && on(k) ? "on" : ""}"></i>`).join("");
  function devBar(kind, label) {
    if (kind === "browser")
      return `<div class="dev-bar"><span class="dots3"><i></i><i></i><i></i></span><b>${esc(label)}</b><i class="fa-solid ${ICON[kind]}"></i></div>`;
    return `<div class="dev-bar"><b><i class="fa-solid ${ICON[kind]}"></i>${esc(label)}</b><span class="dev-leds"><i></i><i></i><i></i></span></div>`;
  }
  function devFoot(kind, n) {
    if (kind === "router") return `<div class="dev-foot"><span class="dev-ports r5">${many(5, "", (k) => k === 0 || (n >> k) & 1)}</span></div>`;
    if (kind === "switch") return `<div class="dev-foot"><span class="dev-ports r24">${many(24, "", (k) => (k * 7 + n) % 5 < 3)}</span></div>`;
    if (kind === "rack") return `<div class="dev-foot"><span class="bays">${many(4)}</span><span class="vents"></span></div>`;
    if (kind === "firewall") return `<div class="dev-foot"><span class="bricks"></span></div>`;
    if (kind === "cpu") return `<div class="dev-foot"><span class="caps">${many(10)}</span></div>`;
    return "";
  }

  /* ---------- Hero & name tag ---------- */
  document.title = `${P.name} | Portfolio`;
  $("hero-name").innerHTML = `${esc(P.firstLine || "")}<span>${esc(P.secondLine || "")}</span>`;
  $("hero-role").textContent = P.role || "";
  $("hero-tagline").textContent = P.tagline || "";

  const T = P.tag || {};
  $("tag-head").textContent = T.header || "";
  $("tag-name").textContent = P.name || "";
  $("tag-role").textContent = T.role || "";
  $("tag-sub").textContent = T.sub || "";
  $("tag-id").textContent = T.id || "";
  const tagInitials = $("tag-initials");
  tagInitials.textContent = initials(P.name);
  const tagImg = $("tag-img");
  tagImg.src = T.photo || P.photo || "";
  tagImg.addEventListener("error", () => tagImg.remove());
  tagImg.addEventListener("load", () => tagInitials.remove()); // foto berhasil dimuat: hapus inisial

  /* ---------- Tentang + foto hover ---------- */
  $("about-text").innerHTML = (P.about || []).map((t) => `<p>${esc(t)}</p>`).join("");
  const portrait = $("portrait"), pBase = $("p-base"), pAlt = $("p-alt");
  $("p-fallback").textContent = initials(P.name);
  pBase.src = P.photo || "";
  pAlt.src = P.photoAlt || "";
  portrait.classList.add("no-alt"); // diganti saat foto alternatif berhasil dimuat
  pAlt.addEventListener("load", () => { portrait.classList.remove("no-alt"); portrait.classList.add("has-alt"); });
  pBase.addEventListener("error", () => portrait.classList.add("no-base"));
  pAlt.addEventListener("error", () => { portrait.classList.add("no-alt"); portrait.classList.remove("has-alt"); pAlt.style.display = "none"; });
  // Efek radius: foto Spiderman muncul perlahan di sekitar kursor, lalu mengikuti kursor
  const reveal = { x: 0.5, y: 0.4, r: 0, tx: 0.5, ty: 0.4, tr: 0, raf: 0 };
  const baseR = () => Math.max(130, portrait.clientWidth * 0.42);
  function paint() {
    reveal.raf = 0;
    reveal.x += (reveal.tx - reveal.x) * 0.12;
    reveal.y += (reveal.ty - reveal.y) * 0.12;
    reveal.r += (reveal.tr - reveal.r) * 0.045;   // pelan: membesar / mengecil
    const w = portrait.clientWidth, h = portrait.clientHeight;
    portrait.style.setProperty("--mx", (reveal.x * w - 10).toFixed(1) + "px");
    portrait.style.setProperty("--my", (reveal.y * h - 10).toFixed(1) + "px");
    portrait.style.setProperty("--r", Math.max(1, reveal.r).toFixed(1) + "px");
    const moving = Math.abs(reveal.tx - reveal.x) > 0.002 || Math.abs(reveal.ty - reveal.y) > 0.002 || Math.abs(reveal.tr - reveal.r) > 0.5;
    if (moving) reveal.raf = requestAnimationFrame(paint);
  }
  const kick = () => { if (!reveal.raf) reveal.raf = requestAnimationFrame(paint); };
  function aim(e) {
    const rc = portrait.getBoundingClientRect();
    reveal.tx = (e.clientX - rc.left) / rc.width;
    reveal.ty = (e.clientY - rc.top) / rc.height;
  }
  portrait.addEventListener("pointerenter", (e) => { aim(e); reveal.x = reveal.tx; reveal.y = reveal.ty; reveal.tr = baseR(); kick(); });
  portrait.addEventListener("pointermove", (e) => { aim(e); reveal.tr = baseR(); kick(); });
  portrait.addEventListener("pointerleave", () => { reveal.tr = 0; kick(); });
  portrait.addEventListener("pointercancel", () => { reveal.tr = 0; kick(); });
  portrait.addEventListener("focus", () => { reveal.tx = 0.5; reveal.ty = 0.4; reveal.tr = Math.hypot(portrait.clientWidth, portrait.clientHeight); kick(); });
  portrait.addEventListener("blur", () => { reveal.tr = 0; kick(); });

  /* ---------- Skill ---------- */
  $("skill-grid").innerHTML = (D.skills || []).map((s, i) => {
    const kind = deviceOf(s.title, i);
    return `
    <article class="dev dev-${kind} xp">
      ${devBar(kind, "SKILL-" + String(i + 1).padStart(2, "0"))}
      ${slider(s.photos)}
      <div class="card-body">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.note)}</p>
        <div class="tags">${(s.tags || []).map((t) => `<span class="tag-chip">${esc(t)}</span>`).join("")}</div>
      </div>
      ${devFoot(kind, i + 3)}
    </article>`;
  }).join("");

  /* ---------- Pengalaman ---------- */
  $("exp-list").innerHTML = (D.experiences || []).map((x) => `
    <article class="exp glass xp ${x.current ? "now" : ""}">
      <div class="exp-media">${slider(x.photos, { ratio: "4 / 3" })}</div>
      <div class="exp-body">
        <div class="period">${esc(x.period)}</div>
        <h3>${esc(x.title)}${x.current ? '<span class="live"><i class="led"></i>ACTIVE</span>' : ""}</h3>
        <div class="place"><i class="fa-solid fa-location-dot"></i>${esc(x.place)}</div>
        <p class="desc">${esc(x.text)}</p>
      </div>
    </article>`).join("");

  /* ---------- Project ---------- */
  $("project-grid").innerHTML = (D.projects || []).map((p) => `
    <article class="proj glass xp">
      <div class="proj-media">
        ${slider(p.photos)}
        <span class="pill">${esc([].concat(p.type || "PROJECT").join(" · "))}</span>
      </div>
      <div class="proj-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
        <div class="tags">${(p.tags || []).map((t) => `<span class="tag-chip">${esc(t)}</span>`).join("")}</div>
        <div class="proj-links">
          ${p.github ? `<a class="port-link" href="${esc(p.github)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>GitHub</a>` : ""}
          ${p.demo ? `<a class="port-link solid" href="${esc(p.demo)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i>Demo</a>` : ""}
        </div>
      </div>
    </article>`).join("");

  /* ---------- Sertifikat ---------- */
  $("cert-grid").innerHTML = (D.certificates || []).map((c) => `
    <article class="cert glass xp">
      <div class="cert-media">${slider(c.photos, { ratio: "4 / 3", contain: true })}</div>
      <div class="cert-body">
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.issuer)} · ${esc(c.year)}</p>
      </div>
    </article>`).join("");

  /* ---------- Kontak (ikon asli) ---------- */
  const L = P.links || {};
  const jacks = [
    L.email && { t: "Email", s: L.email, href: `mailto:${L.email}`, c: "#ea4335", i: "fa-solid fa-envelope" },
    L.github && { t: "GitHub", s: L.github.replace(/^https?:\/\/(www\.)?/, ""), href: L.github, c: "#24292f", i: "fa-brands fa-github" },
    L.linkedin && { t: "LinkedIn", s: L.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: L.linkedin, c: "#0a66c2", i: "fa-brands fa-linkedin-in" },
    L.youtube && { t: "YouTube", s: L.youtube.replace(/^https?:\/\/(www\.)?/, ""), href: L.youtube, c: "#ff0000", i: "fa-brands fa-youtube" },
    L.whatsapp && { t: "WhatsApp", s: "Send a message", href: `https://wa.me/${L.whatsapp}`, c: "#25d366", i: "fa-brands fa-whatsapp" }
  ].filter(Boolean);
  $("contact-grid").innerHTML = jacks.map((j) => `
    <a class="chip glass xp" href="${esc(j.href)}" ${j.href.indexOf("http") === 0 ? 'target="_blank" rel="noopener"' : ""} style="--c:${j.c}">
      <span class="ico"><i class="${j.i}"></i></span>
      <span class="chip-text"><b>${esc(j.t)}</b><small>${esc(j.s)}</small></span>
    </a>`).join("");

  /* ---------- Foto yang gagal dimuat -> layar NO SIGNAL ---------- */
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!img || img.tagName !== "IMG") return;
    const fig = img.closest(".slide");
    if (!fig) return;
    fig.className = "slide nosignal";
    fig.innerHTML = '<div class="bars"></div><b>NO SIGNAL</b><small>photo not found</small>';
  }, true);

  /* ---------- Perilaku slider: geser dengan mouse/sentuh, panah, titik ---------- */
  const lb = $("lightbox"), lbImg = $("lb-img"), lbCap = $("lb-cap");
  let lbList = [], lbIdx = 0;
  function showLb() { const it = lbList[lbIdx]; lbImg.src = it.src; lbImg.alt = it.cap; lbCap.textContent = it.cap; }
  function openLb(list, i) { lbList = list; lbIdx = i; showLb(); lb.hidden = false; document.body.style.overflow = "hidden"; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
  function stepLb(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; showLb(); }
  const lbClose = lb.querySelector(".lb-close"), lbPrev = lb.querySelector(".lb-prev"), lbNext = lb.querySelector(".lb-next");
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lbPrev) lbPrev.addEventListener("click", () => stepLb(-1));
  if (lbNext) lbNext.addEventListener("click", () => stepLb(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") stepLb(-1);
    if (e.key === "ArrowRight") stepLb(1);
  });

  document.querySelectorAll(".slider").forEach((sl) => {
    const track = sl.querySelector(".track");
    const dots = [...sl.querySelectorAll(".dots i")];
    const count = sl.querySelector(".count");
    const n = +sl.dataset.count || 0;
    const index = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (i) => track.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * track.clientWidth, behavior: "smooth" });

    track.addEventListener("scroll", () => {
      const i = index();
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      if (count) count.textContent = `${i + 1}/${n}`;
    }, { passive: true });

    const prev = sl.querySelector(".s-prev"), next = sl.querySelector(".s-next");
    if (prev) prev.addEventListener("click", () => go(index() - 1));
    if (next) next.addEventListener("click", () => go(index() + 1));

    // Geser dengan mouse (sentuh sudah ditangani scroll bawaan)
    let down = false, sx = 0, sl0 = 0, moved = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; sx = e.clientX; sl0 = track.scrollLeft; moved = 0;
      track.classList.add("drag");
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      track.scrollLeft = sl0 - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      track.classList.remove("drag");
      go(index());
    });
    track.addEventListener("click", () => {
      if (moved > 5) { moved = 0; return; }
      const imgs = [...track.querySelectorAll("img")];
      if (!imgs.length) return;
      openLb(imgs.map((im) => ({ src: im.src, cap: im.alt })), Math.min(index(), imgs.length - 1));
    });
    track.addEventListener("dragstart", (e) => e.preventDefault());
  });
})();