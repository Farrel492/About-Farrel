/* ============================================================
   PENGALAMAN — satu blok = satu pengalaman.
   current: true  -> lampu hijau "aktif"
   photos : daftar foto kegiatan (bisa digeser)
   text   : teks panjang ditulis di antara tanda kutip miring ` `
            (tombol di kiri angka 1). Baris kosong = paragraf baru.
   ============================================================ */
window.DATA = window.DATA || {};

window.DATA.experiences = [
  {
    title: "Magang Digital Network Marketing",
    place: "PT K-Link Indonesia",
    period: "Agu - Nov 2022",
    current: false,
    text: "Membantu pemasaran digital, mengelola marketplace, dan membuat materi promosi, serta mengikuti workshop webinar yang diadakan PT K-Link Indonesia.",
    photos: [
        "assets/experiences/magang1.jpg",
        "assets/experiences/magang2.jpg",
        "assets/experiences/magang3.jpg"
    ]
  },
  {
    title: "Asisten Laboratorium",
    place: "LEPKOM Universitas Gunadarma",
    period: "September 2025 - Sekarang",
    current: true,
    text: "Mendampingi praktikum Network, Web Development, Java, dan Database. Selain itu saya menjadi tutor di bidang network dan penanggung jawab ruangan selama kursus berlangsung.",
    photos: [
        "assets/experiences/aslab1.jpg",
        "assets/experiences/aslab2.jpg",
        "assets/experiences/aslab3.jpg",
        "assets/experiences/aslab4.jpg",
        "assets/experiences/aslab5.jpg",
        "assets/experiences/aslab6.jpg",
        "assets/experiences/aslab7.jpg",
        "assets/experiences/aslab8.jpg",
        "assets/experiences/aslab9.jpg",
        "assets/experiences/aslab10.jpg"
    ]
  },
  {
    title: "Tim Teknis Laboratorium",
    place: "LEPKOM Universitas Gunadarma",
    period: "April 2026 - Sekarang",
    current: true,
    text: `Technical Support & IT Infrastructure

Melakukan cable management dan pemeliharaan jalur kabel PC serta monitor di ruang praktikum untuk meningkatkan kerapian instalasi dan mempermudah proses troubleshooting.

Terlibat dalam penanganan insiden kerusakan UPS pada infrastruktur server, termasuk identifikasi awal, koordinasi tim, dan tindakan pencegahan terhadap perangkat laboratorium.

Membantu operasional server melalui VMware vSphere, termasuk proses shutdown dan penyesuaian koneksi daya server saat penanganan insiden.

Melakukan inspeksi dan dokumentasi kondisi internal UPS bersama tim teknis untuk mengidentifikasi komponen yang mengalami kerusakan.

Melakukan troubleshooting perangkat PC client dan PC laboratorium melalui pemeriksaan komponen, pengujian, serta pencatatan hasil diagnosis dan tindakan penanganan.`,
    photos: [
       "assets/experiences/teknis1.jpg",
       "assets/experiences/teknis2.jpg",
       "assets/experiences/teknis3.jpg",
       "assets/experiences/teknis4.jpg",
       "assets/experiences/teknis5.jpg",
       "assets/experiences/teknis6.jpg",
       "assets/experiences/teknis7.jpg",
       "assets/experiences/teknis8.jpg",
       "assets/experiences/teknis9.jpg",
       "assets/experiences/teknis10.jpg",
       "assets/experiences/teknis11.jpg",
       "assets/experiences/teknis12.jpg",
       "assets/experiences/teknis13.jpg"
    ]
  }
];