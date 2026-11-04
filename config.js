// =====================================================================
//  PENGATURAN PORTOFOLIO — cukup edit file ini.
// =====================================================================
window.PORTFOLIO_CONFIG = {
  // 1) Isi dari Supabase: Project Settings → API.
  //    Biarkan kosong ("") untuk mode pratinjau (form tidak menyimpan apa pun).
  supabaseUrl: "",
  supabaseAnonKey: "",

  // 2) Foto untuk kartu mahasiswa (opsional). Contoh: "foto.jpg" (taruh di folder yang sama).
  foto: "",

  // 3) Akun media sosial. Ganti "url" dan "nama" dengan akun Anda; hapus baris yang tidak dipakai.
  sosial: [
    { label: "Instagram", nama: "@gungdk_12", url: "https://instagram.com/@gungdk_12" },
    { label: "TikTok",    nama: "@agungdk12_", url: "https://www.tiktok.com/@agungdk12_" },
    { label: "LinkedIn",  nama: "Agung Dwi Kuncoro", url: "https://www.linkedin.com/in/agungdk" },
    { label: "Email",     nama: "agungdwikuncoro3@gmail.com", url: "" } // email ditampilkan sebagai teks
  ]
};
