# Jurnal & Catatan — Cloudflare Pages + Sveltia CMS

Website jurnal personal yang bisa diedit sendiri seperti WordPress/Blogspot, di-host gratis di Cloudflare Pages, dengan desain elegan "Kertas Klasik" yang sama persis dengan website original.

**Stack:** Eleventy (SSG) + Sveltia CMS + Cloudflare Pages + GitHub
**Biaya:** $0 hosting (Cloudflare Pages free tier) + ~$10/tahun untuk domain .com (opsional)

---

## 📁 Struktur Project

```
jurnal-cms/
├── admin/                    # Sveltia CMS admin panel
│   ├── index.html            # CMS UI entry
│   └── config.yml            # Konfigurasi collections & fields
├── src/
│   ├── _data/
│   │   └── site.json         # Site metadata (title, nav, social)
│   ├── _includes/
│   │   └── layouts/
│   │       ├── base.njk      # Layout utama (head, nav, footer)
│   │       ├── category.njk  # Layout halaman kategori
│   │       └── article.njk   # Layout artikel individual
│   ├── assets/
│   │   ├── css/style.css     # Stylesheet utama
│   │   ├── js/main.js        # JavaScript interaksi
│   │   └── uploads/          # Upload media via CMS (auto-created)
│   ├── content/              # BLOG POSTS (managed via Sveltia CMS)
│   │   ├── perjalanan/       # Jurnal Perjalanan
│   │   ├── kehidupan/        # Jurnal Kehidupan
│   │   └── pribadi/          # Tulisan Pribadi
│   ├── index.njk             # Halaman Beranda
│   ├── tentang.md            # Halaman Tentang
│   ├── jurnal-perjalanan.njk # Halaman kategori Perjalanan
│   ├── jurnal-kehidupan.njk  # Halaman kategori Kehidupan
│   └── tulisan-pribadi.njk   # Halaman kategori Tulisan
├── .eleventy.js              # Konfigurasi Eleventy
├── .gitignore
├── package.json
└── README.md                 # ← Anda di sini
```

---

## 🚀 Setup Step-by-Step (30-60 menit)

### Prasyarat
- ✅ Node.js 18+ (Anda sudah punya versi 24)
- ✅ Git terinstall (Anda sudah punya)
- ✅ Akun GitHub (gratis)
- ✅ Akun Cloudflare (gratis)

---

### Step 1: Test Build Lokal (5 menit)

```powershell
cd jurnal-cms
npm install
npm run build
```

Hasilnya folder `_site/` akan ter-generate. Untuk preview:
```powershell
npm start
# Buka http://localhost:8080
```

---

### Step 2: Push ke GitHub (10 menit)

#### 2a. Buat repo baru di GitHub
1. Buka https://github.com/new
2. Repository name: `jurnal-catatan` (atau nama lain)
3. Set **Public** (supaya Sveltia CMS bisa akses tanpa OAuth setup tambahan)
4. **JANGAN** centang "Initialize with README"
5. Klik "Create repository"

#### 2b. Push kode dari lokal
```powershell
cd jurnal-cms
git init
git add .
git commit -m "Initial commit: Jurnal & Catatan"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/jurnal-catatan.git
git push -u origin main
```

(Ganti `USERNAME-ANDA` dengan username GitHub Anda)

---

### Step 3: Deploy ke Cloudflare Pages (10 menit)

1. Login ke https://dash.cloudflare.com/
2. Klik **Workers & Pages** di sidebar → **Create** → **Pages** → **Connect to Git**
3. Pilih repository `jurnal-catatan` yang baru dibuat
4. Klik **Begin setup**
5. Isi konfigurasi build:
   - **Project name:** `jurnal-catatan` (atau nama lain)
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`
6. Klik **Save and Deploy**
7. Tunggu 1-3 menit sampai build selesai
8. Website live di: `https://jurnal-catatan.pages.dev`

---

### Step 4: Konfigurasi Sveltia CMS (5 menit)

#### 4a. Edit `admin/config.yml`
Ganti baris ini dengan repo GitHub Anda:
```yaml
backend:
  name: github
  repo: USERNAME-ANDA/jurnal-catatan   # ← GANTI INI
  branch: main
```

#### 4b. Commit & push perubahan
```powershell
git add admin/config.yml
git commit -m "Konfigurasi Sveltia CMS dengan repo GitHub"
git push
```

Cloudflare Pages akan auto-rebuild dalam ~30 detik.

#### 4c. Login ke CMS
1. Buka `https://jurnal-catatan.pages.dev/admin/`
2. Klik **Login with GitHub**
3. Authorize Sveltia CMS
4. Anda sekarang masuk ke dashboard CMS!

---

### Step 5: Coba Edit Konten Pertama (5 menit)

1. Di dashboard Sveltia CMS, klik **Jurnal Perjalanan**
2. Klik salah satu artikel (misal "Tujuh hari di Flores")
3. Edit judul atau isi
4. Klik **Save** → **Publish**
5. Sveltia akan commit ke GitHub → Cloudflare auto-rebuild
6. Dalam 30 detik, website live akan ter-update!

---

### Step 6: Beli Custom Domain (opsional, 15 menit)

#### 6a. Beli domain
Rekomendasi murah:
- **`.my.id`** di IndoWebsite (Rp 11.000/tahun pertama)
- **`.com`** di Cloudflare Registrar ($10.46/tahun, no markup)
- **`.id`** di Niagahoster (Rp 159.000/tahun)

#### 6b. Hubungkan ke Cloudflare Pages
1. Beli domain di Cloudflare Registrar (paling mudah) atau transfer ke Cloudflare
2. Di dashboard Cloudflare Pages → project Anda → **Custom domains**
3. Klik **Set up a custom domain**
4. Masukkan domain Anda (misal `jurnalcatatan.com`)
5. Cloudflare otomatis setup DNS

---

## ✏️ Cara Edit Konten via Sveltia CMS

### Tambah artikel baru
1. Buka `/admin/` di website Anda
2. Login dengan GitHub
3. Pilih koleksi (Perjalanan / Kehidupan / Tulisan)
4. Klik **New Post** (tombol kanan atas)
5. Isi field-field:
   - **Judul** — boleh pakai tag `<em>` untuk kata italic
   - **Tanggal** — otomatis
   - **Subkategori** — pilih dari dropdown
   - **Lokasi** — untuk catatan perjalanan
   - **Ringkasan** — 1-2 kalimat untuk preview
   - **Quote cover** — kutipan pendek untuk gambar sampul
   - **Waktu baca** — estimasi menit
   - **Tag** — untuk filter/search
   - **Konten Tulisan** — pakai Markdown editor
6. Klik **Save** → **Publish**

### Format Markdown yang didukung
```markdown
## Heading 2
### Heading 3

**Teks bold**
*Teks italic*
[Link text](https://url.com)

> Quote atau kutipan

- Bullet list item 1
- Bullet list item 2

![Gambar](url-gambar.jpg)

---
```

### Upload gambar
Drag-drop gambar langsung ke Markdown editor — otomatis tersimpan ke `src/assets/uploads/` dan ter-commit ke GitHub.

---

## 🛠️ Perintah Berguna

```powershell
# Build production
npm run build

# Development server dengan auto-reload
npm start

# Build output ada di folder _site/
# _site bisa di-push manual ke hosting lain jika perlu
```

---

## 📊 Update Konten

| Aksi | Cara |
|---|---|
| Tambah artikel baru | Login `/admin/` → New Post |
| Edit artikel | Login `/admin/` → pilih artikel → Edit |
| Hapus artikel | Login `/admin/` → pilih artikel → Delete |
| Upload foto | Drag-drop ke editor Markdown di CMS |
| Edit metadata site | Edit `src/_data/site.json` lalu push via git |
| Ubah styling | Edit `src/assets/css/style.css` lalu push |

---

## 🔒 Keamanan & Backup

- ✅ Konten tersimpan di **GitHub** (Anda memiliki & mengontrol penuh)
- ✅ Setiap perubahan = Git commit (history lengkap)
- ✅ Bisa rollback ke versi sebelumnya via Git
- ✅ Cloudflare Pages auto-backup deployments (30 hari)
- ✅ Multi-device: edit dari HP, laptop, tablet via browser

---

## 💰 Biaya Rinci

| Item | Biaya |
|---|---|
| Cloudflare Pages hosting | **$0** (unlimited bandwidth) |
| Cloudflare CDN & SSL | **$0** (included) |
| Sveltia CMS | **$0** (open source) |
| GitHub repo | **$0** (public) |
| Domain .com | ~$10.46/tahun (~Rp 165.000) |
| **Total minimum** | **$0/tahun** (pakai subdomain `.pages.dev`) |
| **Total dengan domain** | **~$10.46/tahun** |

---

## 🆘 Troubleshooting

### Build gagal di Cloudflare
- Cek tab "Builds" di dashboard Cloudflare Pages
- Lihat error log
- Pastikan Node version ≥ 18 (Cloudflare otomatis pakai 20)

### CMS tidak bisa login
- Pastikan repo GitHub di-set **Public** (atau setup OAuth — lebih advanced)
- Cek `admin/config.yml` — repo harus sesuai dengan GitHub URL

### Artikel baru tidak muncul
- Tunggu 1-2 menit untuk auto-deploy
- Cek tab "Deployments" di Cloudflare
- Hard refresh browser (`Ctrl + Shift + R`)

### Lupa cara edit markdown
Lihat panduan di `/admin/` → klik ikon "?" di pojok kanan atas

---

## 📚 Referensi

- **Eleventy docs:** https://www.11ty.dev/docs/
- **Sveltia CMS docs:** https://github.com/sveltia/sveltia-cms
- **Cloudflare Pages docs:** https://developers.cloudflare.com/pages/

---

## 📝 Catatan

- Project ini adalah **hasil generate AI** dengan tema "Kertas Klasik"
- Desain asli dikembangkan sebagai HTML statis, lalu di-port ke Eleventy untuk CMS support
- Tema "Kertas Klasik" menggunakan CSS variables — mudah dikustomisasi di `src/assets/css/style.css`
- File markdown mendukung frontmatter lengkap — lihat sample di `src/content/`

---

**Made with 🌿 by AI assistant, customized for Syaefullah.**
