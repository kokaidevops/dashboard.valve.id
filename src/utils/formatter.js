/**
 * Utility Formatter Data Global for Dashboard Engine ERP
 */

const MONTH_NAME = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agst', 'Sept', 'Okt', 'Nov', 'Des'
];

export const DataFormatter = {
  /**
   * 1. Currency Format in Rupiah (with million/billion simplification option)
   * @param {number} value - raw value
   * @param {boolean} compact - if true, Rp 1.500.000 become Rp 1,5 Jt
   */
  formatCurrency(value, compact = false) {
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

    // Format standard: Rp 150.000.000
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  },

  /**
   * 2. Format simplification for normal qty (Non-Currency)
   * ex: 15000 -> 15K, 2500000 -> 2,5M (Million)
   */
  formatCompactNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('id-ID', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(Number(value));
  },

  /**
   * 3. Format Percentage
   * @param {number} value - Decimal number (0.125) or round number (12.5)
   * @param {boolean} isLiteral - Set true if data from SQL is already round number (e.g. 12.4)
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
   * 4. Format Date, Month, dan Period
   */
  formatDateTime(value, type = 'month') {
    if (!value) return '-';
    
    // If format is period from SQL Odoo (e.g., "2026-03")
    if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-');
      const monthName = MONTH_NAME[parseInt(month, 10) - 1];
      return monthName ? `${monthName} ${year}` : value;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value); // Return original string if failed to conversion

    if (type === 'year') return String(date.getFullYear());
    if (type === 'month') return `${MONTH_NAME[date.getMonth()]} ${date.getFullYear()}`;
    
    // Full format: 21 Juni 2026
    return `${date.getDate()} ${MONTH_NAME[date.getMonth()]} ${date.getFullYear()}`;
  },

  /**
   * 5. MASTER ENGINE: Automatic conversion column name
   */
  autoFormat(key, value, forceCompact = false, type = 'date') {
    if (value === null || value === undefined || value === '') return '-';
    
    const lowerKey = key.toLowerCase();
    const regex = /:\s*(?<value>.+)/;
    const match = regex.exec(lowerKey);
    const col = match ? match.groups.value : lowerKey;

    switch (col) {
      case 'currency':
        return this.formatCurrency(value, forceCompact);
        case 'percentage':
          return this.formatPercentage(value, true);
        case 'year':
          return this.formatDateTime(value, col);
        case 'month':
          return this.formatDateTime(value, col);
        case 'date':
          return this.formatDateTime(value, col);
        case 'number':
          return forceCompact ? this.formatCompactNumber(value) : value.toLocaleString('id-ID');
        case 'day':
          return `${value} Hari`
      default:
        return String(value);
      }
  },

  cleanHeaderLabel(text){
    const lowerText = text.toLowerCase();
    const regex = /^\s*(?<value>[^:]+?)\s*:/;
    const match = regex.exec(lowerText);
    const name = match ? match.groups.value : lowerText;
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
};