/* ============================================================
   PROJECT — satu blok = satu project.
   type   : satu kategori ("Web") atau beberapa (["Jaringan", "Web"])
   github : link repository ("" jika tidak ada)
   demo   : link demo/hasil visualisasi ("" jika tidak ada)
   photos : tangkapan layar / foto topologi (bisa digeser)
   ============================================================ */
window.DATA = window.DATA || {};

window.DATA.projects = [
  {
    title: "Visualisasi Data Center",
    type: "Web",
    text: "Simulasi interaktif 3D pusat data dan IBM SAN: mencakup 100 rak, skenario kegagalan daya, serta keamanan fisik berlapis (kartu akses, sidik jari, dan man-trap). Dibuat dalam satu berkas HTML menggunakan Three.js.",
    tags: ["Three.js", "Data Center", "SAN", "HTML", "CSS"],
    github: "https://github.com/Farrel492/Visualisasi_Data_Center",
    demo: "https://farrel492.github.io/Visualisasi_Data_Center/",
    photos: []
  },
  {
    title: "Merakit PC",
    type: "Web",
    text: "Platform interaktif untuk merakit PC dan mempelajari perangkat keras komputer, yang mencakup simulasi perakitan PC, ensiklopedia perangkat keras, simulasi POST/BIOS, visualisasi aliran udara, pemecahan masalah, estimasi FPS, serta analisis hambatan performa (bottleneck).",
    tags: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/Farrel492/Komponen-PC",
    demo: "https://farrel492.github.io/Komponen-PC/",
    photos: []
  },
  {
    title: "Website Logativity",
    type: "Web",
    text: "Aplikasi web dengan PHP dan MySQL, lengkap dengan perancangan database.",
    tags: ["PHP", "MySQL"],
    github: "https://github.com/Farrel492",
    demo: "",
    photos: []
  },
  {
    title: "Website Naomi Solution",
    type: "Web",
    text: "Website profil dan layanan untuk Naomi Solution.",
    tags: ["PHP", "MySQL"],
    github: "https://github.com/Farrel492",
    demo: "",
    photos: []
  }
];