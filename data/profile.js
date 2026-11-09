/* ============================================================
   PROFIL — hanya hal-hal yang jarang berubah.
   Foto: taruh di assets/profile/
     foto.jpg            -> foto biasa
     foto-spiderman.jpg  -> foto yang muncul saat kursor diarahkan
   (jika foto-spiderman.jpg belum ada, foto biasa diberi efek warna)
   ============================================================ */
window.DATA = window.DATA || {};

window.DATA.profile = {
    name: "Sulthan Farrel Fathurrahman",
    short: "Farrel",
    firstLine: "SULTHAN",
    secondLine: "FARREL",
    role: "Network Infrastructure",
    status: "Mahasiswa Sistem Informasi · Asisten Lab",
    tagline: "Suka mengutak-atik jaringan, dari menekan konektor kabel LAN sampai mengatur routing antar gedung.",

    about: [
        "Saya kuliah Sistem Informasi di Universitas Gunadarma, tapi yang paling bikin betah adalah ruang server dan segala isinya: router, switch, dan kabel yang rapi.",
        "Di sini saya mengumpulkan hal-hal yang pernah saya kerjakan dan pelajari. Isinya terus bertambah setiap semester."
    ],

    photo: "assets/profile/foto.jpg",
    photoAlt: "assets/profile/foto-spiderman.jpg",

    // Isi name tag yang menggantung di bagian atas halaman
    tag: {
        header: "AKSES RUANG SERVER",
        role: "NETWORK INFRA",
        sub: "Asisten Lab · LEPKOM",
        id: "ID-0001"
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