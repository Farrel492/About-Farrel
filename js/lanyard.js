/* ============================================================
   LANYARD — name tag yang menggantung dan bisa ditarik,
   digeser kiri-kanan, atau dilempar (fisika tali sederhana).
   ============================================================ */
(function () {
    "use strict";
    const zone = document.getElementById("lanyard");
    const cv = document.getElementById("lanyard-canvas");
    const tag = document.getElementById("tag");
    if (!zone || !cv || !tag) return;

    const ctx = cv.getContext("2d");
    const root = document.documentElement;
    const hero = document.getElementById("hero");

    const N = 8;              // jumlah segmen tali
    const SEG = 34;           // panjang tiap segmen (px)
    const CARD_W = 196, CARD_LEN = 330;
    const GRAV = 0.55, DAMP = 0.992, ITER = 12;

    let W = 0, H = 0, dpr = 1;
    const pts = [];           // titik tali; pts[0] = angkur, pts[N] = kait name tag
    let tail;                 // titik bawah name tag

    function mk(x, y) { return { x, y, px: x, py: y }; }

    function layout(reset) {
        const r = zone.getBoundingClientRect();
        W = r.width; H = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const ax = W < 700 ? W / 2 : W * 0.46;
        if (reset || !pts.length) {
            pts.length = 0;
            for (let i = 0; i <= N; i++) pts.push(mk(ax + (i === N ? 40 : 0) * 0, -24 + i * SEG));
            // sedikit miring di awal supaya langsung bergoyang
            for (let i = 1; i <= N; i++) { pts[i].x += i * 3; pts[i].px = pts[i].x - i * 0.9; }
            tail = mk(pts[N].x + 6, pts[N].y + CARD_LEN);
        }
        pts[0].x = pts[0].px = ax;
        pts[0].y = pts[0].py = -24;
    }

    /* ---------- Fisika ---------- */
    function simulate() {
        const all = pts.slice(1).concat([tail]);
        all.forEach((p) => {
            const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
            p.px = p.x; p.py = p.y;
            p.x += vx; p.y += vy + GRAV;
        });

        if (drag) {
            const A = pts[N], T = tail;
            const gx = A.x + (T.x - A.x) * drag.s, gy = A.y + (T.y - A.y) * drag.s;
            const dx = pointer.x - gx, dy = pointer.y - gy;
            const k = 0.55;
            A.x += dx * (1 - drag.s) * k; A.y += dy * (1 - drag.s) * k;
            T.x += dx * drag.s * k; T.y += dy * drag.s * k;
        }

        for (let it = 0; it < ITER; it++) {
            for (let i = 0; i < N; i++) link(pts[i], pts[i + 1], SEG, i === 0);
            link(pts[N], tail, CARD_LEN, false);
            pts[0].x = pts[0].px = pts[0].x; // angkur tetap
            // batas area
            all.forEach((p) => {
                if (p.x < 16) p.x = 16;
                if (p.x > W - 16) p.x = W - 16;
                if (p.y > H - 10) p.y = H - 10;
            });
        }
    }
    function link(a, b, len, aFixed) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - len) / d;
        if (aFixed) { b.x -= dx * diff; b.y -= dy * diff; }
        else { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
    }

    /* ---------- Gambar ---------- */
    function draw() {
        ctx.clearRect(0, 0, W, H);

        // braket langit-langit
        ctx.fillStyle = "#8e99a6";
        ctx.fillRect(pts[0].x - 26, -30, 52, 22);

        // titik-titik rapat sepanjang tali (kurva halus)
        const S = [{ x: pts[0].x, y: pts[0].y }];
        let cx = pts[0].x, cy = pts[0].y;
        for (let i = 1; i < N; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
            for (let k = 1; k <= 6; k++) {
                const t = k / 6, u = 1 - t;
                S.push({ x: u * u * cx + 2 * u * t * pts[i].x + t * t * mx, y: u * u * cy + 2 * u * t * pts[i].y + t * t * my });
            }
            cx = mx; cy = my;
        }
        for (let k = 1; k <= 5; k++) { const t = k / 5; S.push({ x: cx + (pts[N].x - cx) * t, y: cy + (pts[N].y - cy) * t }); }

        ctx.lineCap = "butt"; ctx.lineJoin = "round";
        function strap() { ctx.beginPath(); ctx.moveTo(S[0].x, S[0].y); for (let i = 1; i < S.length; i++) ctx.lineTo(S[i].x, S[i].y); }
        strap(); ctx.strokeStyle = "rgba(0,0,0,.3)"; ctx.lineWidth = 26; ctx.translate(3, 4); ctx.stroke(); ctx.translate(-3, -4);
        strap(); ctx.strokeStyle = "#14562b"; ctx.lineWidth = 26; ctx.stroke();
        strap(); ctx.strokeStyle = "#1f7a3d"; ctx.lineWidth = 22; ctx.stroke();

        // motif belah ketupat biru & hijau muda di sepanjang tali
        let acc = 0, n = 0, mark = null;
        const total = S.reduce((t, p, i) => (i ? t + Math.hypot(p.x - S[i - 1].x, p.y - S[i - 1].y) : 0), 0);
        for (let i = 1; i < S.length; i++) {
            const dx = S[i].x - S[i - 1].x, dy = S[i].y - S[i - 1].y, d = Math.hypot(dx, dy);
            acc += d;
            if (acc >= 20) {
                acc = 0; n++;
                ctx.save();
                ctx.translate(S[i].x, S[i].y);
                ctx.rotate(Math.atan2(dy, dx));
                ctx.fillStyle = n % 2 ? "#2f5fb8" : "#b9c93a";
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-4.5, -4.5, 9, 9);
                ctx.restore();
            }
            if (!mark && i > 1) { let L = 0; for (let k = 1; k <= i; k++) L += Math.hypot(S[k].x - S[k - 1].x, S[k].y - S[k - 1].y); if (L > total * 0.34) mark = { x: S[i].x, y: S[i].y, a: Math.atan2(dy, dx) }; }
        }

        // pengait hitam (breakaway) + paku logam di tengah tali
        if (mark) {
            ctx.save();
            ctx.translate(mark.x, mark.y);
            ctx.rotate(mark.a);
            ctx.fillStyle = "#15181c";
            ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-9, -15, 38, 30, 6) : ctx.rect(-9, -15, 38, 30); ctx.fill();
            ctx.fillStyle = "#2a2f36"; ctx.fillRect(-4, -9, 28, 18);
            ctx.fillStyle = "#c3cad2"; ctx.beginPath(); ctx.arc(-24, 0, 5, 0, 7); ctx.fill();
            ctx.restore();
        }

        // posisi & sudut name tag
        const A = pts[N];
        const ang = Math.atan2(tail.y - A.y, tail.x - A.x) - Math.PI / 2;
        tag.style.transform = `translate(${A.x - CARD_W / 2}px, ${A.y}px) rotate(${ang}rad)`;
    }

    /* ---------- Interaksi ---------- */
    const pointer = { x: 0, y: 0 };
    let drag = null;
    function toLocal(e) {
        const r = zone.getBoundingClientRect();
        pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    }
    tag.addEventListener("pointerdown", (e) => {
        toLocal(e);
        const A = pts[N], T = tail;
        const vx = T.x - A.x, vy = T.y - A.y;
        const s = Math.max(0.05, Math.min(1, ((pointer.x - A.x) * vx + (pointer.y - A.y) * vy) / (vx * vx + vy * vy)));
        drag = { s };
        tag.classList.add("grabbing");
        tag.setPointerCapture(e.pointerId);
        wake();
        e.preventDefault();
    });
    tag.addEventListener("pointermove", (e) => { if (drag) toLocal(e); });
    const release = () => { drag = null; tag.classList.remove("grabbing"); };
    tag.addEventListener("pointerup", release);
    tag.addEventListener("pointercancel", release);
    // dorong ringan saat kursor menyapu name tag
    tag.addEventListener("pointerenter", (e) => { if (!drag && e.pointerType === "mouse") { tail.x += (Math.random() - 0.5) * 6; wake(); } });

    /* ---------- Loop (berhenti saat tidak terlihat atau sudah diam) ---------- */
    let raf = 0, visible = true, acc = 0, lastT = 0, calm = 0;
    function wake() { calm = 0; if (!raf && visible) { lastT = performance.now(); raf = requestAnimationFrame(loop); } }
    function loop(t) {
        raf = 0;
        acc += Math.min(50, t - lastT); lastT = t;
        let moved = 0;
        while (acc >= 16.67) {
            const before = tail.x + tail.y;
            simulate();
            moved += Math.abs(tail.x + tail.y - before) + Math.abs(tail.x - tail.px) + Math.abs(tail.y - tail.py);
            acc -= 16.67;
        }
        draw();
        calm = moved < 0.02 && !drag ? calm + 1 : 0;
        if (calm < 90 && visible) raf = requestAnimationFrame(loop);
    }

    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) wake(); }, { threshold: 0 }).observe(hero);
    window.addEventListener("resize", () => { layout(false); wake(); });
    window.addEventListener("motionchange", wake);

    layout(true);
    draw();
    // ayunan kecil di awal
    setTimeout(() => { tail.x += 22; wake(); }, 700);
    wake();
})();