# EcoPoint 🌿

EcoPoint adalah platform manajemen sampah dan daur ulang berbasis web. Aplikasi ini menghubungkan masyarakat (Nasabah) dengan Petugas dan Admin untuk mengelola penyetoran sampah daur ulang, penjemputan sampah, pelaporan tumpukan sampah liar, serta sistem poin yang dapat ditukarkan dengan berbagai hadiah (Rewards).

## 🚀 Fitur Utama

- **Penyetoran Sampah (Deposit):** Pengguna dapat menyetor sampah ke fasilitas dan mendapatkan poin setelah diverifikasi oleh Petugas.
- **Penjemputan Sampah (Pickup):** Pengguna dapat menjadwalkan penjemputan sampah langsung dari rumah.
- **Pelaporan Sampah (Report):** Pengguna dapat melaporkan tumpukan sampah ilegal di lingkungan sekitar dilengkapi foto dan lokasi.
- **Tukar Poin (Rewards):** Poin yang dikumpulkan dapat ditukar dengan pulsa, voucher, atau merchandise.
- **Leaderboard:** Papan peringkat pengguna paling aktif untuk meningkatkan semangat daur ulang.
- **Multi-Role Access:** Dashboard khusus yang disesuaikan untuk peran `USER` (Nasabah), `PETUGAS` (Verifikator), dan `ADMIN` (Manajemen Penuh).

## 🛠 Teknologi yang Digunakan

Aplikasi ini menggunakan stack teknologi modern dengan fokus pada keamanan (DevSecOps):

- **Frontend:** Next.js (App Router), React, TailwindCSS
- **Backend:** Next.js API Routes, NextAuth.js untuk autentikasi (JWT)
- **Database:** MySQL 8.0 (koneksi menggunakan `mysql2/promise` pool)
- **Web Server & Reverse Proxy:** Nginx
- **Keamanan (WAF):** OWASP ModSecurity Core Rule Set (CRS) terintegrasi pada Nginx
- **Infrastruktur:** Docker & Docker Compose untuk deployment yang terisolasi

---

## 📖 Installation Guide (Deployment Lingkungan Production/VM)

Berikut adalah panduan untuk menjalankan EcoPoint menggunakan Docker Compose. Aplikasi ini didesain agar sangat mudah di-deploy di VPS (Virtual Private Server) atau VM lokal.

### 1. Persyaratan Sistem
Pastikan sistem Anda sudah terinstal:
- **Git**
- **Docker** dan **Docker Compose**

### 2. Clone Repository
```bash
git clone <url-repository-ecopoint>
cd EcoPoint
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Edit file `.env` dan sesuaikan nilainya. **Penting:**
- `NEXTAUTH_URL`: Wajib diisi dengan URL atau IP persis yang Anda gunakan di browser (contoh: `https://192.168.1.89` atau `https://domainanda.com`). Jika berbeda, proses login akan diblokir dengan pesan `403 Forbidden` (Keamanan CSRF).
- `DATABASE_URL`: Pastikan tanda kutip dihilangkan, dan jika password Anda mengandung karakter `@`, ubah menjadi `%40`.
  Contoh: `DATABASE_URL=mysql://ecopoint_user:EcoPoint%402025!@db:3306/ecopoint`

### 4. Menjalankan Aplikasi (Docker Compose)
Aplikasi EcoPoint dibungkus ke dalam tiga container: `app` (Next.js), `db` (MySQL), dan `nginx` (Web Server & WAF).
Jalankan perintah berikut:
```bash
docker compose up -d --build
```
Tunggu beberapa saat hingga proses *build* selesai dan semua container berstatus `Up`.

### 5. Setup Database (Manual SQL Dump)
Proyek ini **TIDAK** menggunakan Prisma (baik untuk schema maupun seeding). Database dibangun dan diakses menggunakan SQL tradisional.
Untuk mengisi struktur tabel dan data bawaan (production data), Anda wajib mengimpor file SQL dump (`.sql`) secara manual ke dalam container database.

Contoh cara impor dump dari VM Anda ke dalam MySQL Docker:
```bash
# Asumsi Anda memiliki file ecopoint_dump.sql di server
cat ecopoint_dump.sql | docker exec -i ecopoint_db mysql -u root -pPasswordRootAnda ecopoint
```

### 6. Akses Aplikasi
Setelah database terisi, buka browser Anda dan akses `NEXTAUTH_URL` yang telah Anda atur.
Untuk menguji aplikasi, gunakan akun yang sudah tersedia di *SQL dump* Anda (misalnya Admin, Petugas, atau User reguler).

---

## 🔒 Keamanan & Infrastruktur Nginx
- **HTTPS & SSL:** Nginx telah dikonfigurasi untuk menjalankan aplikasi via jalur HTTPS (port 443) dengan dukungan HTTP/2. Pastikan file `cert.pem` dan `key.pem` yang sah diletakkan di `nginx/ssl/` (atau ubah permissionnya menjadi `644` bila menggunakan *self-signed cert*).
- **ModSecurity WAF:** Aplikasi dilindungi oleh perlindungan *Web Application Firewall* OWASP untuk menangkis berbagai serangan seperti SQL Injection, XSS, dan anomali payload lainnya.
- **Read-Only Container:** Container Next.js berjalan dengan *Read-Only Root Filesystem* untuk meminimalisasi risiko modifikasi file secara ilegal dari dalam container.

## 🤝 Kontribusi
Bila Anda menemukan *bug* atau ingin menambahkan fitur baru, silakan buat *Pull Request* atau *Issue* di repositori ini.

Terima kasih telah menggunakan dan mengembangkan **EcoPoint** demi lingkungan yang lebih bersih! 🌍♻️
