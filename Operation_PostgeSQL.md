1. Operasi Waktu dan Tren (Time-Series)
- `date_trunc('period', date)` memotong tanggal menjadi mingguan, bulanan atau tahunan untuk agregasi tren
- `AGE(date1, date2)` atau `EXTRACT(EPOCH FROM ...)` menghitung durasi
- `generate_series()` membuat dummy deret waktu, agar bulan yang tidak memiliki nilai (0) tetap muncul
2. Conditional Aggregation (Filter dalam Agregasi)
- `FILTER (WHERE ...)` melihat perbandingan metrik sekaligus dalam satu baris
3. Window Functions (Analisis Mendalam)
- `LAG()` / `LEAD()` mengambil data dari baris sebelum/sesudahnya. Sering digunakan untuk menghitung **MoM (Month-over-Month) Growth**
- `RANK()` / `DENSE_RANK()` membuat ranking
- `SUM(...) OVER (ORDER BY ...)` membuat **Running Total** (akumulasi penjualan dari hari ke hari sepanjang bulan)
4. Rasio dan Persentase (Penyederhanaan Data)
- `COALESCE(value, 0)` mengubah nilai `NULL` menjadi `0`
- `NULLIF(value, 0)` pembagi untuk menghindari error division by zero
5. CTE (Common Table Expressions) untuk Query yang Bersih
- `WITH template_name AS (...)`
6. String DATE
- `YYYY` Tahun
- `MM` Bulan
- `WW` Minggu
- `DD` Tanggal