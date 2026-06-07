# AJEX FISHING

Website React + Vite untuk restorasi joran patah, custom float, rebuild joran, custom wrapping, servis reel, modifikasi perlengkapan mancing, galeri publik, pemesanan WhatsApp, dan admin Firebase.

## Struktur Folder

```text
.
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
├── .env.example
├── README.md
└── src
    ├── firebase.js
    ├── main.jsx
    └── styles.css
```

## Menjalankan Lokal

```bash
npm install
npm run dev
```

## Environment Variable

Salin `.env.example` menjadi `.env`, lalu isi dari Firebase Project Settings.

```bash
cp .env.example .env
```

Variable yang diperlukan:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_WHATSAPP
VITE_FACEBOOK_URL
VITE_TIKTOK_URL
VITE_BUSINESS_ADDRESS
```

## Logo Website

Logo yang dipakai website:

```text
public/assets/ajex-logo-title.png
public/assets/ajex-logo-web.png
```

Keterangan:

- `ajex-logo-title.png` dipakai sebagai logo besar di hero.
- `ajex-logo-web.png` dipakai sebagai logo navbar/footer.
- Jika file PNG belum ada, website memakai fallback SVG di folder yang sama.
- Untuk memakai logo asli, replace file PNG di path tersebut tanpa mengubah kode.

## Hero Background

Background hero utama memakai:

```text
public/assets/hero-ajex-workshop.png
```

Prompt final untuk generate image 16:9 tersimpan di:

```text
public/assets/hero-ajex-workshop.prompt.txt
```

Jika PNG belum ada, website memakai fallback:

```text
public/assets/hero-ajex-workshop.svg
```

Untuk hasil terbaik, generate gambar 16:9 dari prompt tersebut, lalu simpan sebagai `public/assets/hero-ajex-workshop.png`.

## Firebase Setup

1. Buat project di Firebase Console.
2. Aktifkan Authentication dengan provider Email/Password.
3. Buat user admin di Authentication.
4. Aktifkan Firestore Database.
5. Aktifkan Firebase Storage.
6. Isi environment variable di Vercel.

## Struktur Koleksi Firestore

```text
gallery
└─ document
   ├─ title
   ├─ description
   ├─ category
   ├─ imageUrl
   ├─ storagePath
   ├─ createdAt
   └─ updatedAt
```

`storagePath` ditambahkan agar file di Firebase Storage bisa ikut dihapus saat admin menghapus data galeri.

## Firestore Rules

Rules ini membuat pengunjung hanya bisa membaca galeri, sedangkan admin yang login bisa membuat, mengedit, dan menghapus.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery/{document} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

## Storage Rules

```js
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{fileName} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
  }
}
```

## Halaman

- `/` untuk website publik.
- `/admin` untuk login dan manajemen galeri.

## Deploy Vercel

1. Push project ini ke GitHub repository baru.
2. Buka Vercel, pilih **Add New Project**.
3. Import repository GitHub `rangger1/Ajex-Fishing`.
4. Framework preset pilih **Vite**.
5. Isi build setting:

```bash
Build Command:
npm run build
```

```text
Output Directory:
dist
```

6. Masuk ke **Environment Variables** di Vercel, lalu isi semua key dari `.env.example`.
7. Klik **Deploy**.
8. Setelah deploy selesai, buka domain Vercel.
9. Coba halaman `/admin` untuk login admin Firebase.

`vercel.json` sudah disiapkan agar route `/admin` tetap berfungsi setelah refresh.

## Environment Variables di Vercel

Masukkan key berikut satu per satu:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_WHATSAPP
VITE_FACEBOOK_URL
VITE_TIKTOK_URL
VITE_BUSINESS_ADDRESS
```

Firebase key diambil dari:

```text
Firebase Console
Project settings
General
Your apps
SDK setup and configuration
Config
```
