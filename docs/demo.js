// Minibox static demo glue: keeps the original app's UI interactive where it
// makes sense client-side, and explains actions that need the real server.
(function () {
  function toast(msg) {
    let t = document.getElementById("mb-demo-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "mb-demo-toast";
      t.style.cssText = "position:fixed;left:50%;bottom:64px;transform:translateX(-50%);background:#0f172a;color:#fff;padding:10px 18px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .25s;max-width:90vw;text-align:center";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.style.opacity = "0"), 2600);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Demo bar
    const bar = document.createElement("div");
    bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:9998;background:rgba(15,23,42,.92);color:#e2e8f0;font-size:13px;padding:7px 14px;text-align:center";
    bar.innerHTML = "Demo statis Minibox — tampilan &amp; data persis dari aplikasi Laravel aslinya. Perubahan di halaman ini tidak disimpan ke server. " +
      '<a href="https://github.com/Hasbi1605/inventaris-minibox" target="_blank" rel="noopener" style="color:#7dd3fc">Lihat kode sumber</a>';
    document.body.appendChild(bar);

    // Forms: search forms filter the page's first table client-side; others get a toast.
    document.querySelectorAll("form").forEach(function (f) {
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        const searchInput = f.querySelector('input[type="search"], input[name*="search" i], input[name*="q" i], input[placeholder*="ari" i]');
        const table = document.querySelector("table");
        if (searchInput && table) {
          const q = searchInput.value.trim().toLowerCase();
          let shown = 0;
          table.querySelectorAll("tbody tr").forEach(function (tr) {
            const hit = !q || tr.textContent.toLowerCase().includes(q);
            tr.style.display = hit ? "" : "none";
            if (hit) shown++;
          });
          toast(q ? ("Menampilkan " + shown + " baris yang cocok dengan \"" + searchInput.value + "\".") : "Pencarian dikosongkan.");
          return;
        }
        const methodInput = f.querySelector('input[name="_method"]');
        if (methodInput && methodInput.value.toUpperCase() === "DELETE") {
          if (confirm("Hapus baris ini dari tampilan demo?")) {
            const row = f.closest("tr") || f.closest(".relative.flex.flex-col") || f;
            row.style.transition = "opacity .3s"; row.style.opacity = "0";
            setTimeout(() => row.remove(), 320);
            toast("Baris dihapus dari tampilan demo (server tidak diubah).");
          }
          return;
        }
        toast("Mode demo: formulir ini tidak dikirim ke server.");
      });
    });

    // Dead links placeholder
    document.querySelectorAll('a[href="#demo"], a[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        if (a.getAttribute("href") === "#") { ev.preventDefault(); toast("Mode demo: tautan ini tidak aktif."); }
      });
    });
  });
})();
