/* ============================================================
   ANIMASI UI — tombol kurangi animasi, navigasi, reveal saat scroll,
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
        motionBtn.title = mode === "reduce" ? "Aktifkan animasi" : "Kurangi animasi";
        if (persist) store.set("motion", mode);
        window.dispatchEvent(new Event("motionchange"));
    }
    setMotion(store.get("motion") || (prefersReduce ? "reduce" : "full"), false);
    motionBtn.addEventListener("click", () => setMotion(root.dataset.motion === "reduce" ? "full" : "reduce", true));

    /* ---------- Reveal saat scroll ---------- */
    const els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
        els.forEach((el) => io.observe(el));
    } else {
        els.forEach((el) => el.classList.add("in"));
    }

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
        const nav = $("nav");
        const sy = window.scrollY;

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
    window.addEventListener("resize", () => { buildCable(); request(); });
    window.addEventListener("load", () => { buildCable(); onScroll(); });

    // Denyut data pada kabel
    let off = 0, last = 0;
    (function tick(t) {
        if (root.dataset.motion !== "reduce" && t - last > 33) {
            off -= 1.8; last = t;
            pulse.style.strokeDashoffset = off;
        }
        requestAnimationFrame(tick);
    })(0);

    buildCable();
    onScroll();
    // dokumen bisa berubah tinggi saat gambar/font selesai dimuat
    if ("ResizeObserver" in window) new ResizeObserver(() => { if (document.documentElement.scrollHeight !== docH) { buildCable(); request(); } }).observe(document.body);
})();