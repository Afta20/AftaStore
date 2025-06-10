# Afta-Store | E-Commerce Platform

<div align="center">
  <img src="./docs/Afta-Store.png" alt="Afta-Store Banner" width="600"/>
</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-1B222D?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.x-000000?style=for-the-badge&logo=next-auth&logoColor=white)](https://next-auth.js.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

</div>

<p align="center">
  Aplikasi e-commerce modern dengan fitur lengkap yang dibangun menggunakan Next.js App Router, Prisma, dan NextAuth.js.
</p>

<div align="center">
  <strong><a href="https://aftastore.vercel.app/">Lihat Live Demo »</a></strong>
</div>
<br/>

![Afta-Store Demo GIF](link-ke-gif-demo-anda.gif)

---

## 📖 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Struktur Proyek](#-struktur-proyek)
- [Tumpukan Teknologi & Alasan](#-tumpukan-teknologi--alasan)
- [Memulai](#-memulai)
- [Rencana Pengembangan](#-rencana-pengembangan)
- [Kontak](#-kontak)

---

## 📝 Tentang Proyek

Afta-Store adalah aplikasi web e-commerce fungsional yang mensimulasikan toko ritel online. Proyek ini mencakup seluruh alur belanja pengguna, mulai dari melihat produk, menambahkan ke keranjang dan wishlist, hingga proses checkout dan melihat riwayat pesanan yang akurat berkat implementasi *data snapshotting*.

Proyek ini dirancang untuk menunjukkan penerapan praktik terbaik dalam pengembangan web modern, termasuk arsitektur Server & Client Component, otentikasi yang aman, manajemen state yang efisien, dan interaksi database yang *type-safe*.

Untuk Login Dashboard admin disini saya melakukan pengaturan User dan password berupa 
Acc : AkuAdmin@gmail.com
Pw  : AkuAdmin2004

## ✨ Fitur Utama

-   **Otentikasi Pengguna**: Sistem login dan registrasi aman menggunakan NextAuth.js dengan provider Credentials.
-   **Penjelajahan Produk**: Halaman toko dinamis yang mengambil data langsung dari database, lengkap dengan fitur pencarian.
-   **Manajemen Keranjang & Wishlist**: Manajemen state sisi klien yang efisien menggunakan Redux Toolkit.
-   **Proses Checkout & Riwayat Pesanan**: Alur pemesanan yang menyimpan "snapshot" produk untuk memastikan detail pesanan historis tidak berubah.
-   **Manajemen Akun Pengguna**: Dasbor pribadi untuk melihat profil, alamat, dan riwayat pesanan.
-   **Panel Admin (Dasar)**: Kemampuan untuk melihat semua pesanan dan mengubah statusnya.

## 📂 Struktur Proyek

Struktur folder utama proyek ini diatur untuk skalabilitas dan kemudahan pengelolaan:

```
/
├── src/
│   ├── app/                # App Router: Halaman, Layouts, dan API Routes
│   │   ├── (site)/         # Route group untuk halaman utama
│   │   ├── admin/          # Route untuk panel admin
│   │   └── api/            # API endpoints
│   ├── components/         # Komponen React yang dapat digunakan kembali
│   ├── lib/                # Kode bantuan (Prisma client, konfigurasi auth)
│   ├── redux/              # Konfigurasi Redux store dan slices
│   └── types/              # Definisi tipe data global (TypeScript)
├── prisma/                 # Skema dan migrasi database Prisma
└── public/                 # Aset statis (gambar, ikon)
```

## 🛠️ Tumpukan Teknologi & Alasan

| Teknologi                                                              | Alasan Pemilihan                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Next.js (App Router)** | Memberikan performa optimal dengan Server Components untuk pengambilan data dan Client Components untuk interaktivitas.        |
| **React** | Pustaka UI yang kuat dan populer untuk membangun antarmuka pengguna yang dinamis dan terstruktur.                                |
| **Tailwind CSS** | Utility-first CSS framework untuk membangun desain kustom dengan cepat tanpa meninggalkan file HTML.                            |
| **Prisma** | ORM modern yang menyediakan akses database yang *type-safe*, migrasi yang mudah, dan auto-completion yang sangat membantu.      |
| **PostgreSQL** | Database relasional yang kuat, andal, dan sangat cocok untuk aplikasi dengan struktur data yang kompleks seperti e-commerce.     |
| **NextAuth.js** | Solusi otentikasi lengkap untuk Next.js, mempermudah implementasi login dengan berbagai provider.                               |
| **Redux Toolkit** | Standar industri untuk manajemen state global yang terprediksi, disederhanakan untuk pengalaman developer yang lebih baik.      |

## 🚀 Memulai

Untuk menjalankan proyek ini secara lokal di komputer Anda, ikuti langkah-langkah berikut.

### Prasyarat

-   Node.js (v18.x atau lebih baru)
-   npm atau yarn
-   Akun database PostgreSQL (misalnya dari [Neon](https://neon.tech/))

### Instalasi

1.  **Clone repositori:**
    ```sh
    git clone [https://github.com/Afta20/AftaStore.git](https://github.com/Afta20/AftaStore.git)
    ```
2.  **Masuk ke direktori proyek:**
    ```sh
    cd AftaStore
    ```
3.  **Install semua dependensi:**
    ```sh
    npm install
    ```
4.  **Siapkan Variabel Lingkungan:**
    Buat file baru bernama `.env` di direktori utama dan isi dengan variabel berikut:
    ```env
    # URL koneksi ke database PostgreSQL Anda
    DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

    # Kunci rahasia untuk NextAuth.js (generate di [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32))
    NEXTAUTH_SECRET="your-super-secret-key"

    # URL utama aplikasi Anda
    NEXTAUTH_URL="http://localhost:3000"
    ```
5.  **Migrasi Database:**
    Terapkan skema database Anda menggunakan Prisma.
    ```sh
    npx prisma migrate dev
    ```
6.  **Jalankan Server Development:**
    ```sh
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🔮 Rencana Pengembangan

Beberapa fitur yang dapat ditambahkan di masa depan untuk meningkatkan proyek ini:

-   [ ] Implementasi Payment Gateway (Midtrans, Stripe).
-   [ ] Fitur filter dan sortir produk yang lebih kompleks.
-   [ ] Sistem review dan rating produk oleh pengguna.
-   [ ] Dasbor admin yang lebih lengkap dengan analitik penjualan.
-   [ ] Unit & Integration Testing dengan Jest dan React Testing Library.

## 📞 Kontak

Afta - [Afreezap20@gmail.com](mailto:afreezap20@gmail.com)

Link Proyek: [https://github.com/Afta20/AftaStore](https://github.com/Afta20/AftaStore)
