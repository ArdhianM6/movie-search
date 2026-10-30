# Screen Search

Aplikasi katalog film dan serial responsif yang membantu pengguna menemukan tontonan, melihat detail, dan mengelola daftar pribadi. Data film diambil dari [OMDb API](https://www.omdbapi.com/).

## Fitur

- Pencarian film, serial, dan anime dengan hasil bertahap (pagination).
- Kategori populer, Indonesia, Inggris, Jepang, Korea, dan anime.
- Filter berdasarkan jenis serta pengurutan berdasarkan tahun, rating, atau judul.
- Detail film, rating IMDb, genre, durasi, sutradara, pemeran, sinopsis, dan tautan pencarian trailer.
- Halaman detail dengan URL `/movie/:imdbID`, tautan untuk memeriksa ketersediaan legal, dan catatan ulasan pribadi.
- Favorit, watchlist, status sudah ditonton, dan riwayat pencarian yang tersimpan di browser.
- Query pencarian tersimpan di URL agar hasil dapat dibagikan.
- Loading skeleton, pesan error, fallback poster, dukungan keyboard, dan layout mobile.

## Teknologi

- React 19
- Vite
- OMDb API
- CSS responsif tanpa UI framework

## Menjalankan secara lokal

1. Pastikan Node.js versi yang kompatibel dengan Vite terpasang.
2. Instal dependency:

   ```bash
   npm install
   ```

3. Buat file `.env` di root project dan isi API key OMDb:

   ```env
   VITE_OMDB_KEY=api_key_anda
   ```

   Dapatkan key dari [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx). Jangan commit file `.env`.

4. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

5. Build untuk produksi:

   ```bash
   npm run build
   npm run preview
   ```

## Catatan deployment

Variabel `VITE_OMDB_KEY` dipakai pada aplikasi browser dan dapat terlihat oleh pengguna saat aplikasi dipublikasikan. Untuk penggunaan portofolio/demo, atur batas kuota API dan pantau key. Untuk aplikasi produksi, pindahkan panggilan OMDb ke fungsi serverless atau backend agar key tidak dikirim ke browser.

Aplikasi memakai client-side routing untuk halaman detail `/movie/:imdbID`. Saat deploy ke static hosting, atur fallback/rewrite semua path aplikasi ke `index.html` agar membuka atau me-refresh URL detail tetap bekerja. Tautan JustWatch dan Google hanya membantu mencari pilihan legal; ketersediaan layanan dapat berbeda menurut wilayah dan waktu. Aplikasi tidak meng-host atau memutar film.

## Ide pengembangan lanjutan

- Ganti penyimpanan browser dengan akun dan sinkronisasi lintas perangkat.
- Tambahkan filter genre, negara, dan rentang tahun menggunakan data detail.
- Tambahkan pengujian komponen dan alur pencarian.
- Tambahkan screenshot aplikasi dan tautan live demo pada bagian ini setelah deployment.
