/* ============================================================
   SKILL — satu blok = satu kartu. Salin satu blok untuk menambah.
   photos : daftar foto (bisa lebih dari satu, nanti bisa digeser)
            contoh: ["assets/skills/mikrotik/1.jpg", "assets/skills/mikrotik/2.jpg"]
            boleh kosong [] (tampil layar "NO SIGNAL")
   ============================================================ */
window.DATA = window.DATA || {};

window.DATA.skills = [
    {
        title: "MikroTik",
        note: "Konfigurasi router dan manajemen jaringan lewat Winbox.",
        tags: ["RouterOS", "Winbox", "MTCNA"],
        photos: []
    },
    {
        title: "Cisco & Simulasi",
        note: "Merancang dan menguji topologi di Packet Tracer, GNS3, dan PNETLab.",
        tags: ["Packet Tracer", "GNS3", "PNETLab"],
        photos: []
    },
    {
        title: "Routing",
        note: "Menghubungkan beberapa jaringan dengan protokol routing dinamis.",
        tags: ["RIP", "EIGRP", "BGP", "ACL"],
        photos: []
    },
    {
        title: "VLAN & Firewall",
        note: "Memisahkan segmen jaringan dan mengatur siapa boleh mengakses apa.",
        tags: ["VLAN", "Firewall"],
        photos: []
    },
    {
        title: "Web & Database",
        note: "Membuat aplikasi web sederhana dengan database.",
        tags: ["PHP", "MySQL", "Python"],
        photos: []
    },
    {
        title: "Hardware",
        note: "Merakit komputer, crimping kabel LAN, dan mencari penyebab perangkat bermasalah.",
        tags: ["Perakitan PC", "Crimping", "Troubleshooting"],
        photos: []
    }
];