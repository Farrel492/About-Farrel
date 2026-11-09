/* ============================================================
   SCENE 3D — lorong ruang server (Three.js)
   - Rak berisi switch, patch panel, router, server, dan UPS
   - Lampu LED berkedip, kabel LAN menggantung antar perangkat
   - Kabel di cable tray atas dengan "paket data" yang mengalir
   - Saat scroll, kamera berjalan menyusuri lorong
   ============================================================ */
(function () {
    "use strict";
    const canvas = document.getElementById("bg");
    if (!canvas || !window.THREE) return;

    const root = document.documentElement;
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch (err) {
        canvas.style.display = "none";
        return;
    }

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const reduced = () => root.dataset.motion === "reduce";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));

    /* ---------- Dasar scene ---------- */
    const FOG = 0x3a4757;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(FOG);
    scene.fog = new THREE.Fog(FOG, 5, 24);
    const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 80);

    scene.add(new THREE.HemisphereLight(0xdbe8ff, 0x3b4656, 0.95));
    const key = new THREE.PointLight(0xfff1dc, 0.9, 14);
    const fill = new THREE.PointLight(0xa9cfff, 0.6, 12);
    scene.add(key, fill);

    /* ---------- Ukuran (1 satuan = 1 meter) ---------- */
    const RACKS = mobile ? 8 : 16;      // jumlah rak per sisi
    const PITCH = 0.62;                 // jarak antar rak
    const AISLE = 1.2;                  // setengah lebar lorong
    const RACK_H = 2.1, DEPTH = 1.0;
    const U = 0.05;                     // tinggi 1U
    const DEV_W = 0.48, DEV_D = 0.7;
    const FIRST = -3;                   // rak di belakang kamera agar tidak ada celah
    const LAST = RACKS - 1;
    const zOf = (i) => -i * PITCH;
    const END_Z = zOf(LAST) - PITCH / 2;
    const TRAY_Y = 2.62, CEIL_Y = 3.1;

    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];

    /* ---------- Tekstur depan perangkat (digambar di canvas) ---------- */
    const TW = 1024, UH = 100;
    const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    function makeTex(units, draw) {
        const c = document.createElement("canvas");
        c.width = TW; c.height = UH * units;
        const g = c.getContext("2d");
        draw(g, c.width, c.height);
        const t = new THREE.CanvasTexture(c);
        t.anisotropy = aniso;
        return t;
    }
    function screw(g, x, y) {
        g.fillStyle = "#5a6470"; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
        g.fillStyle = "#2a3038"; g.fillRect(x - 5, y - 1, 10, 2);
    }
    function port(g, x, y, w, h) {
        g.fillStyle = "#171c22"; g.fillRect(x, y, w, h);
        g.fillStyle = "#38424e"; g.fillRect(x + 3, y + 3, w - 6, h - 9);
        g.fillStyle = "#d6b25a"; g.fillRect(x + 6, y + h - 7, w - 12, 4);
    }

    // Setiap tipe: tinggi (U), fungsi gambar, dan posisi LED (u,v) relatif ke pusat [-0.5..0.5]
    const TYPES = {
        sw: {
            u: 1,
            leds: [],
            draw(g, w, h) {
                g.fillStyle = "#b8c0ca"; g.fillRect(0, 0, w, h);
                g.fillStyle = "#8d97a3"; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
                screw(g, 24, h / 2); screw(g, w - 24, h / 2);
                g.fillStyle = "#222a33"; g.font = "bold 28px monospace"; g.fillText("SW-24G", 56, h * 0.46);
                g.font = "13px monospace"; g.fillStyle = "#4a5460"; g.fillText("MANAGED GIGABIT", 56, h * 0.66);
                for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) port(g, 190 + c * 58, 30 + r * 34, 40, 28);
                for (let i = 0; i < 4; i++) port(g, 900 + i * 30, 46, 24, 26);
            },
            portUV: (c) => [(190 + c * 58 + 20) / TW - 0.5, 0.5 - 76 / UH]
        },
        patch: {
            u: 1,
            leds: [],
            draw(g, w, h) {
                g.fillStyle = "#1c2229"; g.fillRect(0, 0, w, h);
                g.fillStyle = "#2c353f"; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
                screw(g, 24, h / 2); screw(g, w - 24, h / 2);
                for (let i = 0; i < 24; i++) {
                    const x = 70 + i * 38;
                    g.fillStyle = "#9db0c3"; g.font = "10px monospace"; g.fillText(String(i + 1), x + 9, 26);
                    g.fillStyle = "#0b0e12"; g.fillRect(x, 32, 30, 36);
                    g.fillStyle = "#2f3a46"; g.fillRect(x + 3, 35, 24, 24);
                }
            },
            portUV: (c) => [(70 + c * 38 + 15) / TW - 0.5, 0.0]
        },
        router: {
            u: 1,
            leds: [],
            draw(g, w, h) {
                g.fillStyle = "#d3d9df"; g.fillRect(0, 0, w, h);
                g.fillStyle = "#ff8f3d"; g.fillRect(0, 0, w, 9);
                g.fillStyle = "#9aa4b0"; g.fillRect(0, h - 5, w, 5);
                screw(g, 24, h / 2 + 4); screw(g, w - 24, h / 2 + 4);
                g.fillStyle = "#222a33"; g.font = "bold 26px monospace"; g.fillText("CORE-RTR", 56, h * 0.56);
                for (let i = 0; i < 14; i++) { g.fillStyle = "#aab3be"; g.fillRect(300 + i * 11, 28, 5, 54); }
                for (let i = 0; i < 8; i++) port(g, 500 + i * 58, 36, 40, 28);
            },
            portUV: (c) => [(500 + c * 58 + 20) / TW - 0.5, 0.5 - 50 / UH]
        },
        server: {
            u: 2,
            leds: [],
            draw(g, w, h) {
                g.fillStyle = "#2b333c"; g.fillRect(0, 0, w, h);
                g.fillStyle = "#3a444f"; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
                screw(g, 24, h / 2); screw(g, w - 24, h / 2);
                for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
                    const x = 70 + c * 180, y = 22 + r * 84;
                    g.fillStyle = "#171c22"; g.fillRect(x, y, 166, 70);
                    g.fillStyle = "#98a3af"; g.fillRect(x + 8, y + 8, 120, 54);
                    g.fillStyle = "#6c7783"; for (let k = 0; k < 6; k++) g.fillRect(x + 14 + k * 18, y + 14, 10, 42);
                }
                for (let i = 0; i < 18; i++) { g.fillStyle = "#12171d"; g.fillRect(820 + (i % 6) * 22, 24 + ((i / 6) | 0) * 24, 14, 12); }
                g.fillStyle = "#12171d"; g.beginPath(); g.arc(940, 150, 22, 0, 7); g.fill();
            }
        },
        ups: {
            u: 3,
            leds: [],
            draw(g, w, h) {
                g.fillStyle = "#262d35"; g.fillRect(0, 0, w, h);
                g.fillStyle = "#37414c"; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
                screw(g, 24, 30); screw(g, w - 24, 30); screw(g, 24, h - 30); screw(g, w - 24, h - 30);
                g.fillStyle = "#c8d0d9"; g.font = "bold 30px monospace"; g.fillText("UPS 3000VA", 70, 70);
                g.fillStyle = "#0e2418"; g.fillRect(70, 110, 330, 130);
                g.strokeStyle = "#3e5a4a"; g.lineWidth = 3; g.strokeRect(70, 110, 330, 130);
                g.fillStyle = "#4be08a"; g.font = "bold 22px monospace"; g.fillText("BATT  100%", 92, 150);
                for (let i = 0; i < 10; i++) { g.fillStyle = i < 9 ? "#4be08a" : "#1b4a31"; g.fillRect(92 + i * 29, 166, 22, 24); }
                g.fillStyle = "#4be08a"; g.font = "16px monospace"; g.fillText("LOAD 42%   ONLINE", 92, 222);
                for (let r = 0; r < 4; r++) for (let c = 0; c < 22; c++) { g.fillStyle = "#12171d"; g.fillRect(500 + c * 22, 110 + r * 34, 14, 22); }
            }
        }
    };
    Object.keys(TYPES).forEach((k) => {
        TYPES[k].tex = makeTex(TYPES[k].u, TYPES[k].draw);
        TYPES[k].h = TYPES[k].u * U;
    });

    // Posisi LED per tipe
    for (let c = 0; c < 12; c++) TYPES.sw.leds.push([(190 + c * 58 + 20) / TW - 0.5, 0.5 - 15 / UH]);
    for (let c = 0; c < 8; c++) TYPES.router.leds.push([(500 + c * 58 + 20) / TW - 0.5, 0.5 - 18 / UH]);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) TYPES.server.leds.push([(70 + c * 180 + 150) / TW - 0.5, 0.5 - (22 + r * 84 + 12) / (UH * 2)]);
    TYPES.ups.leds.push([(440) / TW - 0.5, 0.5 - 130 / (UH * 3)], [(440) / TW - 0.5, 0.5 - 170 / (UH * 3)]);

    /* ---------- Rak & perangkat (instancing = sedikit draw call) ---------- */
    const metal = [];           // {pos, scale, color}
    const fronts = { sw: [], patch: [], router: [], server: [], ups: [] };
    const ledList = [];         // {pos}
    const cableSpots = [];      // untuk kabel patch: {side, z, cy, type}
    const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    const RACK_C = new THREE.Color("#222a33"), DEV_C = new THREE.Color("#2b343e"), BLANK_C = new THREE.Color("#252d36");

    function addMetal(x, y, z, sx, sy, sz, color) {
        metal.push({ p: new THREE.Vector3(x, y, z), s: new THREE.Vector3(sx, sy, sz), c: color });
    }
    const wpos = (side, z, cy, u, v, h, dz) => {
        // titik di depan perangkat; u melintang (-0.5..0.5), v vertikal relatif
        return new THREE.Vector3(side * AISLE - side * dz, cy + v * h, z + side * u * DEV_W);
    };

    const sequence = ["sw", "patch", "sw", "server", "patch", "sw", "router", "server", "sw", "patch", "blank", "server"];
    for (let i = FIRST; i <= LAST; i++) {
        const z = zOf(i);
        for (const side of [-1, 1]) {
            const cx = side * (AISLE + DEPTH / 2);
            // Rangka rak
            addMetal(cx, RACK_H / 2, z - PITCH / 2 + 0.008, DEPTH, RACK_H, 0.016, RACK_C);
            addMetal(cx, RACK_H / 2, z + PITCH / 2 - 0.008, DEPTH, RACK_H, 0.016, RACK_C);
            addMetal(cx, RACK_H, z, DEPTH, 0.04, PITCH, RACK_C);
            addMetal(cx, 0.05, z, DEPTH, 0.1, PITCH, RACK_C);
            addMetal(side * (AISLE + DEPTH), RACK_H / 2, z, 0.02, RACK_H, PITCH, RACK_C);
            addMetal(side * AISLE, RACK_H / 2, z - 0.255, 0.035, RACK_H, 0.035, RACK_C);
            addMetal(side * AISLE, RACK_H / 2, z + 0.255, 0.035, RACK_H, 0.035, RACK_C);

            // Isi rak dari bawah ke atas
            let y = 0.1;
            const top = RACK_H - 0.05;
            const list = [];
            if (Math.abs(i) % 3 === 0) list.push("ups");
            let k = (Math.random() * sequence.length) | 0;
            let used = list.length ? 3 : 0;
            while (used < (top - 0.1) / U - 1) {
                const t = sequence[k++ % sequence.length];
                const u = t === "blank" ? 1 : TYPES[t].u;
                if (y + (used + u) * U > top) break;
                list.push(Math.random() < 0.07 ? "blank" : t);
                used += u;
            }
            list.forEach((t) => {
                const u = t === "blank" ? 1 : TYPES[t].u;
                const h = u * U - 0.004;
                const cy = y + h / 2 + 0.002;
                addMetal(side * (AISLE + DEV_D / 2), cy, z, DEV_D, h, DEV_W, t === "blank" ? BLANK_C : DEV_C);
                if (t !== "blank") {
                    fronts[t].push({ p: new THREE.Vector3(side * AISLE - side * 0.001, cy, z), side });
                    TYPES[t].leds.forEach((l) => ledList.push({ p: wpos(side, z, cy, l[0], l[1], u * U, 0.004) }));
                    if (t === "sw" || t === "patch") cableSpots.push({ side, z, cy, type: t, u });
                }
                y += u * U;
            });
        }
    }

    // Mesh instanced: rangka & badan perangkat
    {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.35 });
        const mesh = new THREE.InstancedMesh(geo, mat, metal.length);
        const m = new THREE.Matrix4();
        metal.forEach((o, i) => {
            m.compose(o.p, q.identity(), o.s);
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, o.c);
        });
        scene.add(mesh);
    }
    // Mesh instanced: muka perangkat bertekstur
    Object.keys(fronts).forEach((t) => {
        const arr = fronts[t];
        if (!arr.length) return;
        const geo = new THREE.PlaneGeometry(DEV_W, TYPES[t].h - 0.004);
        const mat = new THREE.MeshStandardMaterial({ map: TYPES[t].tex, roughness: 0.6, metalness: 0.2 });
        const mesh = new THREE.InstancedMesh(geo, mat, arr.length);
        const m = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
        arr.forEach((o, i) => {
            q.setFromAxisAngle(up, -o.side * Math.PI / 2);
            m.compose(o.p, q, one);
            mesh.setMatrixAt(i, m);
        });
        scene.add(mesh);
    });

    /* ---------- LED berkedip ---------- */
    const LED_OFF = new THREE.Color("#1a3a28"), LED_ON = new THREE.Color("#66ff9e"), LED_AMB = new THREE.Color("#ffc94d");
    const ledMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.008, 0.006, 0.008), new THREE.MeshBasicMaterial({ color: 0xffffff }), ledList.length);
    {
        const m = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
        ledList.forEach((l, i) => {
            m.compose(l.p, q.identity(), one);
            ledMesh.setMatrixAt(i, m);
            ledMesh.setColorAt(i, Math.random() < 0.75 ? LED_ON : Math.random() < 0.5 ? LED_AMB : LED_OFF);
        });
        scene.add(ledMesh);
    }
    function blink() {
        const n = Math.max(6, (ledList.length * 0.05) | 0);
        for (let k = 0; k < n; k++) {
            const i = (Math.random() * ledList.length) | 0;
            const r = Math.random();
            ledMesh.setColorAt(i, r < 0.55 ? LED_ON : r < 0.75 ? LED_AMB : LED_OFF);
        }
        ledMesh.instanceColor.needsUpdate = true;
    }

    /* ---------- Lantai, langit-langit, cable tray, lampu ---------- */
    {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d");
        g.fillStyle = "#566478"; g.fillRect(0, 0, 128, 128);
        g.strokeStyle = "#3b4757"; g.lineWidth = 4; g.strokeRect(0, 0, 128, 128);
        g.fillStyle = "#59687c";
        for (let y = 18; y < 128; y += 18) for (let x = 18; x < 128; x += 18) { g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = aniso;
        t.repeat.set(12, 70);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 42), new THREE.MeshStandardMaterial({ map: t, roughness: 0.75, metalness: 0.1 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, -14);
        scene.add(floor);

        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 42), new THREE.MeshStandardMaterial({ color: 0x546174, roughness: 0.9 }));
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(0, CEIL_Y, -14);
        scene.add(ceil);

        // Dinding ujung lorong + lampu tanda keluar
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(7.2, CEIL_Y), new THREE.MeshStandardMaterial({ color: 0x4b586b, roughness: 0.9 }));
        wall.position.set(0, CEIL_Y / 2, END_Z - 0.3);
        scene.add(wall);
        const door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.1), new THREE.MeshStandardMaterial({ color: 0x2c3541, roughness: 0.6, metalness: 0.4 }));
        door.position.set(0, 1.05, END_Z - 0.28);
        scene.add(door);
        const exit = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.12), new THREE.MeshBasicMaterial({ color: 0x66ff9e }));
        exit.position.set(0, 2.32, END_Z - 0.27);
        scene.add(exit);

        // Garis keselamatan di lantai (kuning-hitam)
        [-1, 1].forEach((s) => {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 42), new THREE.MeshBasicMaterial({ color: 0xffc94d }));
            line.rotation.x = -Math.PI / 2;
            line.position.set(s * (AISLE - 0.12), 0.003, -14);
            scene.add(line);
        });

        // Cable tray: dua rel + anak tangga
        const trayMat = new THREE.MeshStandardMaterial({ color: 0x8e99a6, roughness: 0.5, metalness: 0.6 });
        const len = 42;
        [-0.27, 0.27].forEach((x) => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, len), trayMat);
            rail.position.set(x, TRAY_Y - 0.03, -14);
            scene.add(rail);
        });
        const rungN = 80;
        const rungs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.58, 0.015, 0.03), trayMat, rungN);
        const m = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
        for (let i = 0; i < rungN; i++) { m.compose(new THREE.Vector3(0, TRAY_Y - 0.055, 6 - i * 0.5), q.identity(), one); rungs.setMatrixAt(i, m); }
        scene.add(rungs);

        // Panel lampu langit-langit
        const lamp = new THREE.MeshBasicMaterial({ color: 0xfff6e2 });
        for (let i = 0; i < 12; i++) for (const x of [-0.85, 0.85]) {
            const l = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 1.0), lamp);
            l.position.set(x, CEIL_Y - 0.01, 3 - i * 1.5);
            scene.add(l);
        }
    }

    /* ---------- Kabel LAN ---------- */
    const COLORS = { blue: 0x3f8cff, yellow: 0xffd23c, orange: 0xff8a3c, white: 0xe9edf2, green: 0x4fd47a, red: 0xff5a5a };
    const cableGeos = {};        // warna -> [geometry]
    const pulseCurves = [];      // {curve, len, color, n}

    function addCable(points, color, radius, seg, pulses) {
        const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
        const g = new THREE.TubeGeometry(curve, seg, radius, 5, false);
        (cableGeos[color] = cableGeos[color] || []).push(g);
        if (pulses) pulseCurves.push({ curve, len: curve.getLength(), color: new THREE.Color(color), n: pulses });
    }

    // 1. Kabel patch menggantung di depan rak (patch panel -> switch)
    const colorKeys = Object.values(COLORS);
    cableSpots.forEach((a, idx) => {
        if (a.type !== "patch") return;
        const b = cableSpots.find((o, j) => j > idx && o.side === a.side && o.z === a.z && o.type === "sw" && o.cy - a.cy < 0.35);
        if (!b) return;
        const jacks = [3, 4, 9, 14];
        const ports = [1, 5, 8, 10];
        const count = 2 + ((Math.random() * 3) | 0);
        for (let k = 0; k < count; k++) {
            const ju = (70 + jacks[k] * 38 + 15) / TW - 0.5;
            const pu = (190 + ports[k] * 58 + 20) / TW - 0.5;
            const S = wpos(a.side, a.z, a.cy, ju, 0, U, 0.004);
            const E = wpos(b.side, b.z, b.cy, pu, -0.26, U, 0.004);
            const out = -a.side;
            const bulge = 0.035 + k * 0.012 + (b.cy - a.cy) * 0.12;
            const mid = S.clone().lerp(E, 0.5);
            addCable([
                S, S.clone().add(new THREE.Vector3(out * 0.03, 0, 0)),
                new THREE.Vector3(mid.x + out * bulge, mid.y - 0.015, mid.z),
                E.clone().add(new THREE.Vector3(out * 0.03, 0, 0)), E
            ], pick(colorKeys), 0.006, 24, Math.random() < 0.4 ? 1 : 0);
        }
    });

    // 2. Kabel panjang di cable tray
    const runColors = [COLORS.blue, COLORS.yellow, COLORS.orange, COLORS.white, COLORS.green, COLORS.blue, COLORS.red];
    runColors.forEach((c, i) => {
        const x = -0.2 + i * 0.067;
        const pts = [];
        for (let z = 5; z >= END_Z + 0.4; z -= 1.4) pts.push(new THREE.Vector3(x + rnd(-0.015, 0.015), TRAY_Y + 0.005 + (i % 2) * 0.012, z));
        addCable(pts, c, 0.012, 160, 4);
    });

    // 3. Kabel turun dari tray ke atas rak
    for (let i = 0; i <= LAST; i++) {
        for (const side of [-1, 1]) {
            if (((i + (side > 0 ? 1 : 0)) & 1) === 0) {
                const z = zOf(i) + rnd(-0.12, 0.12);
                const x0 = rnd(-0.12, 0.12);
                addCable([
                    new THREE.Vector3(x0, TRAY_Y + 0.01, z + 0.4),
                    new THREE.Vector3(x0, TRAY_Y, z),
                    new THREE.Vector3(side * 0.5, TRAY_Y - 0.05, z),
                    new THREE.Vector3(side * 1.05, TRAY_Y - 0.2, z),
                    new THREE.Vector3(side * 1.45, RACK_H + 0.22, z),
                    new THREE.Vector3(side * (AISLE + 0.5), RACK_H + 0.01, z)
                ], pick(colorKeys), 0.011, 40, 1);
            }
        }
    }

    // Gabungkan geometri kabel per warna
    function merge(geos) {
        let vc = 0, ic = 0;
        geos.forEach((g) => { vc += g.attributes.position.count; ic += g.index.count; });
        const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), idx = new Uint32Array(ic);
        let vo = 0, io = 0;
        geos.forEach((g) => {
            pos.set(g.attributes.position.array, vo * 3);
            nor.set(g.attributes.normal.array, vo * 3);
            for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.array[i] + vo;
            vo += g.attributes.position.count; io += g.index.count;
            g.dispose();
        });
        const out = new THREE.BufferGeometry();
        out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
        out.setIndex(new THREE.BufferAttribute(idx, 1));
        return out;
    }
    Object.keys(cableGeos).forEach((c) => {
        scene.add(new THREE.Mesh(merge(cableGeos[c]), new THREE.MeshStandardMaterial({ color: +c, roughness: 0.45, metalness: 0.05 })));
    });

    /* ---------- Paket data yang mengalir di kabel ---------- */
    function dotTexture() {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d");
        const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }
    const pulses = [];
    pulseCurves.forEach((pc) => { for (let i = 0; i < pc.n; i++) pulses.push({ pc, t: Math.random(), v: rnd(0.8, 1.8) * (Math.random() < 0.5 ? 1 : -1) }); });
    const pPos = new Float32Array(pulses.length * 3), pCol = new Float32Array(pulses.length * 3);
    pulses.forEach((p, i) => { const c = p.pc.color.clone().lerp(new THREE.Color(0xffffff), 0.65); pCol.set([c.r, c.g, c.b], i * 3); });
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    const pPoints = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.11, map: dotTexture(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    scene.add(pPoints);
    const tmp = new THREE.Vector3();
    function updatePulses(dt) {
        pulses.forEach((p, i) => {
            p.t += (p.v * dt) / p.pc.len;
            if (p.t > 1) p.t -= 1; else if (p.t < 0) p.t += 1;
            p.pc.curve.getPointAt(p.t, tmp);
            pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y; pPos[i * 3 + 2] = tmp.z;
        });
        pGeo.attributes.position.needsUpdate = true;
    }

    /* ---------- Kamera: berjalan di lorong mengikuti scroll ---------- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener("pointermove", (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    let progress = 0, sm = 0;
    function readScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }
    window.addEventListener("scroll", readScroll, { passive: true });

    const START_Z = 2.4, FINISH_Z = END_Z + 1.6;
    function placeCamera() {
        const z = START_Z + (FINISH_Z - START_Z) * sm;
        const yaw = Math.sin(sm * Math.PI * 3.2) * 0.55 + mouse.x * -0.12;
        const pitch = -mouse.y * 0.06;
        camera.position.set(Math.sin(sm * 6.0) * 0.12 + mouse.x * 0.1, 1.5 + Math.sin(sm * 9) * 0.02, z);
        camera.lookAt(camera.position.x + Math.sin(yaw) * 3, 1.45 + pitch * 3, z - Math.cos(yaw) * 3);
        key.position.set(camera.position.x, 1.9, z - 1.2);
        fill.position.set(camera.position.x, 1.2, z - 4.5);
    }

    function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w < 700 ? 74 : 62;
        camera.updateProjectionMatrix();
        if (reduced()) staticFrame();
    }
    window.addEventListener("resize", resize);

    /* ---------- Loop ---------- */
    let raf = 0, last = performance.now(), blinkAt = 0;
    function frame(now) {
        raf = 0;
        if (reduced()) { staticFrame(); return; }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!document.hidden) {
            sm += (progress - sm) * 0.06;
            mouse.x += (mouse.tx - mouse.x) * 0.05;
            mouse.y += (mouse.ty - mouse.y) * 0.05;
            if (now > blinkAt) { blink(); blinkAt = now + 130; }
            updatePulses(dt);
            placeCamera();
            renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(frame);
    }
    function staticFrame() {
        readScroll();
        sm = progress;
        mouse.x = mouse.y = 0;
        updatePulses(0);
        placeCamera();
        renderer.render(scene, camera);
    }
    function start() { if (!raf) raf = requestAnimationFrame((t) => { last = t; frame(t); }); }
    window.addEventListener("motionchange", () => { cancelAnimationFrame(raf); raf = 0; start(); });
    window.addEventListener("scroll", () => { if (reduced()) staticFrame(); }, { passive: true });

    resize();
    readScroll();
    sm = progress;
    start();
})();