# Photobox App

Aplikasi web untuk membuat photobox digital: upload/jepret foto, pilih layout & template, hias dengan sticker dan teks, lalu unduh hasilnya sebagai PNG atau lewat QR Code.

## Menjalankan dengan Docker (disarankan)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Menjalankan tanpa Docker

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend** (di terminal terpisah)
```bash
cd frontend
npm install
npm run dev
```

## Ringkasan perbaikan yang sudah dilakukan

- Melengkapi seluruh komponen yang sebelumnya kosong (`PropertiesPanel`, `DecorateTab`, `TextTab`, dll) sehingga aplikasi tidak lagi crash.
- Memperbaiki import ikon dari `react-icons/fa` yang tidak valid.
- Menyamakan nama field & endpoint upload antara frontend dan backend.
- Menambahkan `tailwind.config.js` dan `postcss.config.js` yang sebelumnya hilang, sehingga styling benar-benar aktif.
- Menambahkan dependency `uuid` yang terpakai di kode tapi belum terdaftar di `package.json`.
- Membuat ulang seluruh tampilan (Home, Editor, History, Navbar, Footer) dengan tema warna-warni modern (gradient ungu-pink-oranye), responsif untuk mobile.
- Menghubungkan pemilihan layout ke pembuatan frame otomatis di kanvas, serta fitur auto-fit foto ke frame kosong.
- Menambahkan fitur ambil foto lewat kamera (WebRTC) yang sebelumnya hanya tombol kosong.
- Mengganti referensi gambar template yang rusak (file tidak ada) dengan gradient warna dinamis.

## Deploy gratis (Frontend di Netlify, Backend di Render)

Karena riwayat foto sekarang tersimpan di browser masing-masing pengguna (bukan di server), backend tidak perlu penyimpanan permanen — jadi cocok dengan free tier Render. Berikut langkah lengkapnya.

### 1. Push kode ini ke GitHub
Kedua platform butuh repo GitHub untuk deploy otomatis.

### 2. Deploy Backend ke Render
1. Buka [render.com](https://render.com) → **New +** → **Web Service**
2. Hubungkan repo GitHub kamu
3. Isi konfigurasi:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
4. Tambahkan Environment Variable:
   - `BASE_URL` = `https://nama-service-kamu.onrender.com` (isi setelah Render kasih tahu URL-nya — dipakai supaya QR Code yang dibuat mengarah ke link yang benar, bukan `localhost`)
5. Deploy, lalu catat URL backend-nya (contoh: `https://photobox-backend.onrender.com`)

**Catatan penting free tier Render:** service otomatis "tidur" setelah 15 menit tidak ada yang akses, dan butuh ~30-60 detik untuk bangun lagi saat ada request pertama setelah itu. Ini normal untuk free tier, bukan bug.

### 3. Deploy Frontend ke Netlify
1. Buka [netlify.app](https://netlify.app) → **Add new site** → **Import an existing project**
2. Hubungkan repo GitHub yang sama (konfigurasi build sudah otomatis kebaca dari `netlify.toml` di root repo)
3. Tambahkan Environment Variable di Netlify (**Site settings → Environment variables**):
   - `VITE_BACKEND_URL` = URL backend Render dari langkah 2 (contoh: `https://photobox-backend.onrender.com`, **tanpa** garis miring/`/api` di akhir)
4. Deploy

Setelah kedua langkah selesai, web kamu bisa diakses siapa saja lewat URL Netlify-nya, dan otomatis terhubung ke backend di Render.

### Kalau nanti mau ganti ke hosting lain
Yang penting cuma dua environment variable ini:
- Frontend butuh `VITE_BACKEND_URL` mengarah ke URL backend
- Backend butuh `BASE_URL` mengarah ke URL publik backend itu sendiri (dipakai untuk generate QR Code)

## Struktur folder

```
photobox-app/
├── backend/          # Express API (upload, edit gambar via sharp, generate hasil & QR)
└── frontend/          # React + Vite
```
