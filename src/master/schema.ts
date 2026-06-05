// Declarative schema for the marketing master-data (CRUD) screens. A single
// generic ResourceManager renders any of these configs. Each field carries a
// `tip` (apa/cara isi) and `result` (hasilnya apa di dashboard) for tooltips.

export type FieldType = "text" | "number" | "textarea" | "select" | "bool" | "numbers";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  hideInTable?: boolean;
  tip?: string;
  result?: string;
}

export interface ResourceConfig {
  /** API path segment, e.g. "channels". */
  key: string;
  /** Section title (plural). */
  title: string;
  /** Singular noun used in buttons/dialogs. */
  singular: string;
  fields: FieldDef[];
}

const STATUS3 = [
  { value: "good", label: "Hijau · Sehat" },
  { value: "warn", label: "Kuning · Pantau" },
  { value: "bad", label: "Merah · Alert" },
];
const CH_STATUS = [
  { value: "scale", label: "Scale" },
  { value: "optimize", label: "Optimize" },
  { value: "pause", label: "Pause" },
  { value: "test", label: "Test" },
];
const CMD_STATUS = [
  { value: "open", label: "Open" },
  { value: "progress", label: "Progress" },
  { value: "done", label: "Done" },
];
const CH_GROUP = [
  { value: "Paid", label: "Paid" },
  { value: "Owned", label: "Owned" },
  { value: "Trust", label: "Trust" },
  { value: "Offline", label: "Offline" },
];
const FUNNEL_OWNER = [
  "Marketing", "Marketing / AI", "Sales", "Sales + Finance", "Keuangan / KPR", "Keuangan + Sales", "Finance",
].map((o) => ({ value: o, label: o }));
const LQ_COLOR = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "nurture", label: "Nurture" },
  { value: "low", label: "Low" },
];

export const RESOURCES: ResourceConfig[] = [
  {
    key: "funnel",
    title: "Funnel",
    singular: "Tahap Funnel",
    fields: [
      { name: "key", label: "Tahap", type: "text", tip: "Nama tahap funnel (Impression, Leads, MQL, …).", result: "Label & urutan di panel Full Funnel." },
      { name: "value", label: "Jumlah", type: "number", tip: "Volume di tahap ini.", result: "Tinggi bar funnel & hitung konversi antar tahap." },
      { name: "owner", label: "Owner", type: "select", options: FUNNEL_OWNER, tip: "Departemen penanggung jawab tahap.", result: "Warna bar funnel (Marketing/Sales/Finance)." },
    ],
  },
  {
    key: "kpis",
    title: "KPI Ribbon",
    singular: "KPI",
    fields: [
      { name: "id", label: "ID", type: "text", tip: "Kode unik KPI (mis. leads, mqlrate).", result: "Kunci KPI; dipakai internal." },
      { name: "label", label: "Label", type: "text", tip: "Nama KPI yang tampil.", result: "Judul kartu KPI." },
      { name: "value", label: "Nilai", type: "text", tip: "Nilai terformat (mis. '3.420', '34.5%').", result: "Angka besar di kartu KPI." },
      { name: "suffix", label: "Suffix", type: "text", hideInTable: true, tip: "Imbuhan opsional (mis. '/100').", result: "Teks kecil setelah nilai." },
      { name: "target", label: "Target", type: "text", tip: "Target terformat.", result: "Teks 'Tgt …' di kartu." },
      { name: "gap", label: "Gap", type: "text", tip: "Selisih vs target (mis. '+14%').", result: "Chip gap berwarna status." },
      { name: "trend", label: "Tren (pisah koma)", type: "numbers", hideInTable: true, tip: "6 angka tren dipisah koma.", result: "Sparkline di kartu KPI." },
      { name: "status", label: "Status", type: "select", options: STATUS3, tip: "Kesehatan KPI.", result: "Warna kartu, chip & dot." },
      { name: "note", label: "Catatan", type: "textarea", hideInTable: true, tip: "Interpretasi CEO.", result: "Muncul di drilldown KPI." },
    ],
  },
  {
    key: "handover",
    title: "MQL → SAL Handover",
    singular: "Metrik Handover",
    fields: [
      { name: "label", label: "Metrik", type: "text", tip: "Nama metrik handover.", result: "Label sel di panel Handover." },
      { name: "value", label: "Nilai", type: "text", tip: "Nilai terformat (mis. '79.7%').", result: "Angka di sel handover." },
      { name: "status", label: "Status", type: "select", options: STATUS3, tip: "Kesehatan metrik.", result: "Warna angka handover." },
    ],
  },
  {
    key: "channels",
    title: "Channel Matrix",
    singular: "Channel",
    fields: [
      { name: "name", label: "Channel", type: "text", tip: "Nama channel (Meta Ads, TikTok, …).", result: "Baris di Channel Performance Matrix." },
      { name: "group", label: "Grup", type: "select", options: CH_GROUP, tip: "Kelompok channel.", result: "Sub-label grup pada baris." },
      { name: "spend", label: "Spend", type: "number", tip: "Belanja iklan (Rupiah).", result: "Kolom Spend (diformat Rp)." },
      { name: "leads", label: "Leads", type: "number", tip: "Jumlah leads dari channel.", result: "Kolom Leads + bar relatif." },
      { name: "mql", label: "MQL", type: "number", tip: "Qualified leads.", result: "Kolom MQL & MQL rate di drilldown." },
      { name: "cpl", label: "CPL", type: "number", hideInTable: true, tip: "Cost per lead (Rupiah).", result: "Kolom CPL (diformat Rp)." },
      { name: "cpql", label: "CPQL", type: "number", hideInTable: true, tip: "Cost per qualified lead (Rupiah).", result: "Ditampilkan di drilldown channel." },
      { name: "roi", label: "ROI", type: "text", tip: "ROI terformat (mis. '4.8×').", result: "Kolom ROI." },
      { name: "status", label: "Keputusan", type: "select", options: CH_STATUS, tip: "Scale / Optimize / Pause / Test.", result: "Pill keputusan berwarna." },
    ],
  },
  {
    key: "projects",
    title: "Project Matrix",
    singular: "Project",
    fields: [
      { name: "name", label: "Nama Project", type: "text", tip: "Nama proyek.", result: "Titik di kuadran & judul drilldown." },
      { name: "ig", label: "IG Handle", type: "text", tip: "Handle Instagram (tanpa @).", result: "Ditautkan ke akun IG." },
      { name: "demand", label: "Demand", type: "number", tip: "Skor demand 0–100.", result: "Posisi vertikal titik kuadran." },
      { name: "readiness", label: "Readiness", type: "number", tip: "Skor readiness 0–100.", result: "Posisi horizontal titik kuadran." },
      { name: "leads", label: "Leads", type: "number", tip: "Leads proyek.", result: "Detail drilldown project." },
      { name: "mql", label: "MQL", type: "number", tip: "MQL proyek.", result: "MQL rate di drilldown." },
      { name: "booking", label: "Booking", type: "number", tip: "Jumlah booking.", result: "Ukuran titik kuadran." },
    ],
  },
  {
    key: "assets",
    title: "Digital Assets",
    singular: "Asset",
    fields: [
      { name: "type", label: "Tipe", type: "text", tip: "Jenis aset (Website, TikTok, YouTube, GBP).", result: "Baris di Digital Asset Registry." },
      { name: "handle", label: "Handle/URL", type: "text", tip: "Alamat/handle aset.", result: "Teks handle pada baris." },
      { name: "health", label: "Health", type: "number", tip: "Skor health 0–100.", result: "Bar + warna health." },
      { name: "active", label: "Aktif?", type: "bool", tip: "Apakah aktif.", result: "Status aktif aset." },
      { name: "note", label: "Catatan", type: "textarea", hideInTable: true, tip: "Catatan kondisi aset.", result: "Konteks tambahan." },
    ],
  },
  {
    key: "ig-accounts",
    title: "IG Accounts",
    singular: "Akun IG",
    fields: [
      { name: "handle", label: "Handle", type: "text", tip: "Handle IG proyek (tanpa @).", result: "Kotak di grid IG (warna = health)." },
      { name: "health", label: "Health", type: "number", tip: "Skor health 0–100.", result: "Warna kotak IG." },
      { name: "active", label: "Aktif?", type: "bool", tip: "Akun aktif?", result: "Kotak ✕ bila tidak aktif." },
      { name: "days", label: "Hari Lalu", type: "number", tip: "Hari sejak posting terakhir.", result: "Tooltip & sinyal akun pasif." },
    ],
  },
  {
    key: "commands",
    title: "CEO Command Panel",
    singular: "Command",
    fields: [
      { name: "issue", label: "Issue", type: "text", tip: "Masalah yang terdeteksi.", result: "Kolom Issue di Command Panel." },
      { name: "cause", label: "Penyebab", type: "text", hideInTable: true, tip: "Akar penyebab.", result: "Sub-teks di bawah issue." },
      { name: "impact", label: "Dampak", type: "text", hideInTable: true, tip: "Dampak bisnis.", result: "Konteks dampak." },
      { name: "command", label: "Perintah", type: "text", tip: "Perintah/aksi yang diberikan.", result: "Kolom Command." },
      { name: "pic", label: "PIC", type: "text", tip: "Penanggung jawab.", result: "Kolom PIC." },
      { name: "deadline", label: "Deadline", type: "text", tip: "Tenggat (mis. 'H+3').", result: "Kolom DL." },
      { name: "expected", label: "Expected", type: "text", hideInTable: true, tip: "Hasil yang diharapkan.", result: "Kolom Impact (harapan)." },
      { name: "status", label: "Status", type: "select", options: CMD_STATUS, tip: "Open / Progress / Done.", result: "Dot status + hitung open commands." },
    ],
  },
  {
    key: "reason-codes",
    title: "Reason Codes",
    singular: "Reason Code",
    fields: [
      { name: "code", label: "Kode", type: "text", tip: "Kode singkat (UNR, ENG, …).", result: "Identitas reason code." },
      { name: "layer", label: "Layer", type: "text", tip: "Lapisan funnel (Leads→CV, dst).", result: "Pengelompokan kebocoran." },
      { name: "label", label: "Label", type: "text", tip: "Deskripsi reason.", result: "Nama reason code." },
      { name: "count", label: "Jumlah", type: "number", tip: "Jumlah kejadian.", result: "Bobot reason code." },
    ],
  },
];

/** Color/select option lists exposed for singleton editors. */
export const OPTIONS = { STATUS3, LQ_COLOR };
