/* ============================================================
   PROFIL — hanya hal-hal yang jarang berubah.
   Foto: taruh di assets/profile/
     nametag.jpeg   -> foto biasa (bagian Tentang)
     spiderman.jpg  -> foto yang muncul pelan-pelan saat kursor diarahkan
     foto-tag.jpg   -> foto wajah bulat di name tag (opsional, lihat tag.photo)
   (jika foto alternatif belum ada, foto biasa diberi efek warna)
   ============================================================ */
window.DATA = window.DATA || {};

window.DATA.profile = {
    name: "Sulthan Farrel Fathurrahman",
    short: "Sulthan Farrel Fathurrahman",
    firstLine: "SULTHAN FARREL",
    secondLine: "FATHURRAHMAN",
    role: "Network Infrastructure, Network Engineering, Web Development, IT Management, IT Support, IT Consultant",
    status: "Mahasiswa Sistem Informasi · Asisten LEPKOM",
    tagline: "Berfokus pada perancangan dan pengembangan solusi digital, pengelolaan sistem teknologi informasi,",

    about: [
        "Halo! Saya Sulthan Farrel Fathurrahman, mahasiswa S1 Sistem Informasi Universitas Gunadarma yang memiliki ketertarikan luas dalam bidang teknologi informasi dan pengembangan solusi digital.",
        "Saya memiliki minat pada Web Development, IT Management, IT Support, IT Consulting, dan Network Engineering. Saya senang mengeksplorasi bagaimana teknologi dapat dimanfaatkan untuk membangun aplikasi, mengelola sistem informasi, merancang infrastruktur, serta menyelesaikan berbagai permasalahan teknis.",
        "Dalam pengembangan web, saya tertarik pada proses perancangan UI/UX, pengembangan frontend dan backend, integrasi database, serta pemanfaatan teknologi AI sebagai alat bantu dalam proses pengembangan.",
        "Selain kegiatan akademik, saya aktif sebagai Asisten Laboratorium di LEPKOM Universitas Gunadarma. Pengalaman tersebut memberikan kesempatan bagi saya untuk mengembangkan kemampuan komunikasi, kolaborasi, pendampingan praktikum, pengelolaan fasilitas IT, serta keterlibatan dalam kegiatan teknis dan pengembangan sistem.",
        "Saya percaya bahwa kemampuan di bidang teknologi informasi tidak hanya dibangun melalui teori, tetapi juga melalui praktik langsung, eksplorasi teknologi, kolaborasi, dan pengalaman dalam menyelesaikan permasalahan nyata.",
        "Saya terus berupaya mengembangkan kemampuan dan memperluas wawasan agar dapat berkontribusi dalam menghadirkan solusi teknologi yang efektif, inovatif, dan bermanfaat."
    ],

    photo: "assets/profile/nametag.jpeg",
    photoAlt: "assets/profile/spiderman.jpg",

    // Isi name tag yang menggantung di bagian atas halaman
    tag: {
        header: "LEPKOM Gunadarma",
        photo: "assets/profile/nametag.jpeg",   // foto wajah untuk lingkaran di name tag
        id: "",                                  // isi nomor ID jika ingin ditampilkan, contoh: "J1625009"
        role: "Assisten & Teknis",                          // tulisan di label hijau
        sub: "Asisten Lab · LEPKOM"
    },

    // Kosongkan ("") untuk menyembunyikan salah satu
    links: {
        email: "farrelsulthan22@gmail.com",
        github: "https://github.com/Farrel492",
        linkedin: "https://www.linkedin.com/in/slthnfarrel",
        youtube: "https://www.youtube.com/@parrel_",
        whatsapp: "6282123871280"
    }
};