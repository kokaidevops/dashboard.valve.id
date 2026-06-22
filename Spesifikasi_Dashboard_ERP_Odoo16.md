# Spesifikasi Dashboard ERP Odoo 16

## 1. Konsep Arsitektur Dashboard

Dashboard disusun 3 lapis agar tidak terjadi overload informasi:

1. **Executive Dashboard** — ringkasan lintas-module untuk Direksi/Manajemen Puncak.
2. **Module/Department Dashboard** — 17 halaman, satu per module, untuk Manager/Kepala Departemen.
3. **Operational Detail (list view Odoo standar)** — saat user klik KPI/chart, diarahkan (drill-down) ke list/form view yang sudah terfilter sesuai konteks chart yang diklik.

**Filter Global Standar** (tersedia di hampir semua dashboard, tidak diulang di tiap module kecuali ada filter khusus):
- Date Range (Hari ini / Minggu ini / Bulan ini / Kuartal / Tahun / Custom)
- Company (untuk multi-company)
- Toggle Perbandingan Periode (vs periode sebelumnya / vs tahun lalu)
- Departemen/Tim/Gudang/Cabang (sesuai konteks module)
- Responsible/Owner (Sales Person, Buyer, Agent, Teknisi, dll.)

Total: **18 halaman dashboard**.

---

## 2. Daftar Halaman Dashboard

| No | Halaman Dashboard | Target User |
|----|---|---|
| 1 | Executive Dashboard | Direksi, C-Level |
| 2 | CRM Dashboard | Sales Manager |
| 3 | Sales Dashboard | Sales Manager, Finance |
| 4 | Purchase Request Dashboard | Department Head, Procurement |
| 5 | Purchasing Dashboard | Purchasing Manager |
| 6 | Accounting/Finance Dashboard | CFO, Finance Manager |
| 7 | Expenses Dashboard | Finance, HR |
| 8 | Helpdesk Dashboard | Support Manager |
| 9 | Inventory Dashboard | Warehouse Manager |
| 10 | Manufacturing Dashboard | Production Manager |
| 11 | Quality Control Dashboard | QC Manager |
| 12 | Maintenance Dashboard | Maintenance Manager |
| 13 | Employee (HR) Dashboard | HR Manager |
| 14 | Payroll Dashboard | HR/Finance |
| 15 | Attendance Dashboard | HR, Department Head |
| 16 | Time Off Dashboard | HR, Department Head |
| 17 | Recruitment Dashboard | HR/Talent Acquisition |
| 18 | Fleet Dashboard | GA/Fleet Manager |

---

## 3. Detail per Halaman Dashboard

### 1) Executive Dashboard (Cross-Module)

**Layout:**
- Baris 1: 8–10 KPI scorecard (grid) — angka besar lintas module
- Baris 2: 2 chart besar berdampingan — Tren Revenue vs Expense vs Cash, dan Sales Funnel vs Purchase Funnel
- Baris 3: Panel "Alert & Exceptions" lintas module (list)
- Baris 4: Business Health Gauge/Scorecard

| Card/Chart | Jenis | Keterangan |
|---|---|---|
| Total Revenue (MTD/YTD) | KPI Card + trend arrow | Dari Accounting/Sales |
| Net Profit | KPI Card | P&L |
| Cash Position | KPI Card | Bank + Kas |
| Pipeline Value (CRM) | KPI Card | Open opportunity |
| Inventory Value | KPI Card | Total stock value |
| Open Helpdesk Tickets | KPI Card | Dengan indikator SLA breach |
| Production Output (MTD) | KPI Card | Manufacturing |
| Total Headcount | KPI Card | HR |
| Payroll Cost (bulan ini) | KPI Card | Payroll |
| Revenue vs Expense vs Cash Flow | Line/Combo Chart | Tren 12 bulan |
| Sales Funnel vs Purchase Funnel | Dual Funnel Chart | Side-by-side |
| Daftar Alert Lintas Module | List/Table | Stock rendah, invoice overdue, PR pending, SLA breach |
| Business Health Score | Gauge Chart | Komposit skor (cash ratio, on-time delivery, dll) |

**Filter:** Date range, Company/Branch, Comparison toggle.

---

### 2) CRM Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Sales Pipeline Funnel (kiri) + Pipeline Trend by Stage (kanan)
- Baris 3: Opportunities by Source (donut) + Top Salesperson (leaderboard bar) + Lost Reason (bar)
- Baris 4: Tabel aktivitas (call/meeting) overdue & list opportunity

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Pipeline Value | KPI Card | — |
| Jumlah Open Opportunity | KPI Card | — |
| Win Rate % | KPI Card/Gauge | — |
| Average Deal Size | KPI Card | — |
| Expected Revenue (bulan ini) | KPI Card | — |
| Lead Conversion Rate % | KPI Card | — |
| Sales Pipeline by Stage | Funnel Chart (horizontal) | Stage |
| Pipeline Trend over Time | Stacked Area Chart | Won/Lost/Open |
| Opportunities by Source | Donut Chart | Source |
| Top Salesperson by Won Revenue | Horizontal Bar/Leaderboard | Sales Team |
| Lost Reason Breakdown | Bar Chart | Lost Reason |
| Aktivitas Overdue (Call/Meeting/To-do) | List Card | Activity Type |
| Tabel Opportunity | Data Table | Stage, Source, Tag, Country |

---

### 3) Sales Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Revenue Trend (bar/line) full-width
- Baris 3: Sales by Category (treemap) + Sales by Customer Top 10 (bar) + Sales by Region (map)
- Baris 4: Order Status Funnel + Invoicing Status (donut)
- Baris 5: Tabel order yang perlu diinvoice

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Sales Revenue | KPI Card | — |
| Jumlah Order | KPI Card | — |
| Average Order Value | KPI Card | — |
| Quotation Terkirim | KPI Card | — |
| Conversion Rate (Quotation→Order) | KPI Card | — |
| Sales Growth % | KPI Card | vs periode lalu |
| Revenue Trend | Line/Bar Chart | Bulanan |
| Sales by Product Category | Treemap/Bar | Category |
| Top 10 Customer by Revenue | Horizontal Bar | — |
| Sales by Region | Choropleth Map | Negara/Kota |
| Order Status Funnel | Funnel Chart | Draft→Sent→Sale→Done |
| Invoicing Status | Donut Chart | To Invoice/Invoiced/Upselling |
| Tabel Order Belum Diinvoice | Data Table | Customer, Salesperson, Status |

---

### 4) Purchase Request Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: PR Status Funnel + PR Trend (line)
- Baris 3: PR by Department (bar) + PR by Requestor (leaderboard) + Approval Time Distribution (histogram)
- Baris 4: Tabel PR pending approval (dengan aging)

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total PR Diajukan | KPI Card | — |
| PR Pending Approval | KPI Card | — |
| Approved Value | KPI Card | — |
| Average Approval Time | KPI Card | — |
| PR-to-PO Conversion Rate | KPI Card | — |
| PR Status Funnel | Funnel Chart | Draft→Approved→Rejected→Done |
| PR Trend | Line Chart | Bulanan |
| PR by Department | Bar Chart | Department |
| PR by Requestor | Leaderboard Bar | Requestor |
| Approval Time Distribution | Histogram | Priority |
| Tabel PR Pending dgn Aging | Data Table | Department, Priority, Status |

---

### 5) Purchasing Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Purchase Trend (bar) + PO Status Funnel
- Baris 3: Spend by Vendor (Pareto chart) + Spend by Category (pie)
- Baris 4: Vendor Performance Scorecard (table) + Price Variance Chart
- Baris 5: Tabel PO menunggu penerimaan/invoice

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total PO Value | KPI Card | — |
| Jumlah PO | KPI Card | — |
| On-Time Delivery % | KPI Card | — |
| Average Lead Time | KPI Card | — |
| Open PO Menunggu Receipt | KPI Card | — |
| Total Spend (periode ini) | KPI Card | — |
| Purchase Trend | Bar Chart | Bulanan |
| PO Status Funnel | Funnel Chart | RFQ→PO→Done |
| Spend by Vendor | Pareto Bar Chart | Vendor |
| Spend by Category | Pie Chart | Product Category |
| Vendor Performance Scorecard | Table (on-time %, reject %) | Vendor |
| Price Variance | Bar/Line Chart | Product |
| Tabel PO Open | Data Table | Vendor, Buyer, Status |

---

### 6) Accounting/Finance Dashboard

**Layout:**
- Baris 1: 6 KPI card (Revenue, Expense, Net Profit, Cash, AR, AP)
- Baris 2: P&L Trend (bar/line) + Cash Flow (waterfall chart)
- Baris 3: AR Aging (bar by bucket) + AP Aging (bar by bucket)
- Baris 4: Top Customer by Receivable (table) + Top Vendor by Payable (table)
- Baris 5: Tabel invoice overdue & status rekonsiliasi bank

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Revenue | KPI Card | Fiscal year |
| Total Expense | KPI Card | — |
| Net Profit | KPI Card | — |
| Cash Balance | KPI Card | — |
| AR Outstanding | KPI Card | — |
| AP Outstanding | KPI Card | — |
| P&L Trend | Bar/Line Chart | Journal, Analytic Account |
| Cash Flow | Waterfall Chart | — |
| AR Aging | Bar Chart (bucket 0-30/31-60/61-90/90+) | Customer |
| AP Aging | Bar Chart (bucket) | Vendor |
| Top Customer by Receivable | Table | — |
| Top Vendor by Payable | Table | — |
| Tabel Invoice Overdue | Data Table | Customer, Due Date, Amount |

---

### 7) Expenses Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Expense Trend (line) + Expense Status Funnel
- Baris 3: Expense by Category (pie) + Expense by Employee Top Spender (bar) + Expense by Department (bar)
- Baris 4: Tabel pending approval dengan aging

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Expense (periode ini) | KPI Card | — |
| Pending Approval Count | KPI Card | — |
| Approved Amount | KPI Card | — |
| Average Processing Time | KPI Card | — |
| Reimbursed Amount | KPI Card | — |
| Expense Trend | Line Chart | — |
| Expense Status Funnel | Funnel Chart | Draft→Submitted→Approved→Paid |
| Expense by Category | Pie Chart | Category |
| Top Spender Employee | Bar Chart | — |
| Expense by Department | Bar Chart | Department |
| Tabel Pending Approval | Data Table | Employee, Category, Aging |

---

### 8) Helpdesk Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Ticket Volume Trend (line) + Tickets by Stage (funnel/kanban count)
- Baris 3: Tickets by Agent (bar) + Tickets by Priority (donut) + Tickets by Channel (bar)
- Baris 4: SLA Breach Trend (line) + Tabel ticket overdue/escalated

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Open Tickets | KPI Card | — |
| New Tickets Today | KPI Card | — |
| Average Resolution Time | KPI Card | — |
| SLA Compliance % | KPI Card | — |
| CSAT Score | KPI Card | — |
| Tickets Resolved (periode ini) | KPI Card | — |
| Ticket Volume Trend | Line Chart | Team |
| Tickets by Stage | Funnel/Kanban Count | Stage |
| Tickets by Agent | Bar Chart | Agent |
| Tickets by Priority | Donut Chart | Priority |
| Tickets by Channel/Source | Bar Chart | Channel |
| SLA Breach Trend | Line Chart | — |
| Tabel Ticket Overdue/Escalated | Data Table | Customer, Tag, Priority |

---

### 9) Inventory Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Stock Value Trend (line) + Stock by Warehouse (treemap/bar)
- Baris 3: Top Moving Products (bar) + Slow-moving/Dead Stock (list) + ABC Analysis (Pareto)
- Baris 4: Inbound/Outbound Shipment Trend (line) + Stock Level vs Reorder Point (gauge per produk kritis)
- Baris 5: Tabel low stock alert & pending transfer

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Stock Value | KPI Card | — |
| Jumlah SKU | KPI Card | — |
| Stock-out Items Count | KPI Card | — |
| Inventory Turnover Ratio | KPI Card | — |
| Pending Deliveries | KPI Card | — |
| Pending Receipts | KPI Card | — |
| Stock Value Trend | Line Chart | Warehouse |
| Stock by Warehouse | Treemap/Bar | Location |
| Top Moving Products | Bar Chart | Category |
| Slow-moving/Dead Stock | List/Table | Aging |
| ABC Analysis | Pareto Chart | — |
| Inbound/Outbound Trend | Line Chart | Operation Type |
| Stock vs Reorder Point | Gauge per Produk Kritis | Product |
| Tabel Low Stock Alert | Data Table | Product, Warehouse |

---

### 10) Manufacturing Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Production Trend Planned vs Actual (combo chart) + MO Status Funnel
- Baris 3: Work Center Utilization (bar/gauge) + Downtime Analysis (Pareto)
- Baris 4: Output by Product (bar) + Tabel MO delayed/work order in progress

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| MO In Progress | KPI Card | — |
| MO Completed (periode ini) | KPI Card | — |
| OEE % | KPI Card | — |
| Production Output | KPI Card | — |
| Scrap/Waste % | KPI Card | — |
| On-Time Production Rate | KPI Card | — |
| Production Trend (Plan vs Actual) | Combo Bar/Line | Work Center |
| MO Status Funnel | Funnel Chart | Draft→Confirmed→In Progress→Done |
| Work Center Utilization | Bar/Gauge Chart | Work Center |
| Downtime Analysis | Pareto Chart | Reason |
| Output by Product | Bar Chart | Product |
| Tabel MO Delayed | Data Table | Product, BoM, Deadline |

---

### 11) Quality Control Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Quality Check Trend (line) + Pass/Fail Ratio (donut)
- Baris 3: Defects by Type (Pareto bar) + Defects by Product/Work Center (bar)
- Baris 4: Quality Alert Status Funnel + Tabel open alert (dengan severity)

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Quality Checks Performed | KPI Card | — |
| Pass Rate % | KPI Card | — |
| Failed Checks Count | KPI Card | — |
| Open Quality Alerts | KPI Card | — |
| Average Time to Resolve | KPI Card | — |
| Quality Check Trend | Line Chart | Control Type |
| Pass/Fail Ratio | Donut Chart | — |
| Defects by Type | Pareto Bar Chart | — |
| Defects by Product/Work Center | Bar Chart | — |
| Quality Alert Status Funnel | Funnel Chart | — |
| Tabel Open Quality Alert | Data Table | Severity, Product |

---

### 12) Maintenance Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Maintenance Request Trend (line) + Requests by Type (donut: preventive/corrective)
- Baris 3: Requests by Equipment (bar) + Downtime by Equipment (Pareto)
- Baris 4: Maintenance Calendar/Schedule (timeline/Gantt) + Tabel overdue request

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Open Maintenance Requests | KPI Card | — |
| Equipment Downtime (jam) | KPI Card | — |
| MTTR | KPI Card | — |
| MTBF | KPI Card | — |
| Preventive vs Corrective Ratio | KPI Card | — |
| Maintenance Request Trend | Line Chart | Equipment Category |
| Requests by Type | Donut Chart | — |
| Requests by Equipment | Bar Chart | — |
| Downtime by Equipment | Pareto Chart | — |
| Maintenance Calendar | Timeline/Gantt Chart | Technician |
| Tabel Overdue Request | Data Table | Priority, Equipment |

---

### 13) Employee (HR) Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Headcount Trend (line) + Headcount by Department (treemap/bar)
- Baris 3: Diversity Breakdown (donut) + Employee by Location (map)
- Baris 4: Org Chart Snapshot (tree diagram) + Tabel new hire & upcoming anniversary

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Active Employee | KPI Card | — |
| New Hires (periode ini) | KPI Card | — |
| Turnover Rate % | KPI Card | — |
| Headcount by Department | KPI Card | — |
| Average Tenure | KPI Card | — |
| Headcount Trend | Line Chart | Department |
| Headcount by Department | Bar/Treemap | — |
| Diversity Breakdown | Donut Chart | Gender/Usia |
| Employee by Location | Map Chart | — |
| Org Chart Snapshot | Tree Diagram | Manager |
| Tabel New Hire/Anniversary | Data Table | Department |

---

### 14) Payroll Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Payroll Cost Trend (line) + Cost by Department (bar)
- Baris 3: Salary Distribution (histogram) + Payslip Status Funnel
- Baris 4: Tabel pending payslip approval & payroll variance report

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Payroll Cost | KPI Card | Periode gaji |
| Average Salary | KPI Card | — |
| Jumlah Payslip Diproses | KPI Card | — |
| Total Deduction/Benefit | KPI Card | — |
| Payroll Cost vs Budget | KPI Card | — |
| Payroll Cost Trend | Line Chart | Department |
| Cost by Department | Bar Chart | — |
| Salary Distribution | Histogram | Contract Type |
| Payslip Status Funnel | Funnel Chart | Draft→Confirmed→Paid |
| Tabel Payroll Variance | Data Table | Department |

---

### 15) Attendance Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Attendance Trend (line) + Attendance by Department (bar)
- Baris 3: Check-in Time Distribution (histogram) + Overtime Trend (line)
- Baris 4: Tabel telat/absen hari ini & anomali kehadiran

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Hadir Hari Ini | KPI Card | — |
| Tidak Hadir Hari Ini | KPI Card | — |
| Jumlah Telat | KPI Card | — |
| Average Working Hours | KPI Card | — |
| Overtime Hours (periode ini) | KPI Card | — |
| Attendance Trend | Line Chart | Shift |
| Attendance by Department | Bar Chart | — |
| Check-in Time Distribution | Histogram | — |
| Overtime Trend | Line Chart | — |
| Tabel Telat/Absen + Anomali | Data Table | Department, Lokasi |

---

### 16) Time Off Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Leave Request Trend (line) + Leave by Type (donut)
- Baris 3: Leave by Department (bar) + Leave Request Status Funnel
- Baris 4: Team Leave Calendar (timeline/Gantt) + Tabel pending approval

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Pending Leave Request | KPI Card | — |
| Approved Leave (periode ini) | KPI Card | — |
| Employee on Leave Today | KPI Card | — |
| Average Leave Balance | KPI Card | — |
| Leave Utilization % | KPI Card | — |
| Leave Request Trend | Line Chart | Leave Type |
| Leave by Type | Donut Chart | Annual/Sick/Unpaid |
| Leave by Department | Bar Chart | — |
| Leave Status Funnel | Funnel Chart | — |
| Team Leave Calendar | Timeline/Gantt Chart | Department |

---

### 17) Recruitment Dashboard

**Layout:**
- Baris 1: 5 KPI card
- Baris 2: Applicant Funnel (initial→interview→offer→hired) full-width
- Baris 3: Applicants by Source (donut) + Applicant Trend (line) + Time-to-Hire by Position (bar)
- Baris 4: Recruiter Performance (leaderboard) + Tabel open position & kandidat pending interview

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Open Position | KPI Card | — |
| Total Applicant | KPI Card | — |
| Hires (periode ini) | KPI Card | — |
| Average Time-to-Hire | KPI Card | — |
| Offer Acceptance Rate | KPI Card | — |
| Applicant Funnel | Funnel Chart | Job Position |
| Applicants by Source | Donut Chart | — |
| Applicant Trend | Line Chart | — |
| Time-to-Hire by Position | Bar Chart | — |
| Recruiter Performance | Leaderboard Bar | Recruiter |
| Tabel Open Position | Data Table | Department |

---

### 18) Fleet Dashboard

**Layout:**
- Baris 1: 6 KPI card
- Baris 2: Fuel Cost Trend (line) + Maintenance Cost Trend (line)
- Baris 3: Cost by Vehicle (Pareto bar) + Vehicle Status Breakdown (donut)
- Baris 4: Odometer/Utilization Trend (line) + Tabel kontrak/asuransi akan habis & servis jatuh tempo

| Card/Chart | Jenis | Filter Tambahan |
|---|---|---|
| Total Vehicle | KPI Card | — |
| Vehicle In Service/In Maintenance | KPI Card | — |
| Total Fuel Cost (periode ini) | KPI Card | — |
| Total Maintenance Cost | KPI Card | — |
| Average Cost per Vehicle/km | KPI Card | — |
| Contract Expiring Soon | KPI Card | — |
| Fuel Cost Trend | Line Chart | Vehicle Category |
| Maintenance Cost Trend | Line Chart | — |
| Cost by Vehicle | Pareto Bar Chart | — |
| Vehicle Status Breakdown | Donut Chart | Active/Maintenance/Sold |
| Odometer/Utilization Trend | Line Chart | Driver |
| Tabel Kontrak/Servis Jatuh Tempo | Data Table | Vehicle, Tanggal |

---

## 4. Saran Lain untuk Dashboard Ini

1. **Role-based access** — buat versi dashboard berbeda untuk C-Level (ringkas, lintas module), Manager (detail per module), dan Staff (operasional harian), agar tidak semua orang melihat data sensitif yang sama.
2. **Drill-down konsisten** — setiap KPI card/chart sebaiknya bisa diklik dan langsung membuka list view Odoo dengan filter yang sesuai konteks, bukan hanya angka statis.
3. **Frekuensi refresh berbeda per module** — Helpdesk/Inventory/Attendance idealnya near real-time, sedangkan Payroll/Accounting/Recruitment cukup refresh harian/sesuai cron, untuk menjaga performa server.
4. **Definisi KPI tunggal (single source of truth)** — pastikan definisi seperti "Sales" (order amount vs invoiced amount) konsisten antar dashboard supaya tidak ada angka yang berbeda-beda saat dibandingkan lintas module.
5. **Conditional formatting/color coding** — gunakan warna merah/kuning/hijau berbasis threshold (contoh: stock di bawah reorder point = merah, SLA mendekati breach = kuning) agar exception langsung terlihat tanpa perlu membaca angka detail.
6. **Target vs Actual** — tambahkan progress bar/indicator target pada KPI utama (revenue, production output, recruitment hire) yang terhubung ke budget/goal yang sudah ditetapkan.
7. **Panel "Alert & Exceptions" yang reusable** — buat satu komponen alert generik (low stock, invoice overdue, PR/leave pending approval, SLA breach) yang dipakai ulang di Executive Dashboard maupun dashboard module masing-masing.
8. **Optimasi performa data** — untuk module dengan volume transaksi besar (Inventory, Accounting, Manufacturing), gunakan SQL view/materialized view atau cron job agregasi harian, jangan hitung langsung dari computed field saat dashboard dibuka.
9. **Multi-company & security** — pastikan record rules Odoo diterapkan dengan benar di level dashboard, sehingga data antar company/departemen tidak bocor ke user yang tidak berhak.
10. **Mobile-friendly layout** — terutama untuk Attendance, Time Off, Expenses, dan Helpdesk yang sering diakses dari HP; susun card secara grid responsif (stack vertikal di mobile).
11. **Saved filter/bookmark** — izinkan user menyimpan kombinasi filter yang sering dipakai (misal "Sales Q3 Tim Jakarta") agar tidak mengatur ulang filter setiap kali membuka dashboard.
12. **Pilihan tools implementasi** — Odoo 16 Enterprise sudah punya app *Dashboards* (berbasis spreadsheet/pivot) yang cukup untuk sebagian besar kebutuhan di atas; untuk visual yang lebih custom (funnel, gauge, treemap, Pareto, Gantt) bisa dikombinasikan dengan Odoo Studio + custom OWL component, atau integrasi ke BI tool eksternal (misal Power BI/Metabase/Superset) via Odoo's external API jika dibutuhkan analitik lebih dalam.
13. **Review berkala** — jadwalkan evaluasi relevansi KPI dan layout dashboard setiap kuartal, karena kebutuhan bisnis dan prioritas departemen biasanya berubah seiring waktu.
14. **Hindari information overload** — batasi maksimal ±6 KPI card dan ±4 chart utama per halaman; detail lebih lanjut diarahkan lewat drill-down, bukan ditumpuk semua di satu halaman.
15. **Cross-module insight tambahan** — pertimbangkan widget gabungan seperti "PR → PO → Receipt → Invoice cycle time" atau "Lead → Opportunity → Sales Order → Delivery cycle time" untuk melihat efisiensi proses end-to-end, bukan hanya per module terpisah.