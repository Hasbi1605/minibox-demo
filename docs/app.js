// Minibox — front-end demo. Data dummy modeled on the real Laravel app's schema
// (layanan, inventaris, transaksi, pengeluaran, kapster, cabang).
// Everything runs client-side; edits persist in localStorage.

const LS_KEY = "minibox-demo-v1";
const KAPSTER = ["Raka", "Dimas", "Fajar"];
const CABANG = "Minibox Pusat — Yogyakarta";

function todayISO(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function seed() {
  return {
    layanan: [
      { id: 1, nama: "Potong Rambut Dewasa", kategori: "Potong Rambut", harga: 35000, status: "aktif" },
      { id: 2, nama: "Potong Rambut Anak", kategori: "Potong Rambut", harga: 25000, status: "aktif" },
      { id: 3, nama: "Cukur Jenggot & Kumis", kategori: "Cukur", harga: 15000, status: "aktif" },
      { id: 4, nama: "Cuci + Styling", kategori: "Styling", harga: 20000, status: "aktif" },
      { id: 5, nama: "Hair Tonic Treatment", kategori: "Perawatan", harga: 30000, status: "aktif" },
      { id: 6, nama: "Creambath", kategori: "Perawatan", harga: 45000, status: "aktif" },
      { id: 7, nama: "Semir Rambut", kategori: "Styling", harga: 60000, status: "aktif" },
      { id: 8, nama: "Paket Lengkap (Cukur + Cuci + Pijat Kepala)", kategori: "Potong Rambut", harga: 50000, status: "aktif" },
    ],
    inventaris: [
      { id: 1, nama: "Hair Powder", kategori: "Produk Penjualan", stok: 13, stokMin: 5, harga: 20000, satuan: "pcs" },
      { id: 2, nama: "Pomade Water-Based", kategori: "Produk Penjualan", stok: 3, stokMin: 5, harga: 45000, satuan: "pcs" },
      { id: 3, nama: "Sampo Anti Ketombe 500ml", kategori: "Bahan Pakai", stok: 6, stokMin: 3, harga: 38000, satuan: "botol" },
      { id: 4, nama: "Pisau Cukur (isi 100)", kategori: "Bahan Pakai", stok: 2, stokMin: 2, harga: 55000, satuan: "box" },
      { id: 5, nama: "Handuk Kecil", kategori: "Perlengkapan", stok: 24, stokMin: 10, harga: 15000, satuan: "pcs" },
      { id: 6, nama: "Hair Tonic Spray", kategori: "Produk Penjualan", stok: 9, stokMin: 4, harga: 30000, satuan: "botol" },
    ],
    transaksi: [
      { id: 1, tanggal: todayISO(0), item: "Potong Rambut Dewasa", jenis: "Layanan", kapster: "Raka", qty: 1, harga: 35000, metode: "QRIS" },
      { id: 2, tanggal: todayISO(0), item: "Paket Lengkap (Cukur + Cuci + Pijat Kepala)", jenis: "Layanan", kapster: "Dimas", qty: 1, harga: 50000, metode: "Tunai" },
      { id: 3, tanggal: todayISO(0), item: "Hair Powder", jenis: "Produk", kapster: "Raka", qty: 2, harga: 20000, metode: "QRIS" },
      { id: 4, tanggal: todayISO(0), item: "Cukur Jenggot & Kumis", jenis: "Layanan", kapster: "Fajar", qty: 1, harga: 15000, metode: "Tunai" },
      { id: 5, tanggal: todayISO(1), item: "Potong Rambut Dewasa", jenis: "Layanan", kapster: "Dimas", qty: 1, harga: 35000, metode: "QRIS" },
      { id: 6, tanggal: todayISO(1), item: "Creambath", jenis: "Layanan", kapster: "Fajar", qty: 1, harga: 45000, metode: "Transfer" },
      { id: 7, tanggal: todayISO(2), item: "Pomade Water-Based", jenis: "Produk", kapster: "Raka", qty: 1, harga: 45000, metode: "QRIS" },
    ],
    pengeluaran: [
      { id: 1, tanggal: todayISO(1), keterangan: "Restok pomade & hair powder", kategori: "Stok Barang", jumlah: 350000 },
      { id: 2, tanggal: todayISO(3), keterangan: "Token listrik", kategori: "Operasional", jumlah: 100000 },
      { id: 3, tanggal: todayISO(5), keterangan: "Servis & asah clipper", kategori: "Peralatan", jumlah: 75000 },
      { id: 4, tanggal: todayISO(6), keterangan: "Air galon & kebersihan", kategori: "Operasional", jumlah: 45000 },
    ],
  };
}

let DB = load();
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const s = seed(); save(s); return s;
}
function save(db) { try { localStorage.setItem(LS_KEY, JSON.stringify(db || DB)); } catch (e) { /* ignore */ } }
function resetData() {
  if (!confirm("Reset semua data demo ke kondisi awal?")) return;
  DB = seed(); save(); renderAll();
}

const rp = n => "Rp" + new Intl.NumberFormat("id-ID").format(Number(n) || 0);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- navigation ----------
function switchView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
}
window.switchView = switchView; window.resetData = resetData;

// ---------- dashboard ----------
function renderDashboard() {
  const t = todayISO(0);
  const trxToday = DB.transaksi.filter(x => x.tanggal === t);
  const pendapatan = trxToday.reduce((s, x) => s + x.qty * x.harga, 0);
  const month = t.slice(0, 7);
  const pengBulan = DB.pengeluaran.filter(x => x.tanggal.startsWith(month)).reduce((s, x) => s + Number(x.jumlah), 0);
  const low = DB.inventaris.filter(x => Number(x.stok) <= Number(x.stokMin));
  document.getElementById("stat-cards").innerHTML = [
    ["Pendapatan Hari Ini", rp(pendapatan)],
    ["Transaksi Hari Ini", trxToday.length + " transaksi"],
    ["Pengeluaran Bulan Ini", rp(pengBulan)],
    ["Stok Menipis", low.length + " item"],
  ].map(([l, n]) => `<div class="stat-card"><div class="num">${n}</div><div class="lbl">${l} — ${esc(CABANG)}</div></div>`).join("");

  const recent = [...DB.transaksi].slice(-5).reverse();
  document.getElementById("recent-transaksi").innerHTML = recent.length ? tableHTML(
    ["Tanggal", "Item", "Kapster", "Total"],
    recent.map(x => [x.tanggal, esc(x.item), esc(x.kapster), rp(x.qty * x.harga)])) : `<p class="empty">Belum ada transaksi.</p>`;

  document.getElementById("low-stock").innerHTML = low.length ? tableHTML(
    ["Barang", "Stok", "Minimum", "Status"],
    low.map(x => [esc(x.nama), x.stok + " " + esc(x.satuan), x.stokMin, `<span class="badge badge-red">Menipis</span>`]))
    : `<p class="empty">Semua stok aman.</p>`;
}

function tableHTML(headers, rows) {
  return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("") + `</tbody></table>`;
}

// ---------- entity tables + CRUD ----------
const ENTITIES = {
  layanan: {
    title: "Layanan",
    fields: [
      { key: "nama", label: "Nama layanan", type: "text" },
      { key: "kategori", label: "Kategori", type: "select", options: ["Potong Rambut", "Styling", "Perawatan", "Cukur"] },
      { key: "harga", label: "Harga (Rp)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["aktif", "nonaktif"] },
    ],
    columns: ["Nama", "Kategori", "Harga", "Status"],
    row: x => [esc(x.nama), esc(x.kategori), rp(x.harga),
      x.status === "aktif" ? `<span class="badge badge-green">Aktif</span>` : `<span class="badge badge-amber">Nonaktif</span>`],
  },
  inventaris: {
    title: "Inventaris",
    fields: [
      { key: "nama", label: "Nama barang", type: "text" },
      { key: "kategori", label: "Kategori", type: "select", options: ["Produk Penjualan", "Bahan Pakai", "Perlengkapan"] },
      { key: "stok", label: "Stok saat ini", type: "number" },
      { key: "stokMin", label: "Stok minimum", type: "number" },
      { key: "harga", label: "Harga satuan (Rp)", type: "number" },
      { key: "satuan", label: "Satuan", type: "text" },
    ],
    columns: ["Barang", "Kategori", "Stok", "Harga Satuan", "Status"],
    row: x => [esc(x.nama), esc(x.kategori), `${x.stok} ${esc(x.satuan)} (min ${x.stokMin})`, rp(x.harga),
      Number(x.stok) <= Number(x.stokMin) ? `<span class="badge badge-red">Menipis</span>` : `<span class="badge badge-green">Tersedia</span>`],
  },
  transaksi: {
    title: "Transaksi",
    fields: [
      { key: "tanggal", label: "Tanggal", type: "date" },
      { key: "item", label: "Item (layanan/produk)", type: "text" },
      { key: "jenis", label: "Jenis", type: "select", options: ["Layanan", "Produk"] },
      { key: "kapster", label: "Kapster", type: "select", options: KAPSTER },
      { key: "qty", label: "Qty", type: "number" },
      { key: "harga", label: "Harga satuan (Rp)", type: "number" },
      { key: "metode", label: "Metode bayar", type: "select", options: ["QRIS", "Tunai", "Transfer"] },
    ],
    columns: ["Tanggal", "Item", "Jenis", "Kapster", "Qty", "Total", "Bayar"],
    row: x => [x.tanggal, esc(x.item), esc(x.jenis), esc(x.kapster), x.qty, rp(x.qty * x.harga), esc(x.metode)],
  },
  pengeluaran: {
    title: "Pengeluaran",
    fields: [
      { key: "tanggal", label: "Tanggal", type: "date" },
      { key: "keterangan", label: "Keterangan", type: "text" },
      { key: "kategori", label: "Kategori", type: "select", options: ["Stok Barang", "Operasional", "Peralatan", "Lainnya"] },
      { key: "jumlah", label: "Jumlah (Rp)", type: "number" },
    ],
    columns: ["Tanggal", "Keterangan", "Kategori", "Jumlah"],
    row: x => [x.tanggal, esc(x.keterangan), esc(x.kategori), rp(x.jumlah)],
  },
};

function renderTable(entity) {
  const cfg = ENTITIES[entity];
  const rows = DB[entity].map(x => [...cfg.row(x),
    `<span class="row-actions"><button class="btn btn-edit" onclick="openForm('${entity}', ${x.id})">Edit</button>` +
    `<button class="btn btn-danger" onclick="deleteItem('${entity}', ${x.id})">Hapus</button></span>`]);
  document.getElementById("table-" + entity).innerHTML =
    rows.length ? tableHTML([...cfg.columns, "Aksi"], rows) : `<p class="empty">Belum ada data. Klik tombol tambah untuk memulai.</p>`;
}

let formCtx = null;
function openForm(entity, id) {
  const cfg = ENTITIES[entity];
  const item = id ? DB[entity].find(x => x.id === id) : null;
  formCtx = { entity, id: id || null };
  document.getElementById("modal-title").textContent = (item ? "Edit " : "Tambah ") + cfg.title;
  document.getElementById("modal-form").innerHTML = cfg.fields.map(f => {
    const val = item ? item[f.key] : (f.type === "date" ? todayISO(0) : (f.type === "number" ? "" : ""));
    if (f.type === "select") {
      return `<label>${f.label}<select name="${f.key}">${f.options.map(o =>
        `<option value="${esc(o)}" ${String(val) === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
    }
    return `<label>${f.label}<input name="${f.key}" type="${f.type}" value="${esc(val)}" required></label>`;
  }).join("");
  document.getElementById("modal").hidden = false;
}
function closeModal() { document.getElementById("modal").hidden = true; formCtx = null; }
function saveForm(ev) {
  ev.preventDefault();
  const { entity, id } = formCtx;
  const cfg = ENTITIES[entity];
  const fd = new FormData(ev.target);
  const obj = {};
  for (const f of cfg.fields) obj[f.key] = f.type === "number" ? Number(fd.get(f.key)) : fd.get(f.key);
  if (id) { Object.assign(DB[entity].find(x => x.id === id), obj); }
  else { obj.id = Date.now(); DB[entity].push(obj); }
  save(); closeModal(); renderAll();
  return false;
}
function deleteItem(entity, id) {
  if (!confirm("Hapus data ini dari demo?")) return;
  DB[entity] = DB[entity].filter(x => x.id !== id);
  save(); renderAll();
}
window.openForm = openForm; window.closeModal = closeModal; window.saveForm = saveForm; window.deleteItem = deleteItem;

function renderAll() {
  renderDashboard();
  for (const e of Object.keys(ENTITIES)) renderTable(e);
}
renderAll();
