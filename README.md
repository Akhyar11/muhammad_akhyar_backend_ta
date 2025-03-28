# Dokumentasi API Sistem Backend

## Diagram Alur Sistem

```mermaid
graph TD
    A[Klien/Pengguna] --> B{Memerlukan Autentikasi?}

    %% Titik Akhir Publik
    B -->|Tidak| D[Titik Akhir Publik]
    D --> D1[Login/Registrasi]
    D --> D2[Akses Data IoT]
    D --> D3[Unggah Profil]

    %% Alur Autentikasi
    B -->|Ya| C[Login Diperlukan]
    C --> E[Dapatkan Token JWT]
    E --> F[Layanan Terlindungi]

    %% Layanan Terlindungi
    F --> G[Manajemen Pengguna]
    F --> H[Layanan Antropometri]
    F --> I[Layanan Obrolan]
    F --> J[Layanan Profil]
    F --> K[Manajemen IoT]

    %% Alur Manajemen Pengguna
    G --> G1[Buat Pengguna]
    G --> G2[Perbarui Pengguna]
    G --> G3[Hapus Pengguna]
    G --> G4[Dapatkan Pengguna]
    G --> G5[Perbarui Kata Sandi]

    %% Alur Layanan Antropometri
    H --> H1[Tambah Pengukuran]
    H --> H2[Dapatkan Pengukuran]
    H --> H3[Dapatkan Analisis KMS]
    H --> H4[Dapatkan Analisis BMI]

    %% Alur Layanan Obrolan
    I --> I1[Mulai Percakapan]
    I --> I2[Dapatkan Riwayat Obrolan]
    I --> I3[Dapatkan Respons AI]

    %% Alur Layanan Profil
    J --> J1[Buat Profil]
    J --> J2[Perbarui Profil]
    J --> J3[Dapatkan Profil]

    %% Alur Layanan IoT
    K --> K1[Dapatkan Akses IoT]
    K --> K2[Kirim Data IoT]
    K --> K3[Dapatkan Status IoT]

    %% Jenis Respons
    H3 --> R1[Ringkasan yang Dibuat AI]
    H4 --> R1
    I3 --> R1

    %% Penanganan Kesalahan
    B --> E1[401 Tidak Diotorisasi]
    E --> E2[403 Terlarang]
    F --> E3[500 Kesalahan Server]
```

## Daftar Isi

1. [Autentikasi](#autentikasi)
2. [Manajemen Pengguna](#manajemen-pengguna)
3. [Layanan Antropometri](#layanan-antropometri)
4. [Layanan Obrolan](#layanan-obrolan)
5. [Layanan Profil](#layanan-profil)
6. [Layanan IoT](#layanan-iot)

## Penanganan Kesalahan

Semua titik akhir mengikuti format respons kesalahan yang konsisten:

```json
{
  "error": "Deskripsi pesan kesalahan"
}
```

Kode status HTTP umum:

- 400 Permintaan Buruk: Parameter hilang atau tidak valid
- 401 Tidak Diotorisasi: Autentikasi diperlukan atau token tidak valid
- 403 Terlarang: Izin tidak mencukupi
- 404 Tidak Ditemukan: Sumber daya tidak ditemukan
- 500 Kesalahan Server Internal: Kesalahan sisi server

## Header Autentikasi

Untuk titik akhir yang dilindungi, sertakan token JWT di header Otorisasi:

```
Authorization: Bearer <jwt_token>
```
