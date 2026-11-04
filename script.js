(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var CFG = window.PORTFOLIO_CONFIG || {};
  var kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------------
     1. LOADER — angka persen naik, lalu menghilang
  ------------------------------------------------------------------ */
  (function loader() {
    var el = $("loader"), angka = $("loader-angka"), bar = $("loader-bar");
    if (!el) return;
    var nilai = 0, siap = false, mulai = Date.now();
    window.addEventListener("load", function () { siap = true; });
    setTimeout(function () { siap = true; }, 2200);
    (function langkah() {
      var target = siap ? 100 : 90;
      nilai += Math.max(1, (target - nilai) * 0.08);
      if (nilai > target) nilai = target;
      angka.textContent = Math.round(nilai);
      bar.style.width = nilai + "%";
      if (nilai >= 100 && Date.now() - mulai > 600) {
        el.classList.add("selesai");
        return;
      }
      setTimeout(langkah, 30);
    })();
  })();

  /* ------------------------------------------------------------------
     2. ADEGAN 3D — bangun ruang kapur melayang (Three.js)
  ------------------------------------------------------------------ */
  (function adegan3D() {
    var kanvas = $("kanvas-3d");
    if (!kanvas || typeof THREE === "undefined") return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: kanvas, antialias: true, alpha: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var kamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    kamera.position.set(0, 0, 14);

    var kapur = new THREE.Color("#ecebe3"), kunyit = new THREE.Color("#f0b13c"), daun = new THREE.Color("#7cc4a4");
    var bentuk = [
      { g: new THREE.BoxGeometry(1.8, 1.8, 1.8), w: kunyit, p: [4.6, 1.6, 0] },          // kubus
      { g: new THREE.ConeGeometry(1.3, 2, 4), w: kapur, p: [6.8, -1.8, -1] },             // limas segi empat
      { g: new THREE.CylinderGeometry(0.9, 0.9, 2, 16, 1), w: daun, p: [2.6, -2.4, 1] },  // tabung
      { g: new THREE.ConeGeometry(1, 2, 18), w: kapur, p: [-6.5, 2.4, -2] },              // kerucut
      { g: new THREE.IcosahedronGeometry(1.1, 1), w: daun, p: [7.6, 3.2, -3] },           // bola (bersegi)
      { g: new THREE.BoxGeometry(2.4, 1.2, 1.2), w: kapur, p: [-4.6, -3, -1] },           // balok
      { g: new THREE.TetrahedronGeometry(1.1), w: kunyit, p: [0.6, 3.6, -4] }             // limas segitiga
    ];
    var benda = bentuk.map(function (b, i) {
      var garis = new THREE.LineSegments(
        new THREE.EdgesGeometry(b.g),
        new THREE.LineBasicMaterial({ color: b.w, transparent: true, opacity: 0.9 })
      );
      garis.position.set(b.p[0], b.p[1], b.p[2]);
      garis.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      garis.userData = { dasarY: b.p[1], fase: i * 1.3, laju: 0.15 + Math.random() * 0.25 };
      scene.add(garis);
      return garis;
    });

    // debu kapur
    var jumlah = 420, posisi = new Float32Array(jumlah * 3);
    for (var i = 0; i < jumlah; i++) {
      posisi[i * 3] = (Math.random() - 0.5) * 30;
      posisi[i * 3 + 1] = (Math.random() - 0.5) * 16;
      posisi[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
    }
    var geoDebu = new THREE.BufferGeometry();
    geoDebu.setAttribute("position", new THREE.BufferAttribute(posisi, 3));
    var debu = new THREE.Points(geoDebu, new THREE.PointsMaterial({ color: kapur, size: 0.05, transparent: true, opacity: 0.55 }));
    scene.add(debu);

    var mouse = { x: 0, y: 0 }, grup = scene;
    window.addEventListener("pointermove", function (e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function ukur() {
      var w = kanvas.clientWidth, h = kanvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      // di layar sempit, mundurkan kamera agar bentuk tidak menutupi teks
      kamera.position.z = w < 720 ? 20 : 14;
      kamera.updateProjectionMatrix();
    }
    window.addEventListener("resize", ukur);
    ukur();

    var terlihat = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { terlihat = en[0].isIntersecting; }).observe(kanvas);
    }

    var jam = new THREE.Clock();
    function gambar() {
      var t = jam.getElapsedTime();
      benda.forEach(function (b) {
        b.rotation.x += 0.003 + b.userData.laju * 0.004;
        b.rotation.y += 0.004 + b.userData.laju * 0.005;
        b.position.y = b.userData.dasarY + Math.sin(t * 0.8 + b.userData.fase) * 0.35;
      });
      debu.rotation.y = t * 0.02;
      kamera.position.x += (mouse.x * 1.4 - kamera.position.x) * 0.04;
      kamera.position.y += (-mouse.y * 0.9 - kamera.position.y) * 0.04;
      kamera.lookAt(0, 0, 0);
      renderer.render(scene, kamera);
    }
    if (kurangiGerak) { gambar(); return; }
    (function putar() {
      if (terlihat) gambar();
      requestAnimationFrame(putar);
    })();
  })();

  /* ------------------------------------------------------------------
     3. KARTU MAHASISWA — miring mengikuti kursor
  ------------------------------------------------------------------ */
  (function kartu() {
    var k = $("kartu-mhs");
    if (!k) return;
    if (CFG.foto) {
      var img = new Image();
      img.alt = "Foto Agung Dwi Kuncoro";
      img.src = CFG.foto;
      img.onload = function () { var f = $("kartu-foto"); f.textContent = ""; f.appendChild(img); };
    }
    if (kurangiGerak) return;
    k.addEventListener("pointermove", function (e) {
      var r = k.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      k.style.transform = "rotateY(" + ((x - 0.5) * 18) + "deg) rotateX(" + ((0.5 - y) * 18) + "deg)";
      k.style.setProperty("--mx", x * 100 + "%");
      k.style.setProperty("--my", y * 100 + "%");
    });
    k.addEventListener("pointerleave", function () { k.style.transform = ""; });
  })();

  /* ------------------------------------------------------------------
     4. TAB PORTOFOLIO
  ------------------------------------------------------------------ */
  (function tab() {
    var tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) {
          var aktif = x === t;
          x.setAttribute("aria-selected", aktif ? "true" : "false");
          $(x.getAttribute("aria-controls")).hidden = !aktif;
        });
      });
    });
  })();

  /* ------------------------------------------------------------------
     5. ANIMASI MASUK & PENGHITUNG ANGKA
  ------------------------------------------------------------------ */
  (function muncul() {
    if (kurangiGerak || !("IntersectionObserver" in window)) return;
    var el = document.querySelectorAll(".muncul");
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.remove("tunggu"); io.unobserve(x.target); }
      });
    }, { threshold: 0.15 });
    el.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top > window.innerHeight) { e.classList.add("tunggu"); io.observe(e); }
    });

    var angka = document.querySelectorAll("[data-hitung]");
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        io2.unobserve(x.target);
        var akhir = +x.target.dataset.hitung, n = 0;
        var iv = setInterval(function () {
          n++; x.target.textContent = n;
          if (n >= akhir) clearInterval(iv);
        }, 120);
      });
    }, { threshold: 0.6 });
    angka.forEach(function (a) { a.textContent = "0"; io2.observe(a); });
  })();

  /* ------------------------------------------------------------------
     6. MEDIA SOSIAL dari config.js
  ------------------------------------------------------------------ */
  (function sosial() {
    var wadah = $("daftar-sosial");
    if (!wadah) return;
    (CFG.sosial || []).forEach(function (s) {
      var a = document.createElement(s.url ? "a" : "div");
      if (s.url) { a.href = s.url; a.target = "_blank"; a.rel = "noopener"; }
      else { a.className = "sosial-teks"; a.style.cssText = "display:flex;justify-content:space-between;gap:12px;padding:16px 18px;border:1px solid var(--garis);border-radius:var(--radius);background:var(--papan-2)"; }
      var b = document.createElement("b"); b.textContent = s.label;
      var sp = document.createElement("span"); sp.textContent = s.nama;
      a.appendChild(b); a.appendChild(sp);
      wadah.appendChild(a);
    });
  })();

  var tahun = $("tahun");
  if (tahun) tahun.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     7. BACKEND — Supabase (pesan kontak & komentar)
  ------------------------------------------------------------------ */
  var db = null;
  try {
    if (CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase) {
      db = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
    }
  } catch (e) { db = null; }
  if (!db) { $("demo-pesan").hidden = false; $("demo-komentar").hidden = false; }

  function status(el, teks, jenis) {
    el.textContent = teks;
    el.className = "form-status" + (jenis ? " " + jenis : "");
  }
  function bersih(s) { return String(s || "").trim(); }

  // --- Form pesan kontak ---
  $("form-pesan").addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("pesan-status"), btn = $("pesan-kirim");
    var data = { nama: bersih($("pesan-nama").value), email: bersih($("pesan-email").value), pesan: bersih($("pesan-isi").value) };
    if (!data.nama || !data.pesan) return status(st, "Nama dan pesan wajib diisi.", "gagal");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return status(st, "Format email belum benar, contoh: nama@gmail.com.", "gagal");
    if (!db) return status(st, "Pesan belum terkirim: ini mode pratinjau tanpa database.", "gagal");
    btn.disabled = true; status(st, "Mengirim…");
    db.from("pesan").insert(data).then(function (r) {
      btn.disabled = false;
      if (r.error) return status(st, "Pesan gagal terkirim. Periksa koneksi lalu coba lagi.", "gagal");
      e.target.reset();
      status(st, "Terima kasih! Pesan Anda sudah saya terima.", "ok");
    });
  });

  // --- Komentar ---
  var komentar = [];
  var WARNA = ["#f0b13c", "#7cc4a4", "#e8a0bf", "#9cc0f0", "#f0c9a0"];

  function waktuLalu(iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return "baru saja";
    if (d < 3600) return Math.floor(d / 60) + " menit lalu";
    if (d < 86400) return Math.floor(d / 3600) + " jam lalu";
    if (d < 86400 * 30) return Math.floor(d / 86400) + " hari lalu";
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function tampilkan() {
    var ul = $("daftar-komentar");
    $("jumlah-komentar").textContent = komentar.length;
    ul.textContent = "";
    if (!komentar.length) {
      var k = document.createElement("li"); k.className = "kosong";
      var b = document.createElement("b"); b.textContent = "Papan masih bersih";
      k.appendChild(b); k.appendChild(document.createTextNode("Belum ada komentar. Jadilah yang pertama menulis."));
      ul.appendChild(k); return;
    }
    komentar.forEach(function (c) {
      var li = document.createElement("li"); li.className = "kom";
      var av = document.createElement("div"); av.className = "kom-avatar";
      av.textContent = (c.nama || "?").charAt(0).toUpperCase();
      var h = 0; for (var i = 0; i < c.nama.length; i++) h = (h + c.nama.charCodeAt(i)) % WARNA.length;
      av.style.background = WARNA[h];
      var isi = document.createElement("div");
      var kepala = document.createElement("div"); kepala.className = "kom-kepala";
      var nm = document.createElement("b"); nm.textContent = c.nama;
      var wk = document.createElement("small"); wk.textContent = waktuLalu(c.dibuat);
      kepala.appendChild(nm); kepala.appendChild(wk);
      var p = document.createElement("p"); p.textContent = c.isi;
      isi.appendChild(kepala); isi.appendChild(p);
      li.appendChild(av); li.appendChild(isi);
      ul.appendChild(li);
    });
  }

  function muatKomentar() {
    if (!db) return tampilkan();
    db.from("komentar").select("id,nama,isi,dibuat").order("dibuat", { ascending: false }).limit(100)
      .then(function (r) {
        if (r.error) { status($("kom-status"), "Komentar belum bisa dimuat. Coba muat ulang halaman.", "gagal"); return; }
        komentar = r.data || [];
        tampilkan();
      });
  }

  if (db) {
    // komentar baru dari pengunjung lain langsung muncul (Realtime)
    try {
      db.channel("komentar-baru")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "komentar" }, function (p) {
          if (!komentar.some(function (c) { return c.id === p.new.id; })) { komentar.unshift(p.new); tampilkan(); }
        })
        .subscribe();
    } catch (e) {}
  }

  $("form-komentar").addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("kom-status"), btn = $("kom-kirim");
    var data = { nama: bersih($("kom-nama").value).slice(0, 40), isi: bersih($("kom-isi").value).slice(0, 500) };
    if (!data.nama || !data.isi) return status(st, "Nama dan komentar wajib diisi.", "gagal");
    if (!db) {
      komentar.unshift({ id: "lokal-" + Date.now(), nama: data.nama, isi: data.isi, dibuat: new Date().toISOString() });
      tampilkan(); e.target.reset();
      return status(st, "Tampil di layar Anda saja (mode pratinjau).", "ok");
    }
    btn.disabled = true; status(st, "Mengirim…");
    db.from("komentar").insert(data).select("id,nama,isi,dibuat").single().then(function (r) {
      btn.disabled = false;
      if (r.error) return status(st, "Komentar gagal terkirim. Coba lagi sebentar.", "gagal");
      if (!komentar.some(function (c) { return c.id === r.data.id; })) komentar.unshift(r.data);
      tampilkan(); e.target.reset();
      status(st, "Komentar terkirim. Terima kasih!", "ok");
    });
  });

  muatKomentar();
  setInterval(function () { if (komentar.length) tampilkan(); }, 60000); // segarkan "x menit lalu"
})();
