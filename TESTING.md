# EcoPoint - Sistem Pengelolaan Sampah & Reward

Selamat datang di repositori **EcoPoint**! Aplikasi ini merupakan platform berbasis web untuk memfasilitasi pelaporan, penjemputan, dan penyetoran sampah yang dapat ditukar dengan poin serta hadiah (*rewards*).

Aplikasi ini dibangun menggunakan **Next.js 16 (App Router)**, **Tailwind CSS**, dan **MySQL** sebagai basis data.

---

## 📋 Persyaratan Sistem (*Prerequisites*)

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:
- **Node.js** (versi 18.x atau lebih baru)
- **NPM** atau **Yarn** atau **PNPM**
- **MySQL Server** (versi 8.x disarankan, pastikan sedang berjalan di sistem Anda)
- **Git**

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk melakukan *setup* proyek di mesin lokal Anda:

### 1. Clone Repositori
Clone repositori ini ke komputer Anda dan masuk ke direktori proyek:
```bash
git clone https://github.com/Viktorikus/EcoPoint.git
cd EcoPoint
```

### 2. Instalasi Dependensi
Jalankan perintah berikut untuk mengunduh semua paket yang dibutuhkan:
```bash
npm install
```

### 3. Setup Database (MySQL)
1. Buka MySQL client favorit Anda (seperti phpMyAdmin, DBeaver, atau via terminal).
2. Buat database baru dengan nama `ecopoint`:
   ```sql
   CREATE DATABASE ecopoint;
   ```
3. *(Opsional)* Jika ada file `schema.sql`, jalankan untuk membuat struktur tabel. Jika tidak, aplikasi menggunakan *script seeding* (langkah 5) untuk mempersiapkan data awal.

### 4. Konfigurasi Environment Variables
1. Duplikat file `.env.example` menjadi `.env` (atau buat file `.env` baru di *root directory*).
2. Sesuaikan konfigurasi koneksi *database* dan *Auth Secret*:
   ```env
   # Database Configuration (sesuaikan dengan MySQL Anda)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ecopoint

   # NextAuth / Security (Bisa menggunakan string acak atau hasil dari 'openssl rand -base64 32')
   NEXTAUTH_SECRET=rahasia-ecopoint-super-aman
   NEXTAUTH_URL=http://localhost:3000
   ```

### 5. Setup / Seed Data Awal (*Dummy Data*)
Proyek ini sudah dilengkapi skrip pintar untuk me-*reset* dan mengisi data simulasi (kategori sampah, *rewards*, akun, transaksi, dll.) secara otomatis.
Jalankan perintah berikut:
```bash
npx tsx scripts/seed-all.ts
```
> **Catatan:** Skrip ini akan membuat tabel secara tidak langsung (jika kode migrasi disertakan) atau langsung mengisi *database* `ecopoint` Anda dengan data fiktif siap pakai.

### 6. Menjalankan Aplikasi (Development)
Untuk menjalankan aplikasi di tahap pengembangan:
```bash
npm run dev
```
Buka browser Anda dan akses: **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Akun Akses Pengujian (*Dummy Accounts*)

Setelah skrip *seed* di atas selesai, Anda dapat langsung *login* untuk mengetes setiap peran (*role*) yang ada menggunakan akun berikut:

### 1. Admin (Akses Penuh / Dasbor Utama)
- **Email:** `admin@ecopoint.com`
- **Password:** `admin123`

### 2. Petugas (Panel Verifikasi & Status Penjemputan)
- **Email:** `petugas@ecopoint.com`
- **Password:** `petugas123`

### 3. Pengguna / User (Lapor, Setor, Tukar Poin)
- **Email:** `user1@ecopoint.com` *(atau user2@ecopoint.com)*
- **Password:** `user123`

---

## 🛠️ Build untuk Produksi (Production)

Jika Anda ingin mem-*build* dan menjalankan aplikasi layaknya di server *production*:
```bash
npm run build
npm run start
```

---

**Selamat Mencoba!** Jika Anda menemukan kendala saat menjalankan proyek ini, pastikan kredensial database di `.env` sudah benar dan MySQL service sedang berjalan.
