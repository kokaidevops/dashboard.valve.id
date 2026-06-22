/**
 * Utility Formatter Data Global untuk Dashboard Engine ERP
 */

// Kamus nama-nama bulan dalam Bahasa Indonesia
const BULAN_INDO = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DataFormatter = {
  /**
   * 1. Format Mata Uang Rupiah (Dengan opsi penyederhanaan Jutaan/Miliar)
   * @param {number} value - Angka mentah
   * @param {boolean} compact - Jika true, Rp 1.500.000 menjadi Rp 1,5 Jt
   */
  formatRupiah(value, compact = false) {
    if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
    
    const num = Number(value);

    if (compact) {
      if (Math.abs(num) >= 1_000_000_000_000) {
        return `Rp ${(num / 1_000_000_000_000).toFixed(1).replace('.', ',')} T`;
      }
      if (Math.abs(num) >= 1_000_000_000) {
        return `Rp ${(num / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
      }
      if (Math.abs(num) >= 1_000_000) {
        return `Rp ${(num / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
      }
    }

    // Format standard penuh: Rp 150.000.000
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  },

  /**
   * 2. Format Penyederhanaan Angka Kuantitas Biasa (Non-Mata Uang)
   * Contoh: 15000 -> 15K, 2500000 -> 2,5M (Million)
   */
  formatCompactNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('id-ID', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(Number(value));
  },

  /**
   * 3. Format Persentase
   * @param {number} value - Angka desimal (0.125) atau angka bulat (12.5)
   * @param {boolean} isLiteral - Set true jika data dari SQL sudah berbentuk angka bulat (e.g. 12.4)
   */
  formatPercentage(value, isLiteral = true) {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    const num = isLiteral ? Number(value) / 100 : Number(value);
    return new Intl.NumberFormat('id-ID', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num);
  },

  /**
   * 4. Format Tanggal, Bulan, dan Periode secara Cerdas
   */
  formatDateTime(value, type = 'date') {
    if (!value) return '-';
    
    // Jika formatnya string periode dari SQL Odoo (e.g., "2026-03")
    if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
      const [tahun, bulan] = value.split('-');
      const namaBulan = BULAN_INDO[parseInt(bulan, 10) - 1];
      return namaBulan ? `${namaBulan} ${tahun}` : value;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value); // Kembalikan string asli jika gagal konversi tanggal

    if (type === 'year') return String(date.getFullYear());
    if (type === 'month') return BULAN_INDO[date.getMonth()];
    
    // Format lengkap: 21 Juni 2026
    return `${date.getDate()} ${BULAN_INDO[date.getMonth()]} ${date.getFullYear()}`;
  },

  /**
   * 5. MASTER ENGINE: Pendeteksi Otomatis Berdasarkan Nama Kolom (Key)
   * Fungsi ini memetakan data secara otomatis agar Anda tidak perlu menulis if-else di komponen UI
   */
  autoFormat(key, value, forceCompact = false) {
    if (value === null || value === undefined || value === '') return '-';
    
    const lowerKey = key.toLowerCase();

    // Jalur A: Deteksi Mata Uang (Revenue, Omset, Harga, Nominal, Total, dll)
    if (
      lowerKey.includes('revenue') || 
      lowerKey.includes('omset') || 
      lowerKey.includes('sales') || 
      lowerKey.includes('harga') || 
      lowerKey.includes('nominal') || 
      lowerKey.includes('amount') || 
      lowerKey.includes('total')
    ) {
      return this.formatRupiah(value, forceCompact);
    }

    // Jalur B: Deteksi Persentase (Grow, Growth, Margin, Persen, Ratio)
    if (
      lowerKey.includes('grow') || 
      lowerKey.includes('persen') || 
      lowerKey.includes('margin') || 
      lowerKey.includes('ratio') || 
      lowerKey.includes('pct')
    ) {
      return this.formatPercentage(value, true);
    }

    // Jalur C: Deteksi Tanggal & Periode (Tanggal, Date, Periode, Bulan, Created_At)
    if (
      lowerKey.includes('tanggal') || 
      lowerKey.includes('date') || 
      lowerKey.includes('periode') || 
      lowerKey.includes('bulan') || 
      lowerKey.includes('created')
    ) {
      return this.formatDateTime(value);
    }

    // Jalur D: Jika bertipe angka biasa tetapi bernilai besar (Kuantitas Produksi Katup/Mining, dll)
    if (typeof value === 'number') {
      return forceCompact ? this.formatCompactNumber(value) : value.toLocaleString('id-ID');
    }

    // Jalur E: Tipe teks string biasa (Nama customer, nomor dokumen)
    return String(value);
  }
};