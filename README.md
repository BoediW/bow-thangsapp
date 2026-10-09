# 🤖 WhatsApp Bot Multifungsi Modern

Bot WhatsApp multifungsi berbasis **Node.js** dan **@whiskeysockets/baileys** dengan arsitektur modular, pemrosesan media berbasis **FFmpeg**, middleware anti-spam & cooldown, database abstraction layer, serta error handling yang aman dan bersih.

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Kebutuhan Sistem (Requirements)](#-kebutuhan-sistem-requirements)
3. [Panduan Instalasi Node.js](#-instalasi-nodejs)
4. [Panduan Instalasi FFmpeg](#-instalasi-ffmpeg)
5. [Langkah Instalasi Proyek](#-langkah-instalasi-proyek)
6. [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
7. [Menjalankan Bot](#-menjalankan-bot)
8. [Pairing & Login WhatsApp](#-pairing--login-whatsapp)
9. [Daftar Command Lengkap](#-daftar-command-lengkap)
10. [Cara Menambahkan Command Baru](#-cara-menambahkan-command-baru)
11. [Troubleshooting & Solusi](#-troubleshooting--solusi)
12. [Struktur Proyek](#-struktur-proyek)

---

## ✨ Fitur Utama

- ⚡ **Arsitektur Modular**: Setiap command berada di filenya masing-masing di dalam direktori `src/commands/`.
- 🏷 **Dynamic Command Loader**: Penambahan perintah baru otomatis dimuat tanpa perlu mendaftarkannya secara manual di `index.js`.
- 🛡️ **Sistem Izin Bertingkat**: Validasi otomatis untuk `ownerOnly`, `groupOnly`, `adminOnly`, dan `botAdminOnly`.
- ⏱ **Anti-Spam & Cooldown**: Dilengkapi cooldown per-perintah dan rate-limiter global untuk mencegah banjir pesan.
- 🎨 **Sticker Maker & Metadata Editor**: Mengonversi gambar/video ke stiker WebP serta mengubah pack name dan author stiker.
- 🎬 **Media Tools**: Konversi video/audio ke MP3, Voice Note, kompresi video, dan resize gambar menggunakan FFmpeg.
- 📥 **Modular Downloader**: Unduh media dari YouTube (MP3 & MP4), TikTok (tanpa watermark), dan Instagram.
- 💾 **Database Abstraction Layer**: Mendukung adapter JSON terenkapsulasi dengan kesiapan beralih ke SQLite/PostgreSQL.
- 🔒 **Keamanan Ketat**: Command sensitif (`!eval` dan `!exec`) dinonaktifkan secara default (`ENABLE_EVAL_EXEC=false`).
- 🧹 **Pembersihan Berkas Sementara**: File media temporary otomatis dihapus setelah selesai dikirim.

---

## 💻 Kebutuhan Sistem (Requirements)

- **Node.js**: Versi 18.x atau 20.x ke atas (LTS direkomendasikan)
- **FFmpeg**: Terpasang di PATH sistem atau diarahkan melalui variabel `FFMPEG_PATH` di `.env`
- **RAM**: Minimal 512 MB (disarankan 1 GB atau lebih untuk kompresi video)
- **Koneksi Internet**: Stabil untuk koneksi WebSocket WhatsApp

---

## 📥 Instalasi Node.js

### Windows:
1. Unduh installer dari situs resmi: [https://nodejs.org/](https://nodejs.org/) (Pilih versi LTS).
2. Jalankan installer dan ikuti instruksi hingga selesai.
3. Buka Terminal / PowerShell / Command Prompt, lalu verifikasi:
   ```bash
   node -v
   npm -v
   ```

### Linux (Ubuntu / Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 🎬 Instalasi FFmpeg

### Windows:
1. Unduh build FFmpeg dari [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) (pilih `ffmpeg-release-essentials.zip`).
2. Ekstrak file zip ke direktori, contoh: `C:\ffmpeg`.
3. Tambahkan path `C:\ffmpeg\bin` ke **System Environment Variables (PATH)**:
   - Tekan `Win + R`, ketik `sysdm.cpl`, lalu tekan Enter.
   - Pilih tab **Advanced** ➔ **Environment Variables**.
   - Pada bagian **System Variables**, klik `Path` ➔ **Edit** ➔ **New** ➔ masukkan `C:\ffmpeg\bin`.
4. Buka terminal baru dan verifikasi:
   ```bash
   ffmpeg -version
   ```
> **Alternatif**: Anda dapat mengisi path file `ffmpeg.exe` langsung pada file `.env` di variabel `FFMPEG_PATH=C:/ffmpeg/bin/ffmpeg.exe`.

### Linux:
```bash
sudo apt update
sudo apt install -y ffmpeg
ffmpeg -version
```

---

## 🚀 Langkah Instalasi Proyek

1. **Buka Terminal** dan arahkan ke direktori proyek:
   ```bash
   cd whatsapp-bot
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Salin file konfigurasi `.env`**:
   ```bash
   cp .env.example .env
   ```
   *(Untuk Windows Command Prompt gunakan `copy .env.example .env`)*

---

## ⚙️ Konfigurasi Environment (.env)

Buka file `.env` dengan text editor pilihan Anda:

```env
# Nama bot yang akan muncul di menu dan info
BOT_NAME=MyWhatsAppBot

# Nomor pemilik bot (gunakan kode negara tanpa +, contoh: 6281234567890)
# Dapat menambahkan lebih dari satu nomor dengan tanda koma: 6281xxx,6282xxx
OWNER_NUMBER=6281234567890

# Simbol prefix default untuk memanggil perintah
PREFIX=!

# Batas maksimal ukuran file yang diproses/diunduh (dalam Megabytes)
MAX_FILE_SIZE=50

# Direktori penyimpanan file sementara
TEMP_DIR=./temp

# Mode lingkungan (development / production)
NODE_ENV=production

# Durasi cooldown default per-command (detik)
COOLDOWN_SECONDS=3

# Batas proses media yang berjalan bersamaan
MAX_CONCURRENT_MEDIA=3

# Path absolut ke binary ffmpeg (kosongkan jika sudah ada di PATH sistem)
FFMPEG_PATH=

# PERINGATAN KEAMANAN: Aktifkan hanya jika Anda ingin menggunakan !eval dan !exec
ENABLE_EVAL_EXEC=false

# Nama paket dan pembuat stiker default
STICKER_PACK=LMAO
STICKER_AUTHOR=Boe BOT
```

---

## 🏃 Menjalankan Bot

### Mode Produksi:
```bash
npm start
```

### Mode Development (Auto-Reload saat kode diubah):
```bash
npm run dev
```

### Menjalankan Unit / Self-Test:
```bash
npm test
```

---

## 📲 Pairing & Login WhatsApp

1. Jalankan perintah `npm start`.
2. Terminal akan menampilkan **QR Code**:
   ```text
   [INFO] Silakan pindai (scan) kode QR berikut di aplikasi WhatsApp:
   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
   █ ▄▄▄▄▄ █  █ █▄ █ ▄ █ ▄▄▄▄▄ █
   ...
   ```
3. Buka aplikasi **WhatsApp** di smartphone Anda.
4. Masuk ke **Menu titik tiga (Android)** atau **Pengaturan (iOS)** ➔ **Perangkat Tertaut (Linked Devices)**.
5. Pilih **Tautkan Perangkat (Link a Device)** dan arahkan kamera smartphone ke QR code di layar terminal.
6. Setelah tersambung, terminal akan menampilkan pesan:
   ```text
   [SUCCESS] 🎉 Bot MyWhatsAppBot BERHASIL TERHUBUNG ke WhatsApp!
   ```
7. Sesi login akan tersimpan otomatis di folder `sessions/`, sehingga Anda tidak perlu scan ulang setiap kali bot di-restart.

---

## 📖 Daftar Command Lengkap

### 📌 General
| Command | Alias | Deskripsi |
| :--- | :--- | :--- |
| `!menu` | `!helpall`, `!commands` | Menampilkan seluruh daftar menu dan runtime bot |
| `!help <command>` | `!bantuan` | Melihat detail dan cara penggunaan suatu command |
| `!ping` | `!speed` | Mengecek latensi dan kecepatan respon bot |
| `!runtime` | `!uptime` | Melihat berapa lama bot telah aktif berjalan |
| `!info` | `!botinfo` | Menampilkan statistik bot, penggunaan memori RAM, dan OS |
| `!owner` | `!creator` | Mengirimkan kartu kontak pemilik (owner) bot |

---

### 🎨 Sticker Tools
| Command | Alias | Deskripsi |
| :--- | :--- | :--- |
| `!sticker` | `!s`, `!stiker` | Ubah gambar/video pendek menjadi stiker (bisa tambahkan pack\|author di caption) |
| `!toimg` | `!toimage` | Reply stiker untuk mengubahnya kembali menjadi gambar |
| `!take <pack\|author>` | `!wm`, `!colong` | Reply stiker untuk mengganti nama pack dan author pembuat |

---

### 🎬 Media Tools
| Command | Alias | Deskripsi |
| :--- | :--- | :--- |
| `!tomp3` | `!mp3` | Mengonversi video atau audio menjadi file MP3 |
| `!toaudio` | `!tovn`, `!vn` | Mengonversi video/audio menjadi Voice Note (PTT) WhatsApp |
| `!compress` | `!kompres` | Mengompres ukuran file video agar lebih ringan dikirim |
| `!resize <WxH>` | `!ubahukuran` | Mengubah resolusi gambar (contoh: `!resize 500x500`) |
| `!gif` | `!togif` | Mengonversi video pendek menjadi animasi GIF WhatsApp |

---

### 📥 Downloader
| Command | Alias | Deskripsi |
| :--- | :--- | :--- |
| `!ytmp3 <url>` | `!yta` | Mengunduh lagu/audio dari YouTube |
| `!ytmp4 <url>` | `!ytv` | Mengunduh video dari YouTube |
| `!tiktok <url>` | `!tt`, `!ttdl` | Mengunduh video TikTok tanpa watermark |
| `!instagram <url>`| `!ig`, `!reels`| Mengunduh foto atau reels dari Instagram |

---

### 🎲 Fun & Entertainment
| Command | Alias | Deskripsi |
| :--- | :--- | :--- |
| `!quote` | `!katabijak` | Menampilkan kutipan inspiratif acak |
| `!joke` | `!lelucon` | Lelucon dan tebak-tebakan santai |
| `!ship @user` | `!jodoh` | Mengukur persentase kecocokan cinta antara 2 pengguna |
| `!rate <teks>` | `!nilai` | Memberikan rating acak (0-100%) terhadap suatu hal |
| `!truth` | `!kejujuran` | Pertanyaan kejujuran untuk game Truth or Dare |
| `!dare` | `!tantangan` | Tantangan seru untuk game Truth or Dare |
| `!8ball <tanya>` | `!magic8` | Ramalan jawaban mistis dari Magic 8-Ball |
| `!random` | `!acak` | Lempar koin, pilih angka acak, atau pilih opsi acak |
| `!fact` | `!fakta` | Fakta menarik dan unik dari seluruh dunia |

---

### 👥 Group Management (Admin Only)
*Setiap perintah berikut memvalidasi apakah chat adalah grup, sender adalah admin, dan bot adalah admin.*

| Command | Alias | Deskripsi | Syarat |
| :--- | :--- | :--- | :--- |
| `!tagall` | `!everyone` | Mention seluruh anggota grup dengan teks kustom | Admin |
| `!hidetag <pesan>` | `!ht` | Broadcast pesan tersembunyi ke seluruh anggota | Admin |
| `!kick @user` | `!tendang` | Mengeluarkan anggota dari grup | Admin + Bot Admin |
| `!add <nomor>` | `!undang` | Menambahkan nomor ke grup | Admin + Bot Admin |
| `!promote @user` | `!jadiadmin`| Menaikkan anggota menjadi Admin grup | Admin + Bot Admin |
| `!demote @user` | `!turunkan` | Menurunkan jabatan Admin menjadi anggota biasa | Admin + Bot Admin |
| `!groupinfo` | `!infogrup` | Informasi detail tentang grup saat ini | Anggota Grup |
| `!linkgroup` | `!linkgc` | Mengambil tautan undangan grup | Admin + Bot Admin |
| `!setname <nama>` | `!gantinama`| Mengubah nama/subjek grup | Admin + Bot Admin |
| `!setdesc <teks>` | `!gantideskripsi`| Mengubah deskripsi profil grup | Admin + Bot Admin |

---

### 👑 Owner Commands (Owner Only)
| Command | Alias | Deskripsi |
| :--- | :--- | :--- |
| `!broadcast <teks>`| `!bc` | Mengirim siaran pesan ke seluruh grup tempat bot bergabung |
| `!setprefix <simbol>`| `!prefix` | Mengubah prefix perintah secara runtime & tersimpan di DB |
| `!setstatus <teks>` | `!setbio` | Mengubah teks bio status WhatsApp bot |
| `!restart` | `!reboot` | Restart proses bot secara graceful (flush DB & bersihkan temp) |
| `!eval <kode>` | `!>` | *(Terkunci)* Eksekusi ekspresi JavaScript |
| `!exec <cmd>` | `!$` | *(Terkunci)* Eksekusi perintah terminal OS |

---

## 🛠 Cara Menambahkan Command Baru

Dengan arsitektur modular yang disediakan, Anda dapat menambahkan fitur baru dalam hitungan menit tanpa menyentuh core engine:

1. Buat file baru di dalam subdirektori kategori yang sesuai, misalnya `src/commands/fun/halo.js`.
2. Tulis template standar berikut:

```javascript
export default {
  name: 'halo',                   // Nama perintah (dipanggil dengan !halo)
  aliases: ['hai', 'salam'],      // Alias pemanggilan alternatif
  category: 'fun',                // Kategori perintah untuk menu
  description: 'Menyapa pengguna yang memanggil',
  usage: '',                      // Parameter tambahan jika ada
  cooldown: 3,                    // Waktu jeda dalam detik (opsional)
  ownerOnly: false,               // Set true jika khusus owner
  groupOnly: false,               // Set true jika khusus grup
  adminOnly: false,               // Set true jika khusus admin grup
  botAdminOnly: false,            // Set true jika butuh bot jadi admin

  async execute({ sock, msg, args, text, isGroup, sender, pushName, prefix, reply }) {
    // Tulis logika perintah Anda di sini
    await reply(`Halo kak *${pushName}*! Senang bertemu denganmu.`);
  }
};
```

3. Simpan file. Jalankan ulang bot (`npm start`). Command baru Anda langsung aktif dan otomatis muncul di tampilan `!menu`!

---

## ❓ Troubleshooting & Solusi

### 1. `Error: ffmpeg is not recognized` atau `Cannot find ffmpeg`
**Penyebab**: Binary FFmpeg belum terinstal atau belum masuk ke PATH sistem.
**Solusi**:
- Pastikan FFmpeg sudah diinstal.
- Buka file `.env` dan isi baris `FFMPEG_PATH` dengan path lengkap file executable FFmpeg Anda, contoh:
  ```env
  FFMPEG_PATH=C:/ffmpeg/bin/ffmpeg.exe
  ```

### 2. QR Code tidak muncul atau sesi keluar mendadak
**Penyebab**: Kredensial sesi lama corrupt atau keluar dari WhatsApp Web di smartphone.
**Solusi**:
- Hentikan bot (`Ctrl + C`).
- Hapus folder `sessions/`:
  ```bash
  rm -rf sessions
  ```
- Jalankan kembali bot dengan `npm start` untuk men-scan QR baru.

### 3. Pesan "Bot harus menjadi Admin Grup"
**Penyebab**: Perintah seperti `!kick`, `!promote`, `!setname` memerlukan bot berstatus Admin di grup tersebut.
**Solusi**: Jadikan nomor WhatsApp bot sebagai Admin grup terlebih dahulu.

### 4. Downloader gagal mengunduh media tertentu
**Penyebab**: Konten yang ingin diunduh berasal dari akun private, berukuran lebih besar dari `MAX_FILE_SIZE`, atau server penyedia pihak ketiga sedang mengalami antrean/rate-limit.
**Solusi**: Pastikan postingan bersifat publik dan URL yang dimasukkan valid. Anda juga dapat memperbesar nilai `MAX_FILE_SIZE=100` di `.env`.

---

## 🗂 Struktur Proyek

```text
whatsapp-bot/
│
├── src/
│   ├── index.js                     # Bootstrap sistem bot & graceful shutdown
│   │
│   ├── config/
│   │   └── config.js                # Konfigurasi terpusat & pembaca .env
│   │
│   ├── database/
│   │   ├── database.js              # Abstraction layer database (Facade)
│   │   ├── schema.js                # Default schema data user, group, stats
│   │   └── adapters/
│   │       ├── jsonAdapter.js       # Atomic JSON adapter dengan in-memory cache
│   │       └── sqliteAdapter.js     # Blueprint adapter untuk SQLite
│   │
│   ├── handlers/
│   │   ├── connectionHandler.js     # Koneksi Baileys, auto-reconnect, QR terminal
│   │   ├── messageHandler.js        # Serialisasi pesan masuk & context builder
│   │   └── commandHandler.js        # Dynamic command loader & middleware pipeline
│   │
│   ├── middleware/
│   │   ├── cooldown.js              # Anti-spam per-command cooldown
│   │   ├── rateLimit.js             # Global anti-flooding rate limiter
│   │   ├── permissions.js           # Pengecekan status Owner/Admin/BotAdmin/Ban
│   │   └── mediaLimits.js           # Batas ukuran berkas & concurrent task queue
│   │
│   ├── utils/
│   │   ├── logger.js                # Formatted console logger berwarna
│   │   ├── formatter.js             # Template menu box UI, byte & runtime format
│   │   ├── sticker.js               # WebP & EXIF metadata injector
│   │   ├── ffmpeg.js                # Pemrosesan audio, video, kompresi & resize
│   │   ├── downloader.js            # Modular scraper & stream downloader
│   │   └── tempManager.js           # Pengelola berkas sementara & auto purger
│   │
│   └── commands/
│       ├── general/                 # menu, help, ping, runtime, info, owner
│       ├── sticker/                 # sticker, toimg, take
│       ├── media/                   # tomp3, toaudio, compress, resize, gif
│       ├── downloader/              # ytmp3, ytmp4, tiktok, instagram
│       ├── fun/                     # quote, joke, ship, rate, truth, dare, 8ball, random, fact
│       ├── group/                   # tagall, hidetag, kick, add, promote, demote, groupinfo, linkgroup, setname, setdesc
│       └── owner/                   # broadcast, setprefix, setstatus, restart, eval, exec
│
├── test/
│   └── test-loader.js               # Self-test suite validasi seluruh komponen
├── sessions/                        # Kredensial sesi WhatsApp Multi-Device (auto-generated)
├── temp/                            # Berkas sementara hasil pemrosesan (auto-cleaned)
├── data/                            # Berkas database.json (auto-generated)
├── .env.example                     # Template konfigurasi environment
├── .env                             # File konfigurasi lokal
├── .gitignore                       # Git ignore list
└── package.json                     # Metadata proyek & daftar dependensi
```

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi **MIT**. Bebas digunakan, dikembangkan, dan dimodifikasi untuk kebutuhan personal maupun komunitas.
