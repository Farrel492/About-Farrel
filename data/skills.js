/* ============================================================
   SKILL — satu blok = satu kartu. Salin satu blok untuk menambah.
   photos : daftar foto (bisa lebih dari satu, nanti bisa digeser)
            contoh: ["assets/skills/mikrotik/1.jpg", "assets/skills/mikrotik/2.jpg"]
            boleh kosong [] (tampil layar "NO SIGNAL")
   PENTING: path foto ditulis tanpa spasi, contoh "assets/skills/hardware/1.jpg"
   ============================================================ */
window.DATA = window.DATA || {};

window.DATA.skills = [
    {
        title: "MikroTik",
        note: "Mengonfigurasi dan mengelola perangkat MikroTik menggunakan RouterOS dan Winbox, termasuk pengaturan jaringan, routing, manajemen layanan jaringan, serta wireless wifi .",
        tags: ["RouterOS", "Winbox", "MTCNA"],
        photos: [
            "assets/profile/mikrotik1.jpeg",
            "assets/profile/mikrotik2.jpeg",
            "assets/profile/mikrotik3.jpeg",
            "assets/profile/mikrotik4.jpeg",
            "assets/profile/mikrotik5.jpeg"
        ]
    },
    {
        title: "Network Engineering",
        note: "Merancang, membangun, dan menguji topologi jaringan menggunakan Cisco Packet Tracer maupun simulasi physical. Berfokus pada konfigurasi routing, switching, VLAN, ACL, firewall, serta identifikasi dan troubleshooting permasalahan jaringan.",
        tags: ["Mikrotik", "Cisco", "Routing", "Switching", "Vlan", "ACL", "Firewall", "Wi-Fi Management"],
        photos: []
    },
    {
        title: "IT Support",
        note: "Melakukan identifikasi, analisis, dan penanganan permasalahan perangkat keras maupun perangkat lunak, termasuk instalasi, konfigurasi, pemeliharaan, dan troubleshooting perangkat komputer.",
        tags: ["Hardware Troubleshooting", "Software Troubleshooting", "Maintenance"],
        photos: []
    },
    {
        title: "Web Development",
        note: "Mengembangkan aplikasi dan website dengan memperhatikan struktur, fungsionalitas, serta pengalaman pengguna. Mencakup pembuatan antarmuka, implementasi fitur, dan pengembangan solusi berbasis web.",
        tags: ["HTML", "CSS", "JavaScript", "PHP", "Laravel", "UI/UX Design", "Figma", "Python"],
        photos: []
    },
    {
        title: "Backend & Database",
        note: "Mengembangkan logika aplikasi dan mengelola basis data, mulai dari perancangan struktur database, pengolahan data, hingga integrasi database dengan aplikasi.",
        tags: ["PHP", "MySQL", "SQL Server", "Database Desaign", "Laragon", "Draw.Io"],
        photos: []
    },
    {
        title: "IT Management",
        note: "Mendukung pengelolaan operasional teknologi informasi melalui pemeliharaan fasilitas dan perangkat IT, administrasi sistem, dokumentasi teknis, serta koordinasi kebutuhan operasional teknologi.",
        tags: ["IT Operations", "System Administration", "IT Documentation"],
        photos: []
    },
    {
        title: "IT Consulting & Analysis",
        note: "Menganalisis kebutuhan dan permasalahan teknologi informasi, mengidentifikasi alternatif solusi, serta menyusun rekomendasi teknis berdasarkan kebutuhan dan tujuan pengguna atau organisasi.",
        tags: ["Requirement Analysis", "Problem Solving", "Solution Design"],
        photos: []
    }
];