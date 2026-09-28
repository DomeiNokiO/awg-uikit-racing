{{-- ============================================================
     AWG-UIKIT-RACING — Contoh halaman CRUD + DataTable
     Simpan sebagai resources/views/example/crud.blade.php
     (asumsi: layout layouts.awg, route example.data → JSON server-side)
     ============================================================ --}}
@extends('layouts.awg')

@section('title', 'Data Produk')

@section('topbar-actions')
<div class="awg-flex" style="margin-left:auto;gap:.5rem">
    <button class="awg-btn awg-btn-ghost" id="btnExport"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-download"></use></svg> Export</button>
    <button class="awg-btn awg-btn-primary" id="btnAdd"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-plus"></use></svg> Tambah</button>
</div>
@endsection

@section('content')
<div class="awg-page-head">
    <div><h1>Data Produk</h1><p>Kelola katalog beserta resep bahan.</p></div>
</div>

<div class="awg-card">
    <div class="awg-table-wrap">
        <table class="awg-table striped" id="dataTable">
            <thead><tr><th>SKU</th><th>Nama</th><th class="t-num">Harga</th><th>Status</th><th class="t-end">Aksi</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
    <div class="awg-card-foot" style="justify-content:space-between">
        <span class="awg-muted awg-tiny" id="tableInfo"></span>
        <div class="awg-pager" id="tablePager"></div>
    </div>
</div>

{{-- MODAL FORM (server-rendered partial via fetch) --}}
<div class="awg-backdrop" id="formModal"><div class="awg-modal">
    <div class="awg-modal-head"><h3 id="modalTitle">Tambah</h3><button class="x" data-awg-modal-close="formModal">✕</button></div>
    <div class="awg-modal-body" id="modalBody"></div>
    <div class="awg-modal-foot">
        <button class="awg-btn awg-btn-ghost" data-awg-modal-close="formModal">Batal</button>
        <button class="awg-btn awg-btn-primary" id="modalSave">Simpan</button>
    </div>
</div></div>
@endsection

@push('scripts')
<script>
(function () {
    const url = "{{ route('example.data') }}";
    const routes = {
        form: id => "{{ url('example/form') }}/" + (id ?? 0),
        store: "{{ route('example.store') }}",
        update: id => "{{ url('example/update') }}/" + id,
        data: url,
    };
    let page = 1, q = '', sort = 'id', dir = 'asc';

    /* ---- fetch data server-side (JSON: {data, total, page, per}) ---- */
    async function load() {
        const tb = document.querySelector('#dataTable tbody');
        tb.innerHTML = '<tr><td colspan="5"><div class="awg-skel text"></div><div class="awg-skel text" style="width:60%"></div></td></tr>';
        const res = await fetch(`${routes.data}?page=${page}&q=${encodeURIComponent(q)}&sort=${sort}&dir=${dir}`, {
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content }
        });
        if (res.status === 401) { sessionStorage.setItem('awg-session','1'); location = '{{ route('login') }}'; return; }
        const j = await res.json();
        tb.innerHTML = j.data.length ? j.data.map(r => `
            <tr>
                <td><span class="awg-mono awg-tiny">${Awg.esc(r.sku)}</span></td>
                <td class="awg-strong">${Awg.esc(r.name)}</td>
                <td class="t-num">${Awg.esc(r.price)}</td>
                <td>${r.active ? '<span class="awg-badge ok">Aktif</span>' : '<span class="awg-badge gray">Nonaktif</span>'}</td>
                <td class="t-end">
                    <div class="awg-dropdown">
                        <button class="awg-btn awg-btn-ghost awg-btn-sm awg-btn-icon" data-awg-drop="row${r.id}">⋮</button>
                        <div class="awg-dropdown-menu left" id="row${r.id}">
                            <button class="awg-dropdown-item" data-edit="${r.id}"><svg class="awg-ic sm"><use href="/assets/assets/icons.svg#ic-pen"></use></svg> Edit</button>
                            <div class="awg-dropdown-sep"></div>
                            <button class="awg-dropdown-item danger" data-del="${r.id}"><svg class="awg-ic sm"><use href="/assets/assets/icons.svg#ic-trash"></use></svg> Hapus</button>
                        </div>
                    </div>
                </td>
            </tr>`).join('')
            : `<tr><td colspan="5"><div class="awg-empty"><span class="ico"><svg class="awg-ic"><use href="/assets/assets/icons.svg#ic-folder"></use></svg></span><b>Tidak ada data</b></div></td></tr>`;
        document.getElementById('tableInfo').textContent = `Menampilkan ${j.data.length} dari ${j.total}`;
        pager(j.total, Math.ceil(j.total / (j.per || 10)));
    }

    /* ---- pager ---- */
    function pager(total, lastPage) {
        const p = document.getElementById('tablePager');
        if (lastPage <= 1) { p.innerHTML = ''; return; }
        let h = `<button ${page===1?'disabled':''} data-p="${page-1}">«</button>`;
        for (let i = 1; i <= lastPage; i++) h += `<button class="${i===page?'active':''}" data-p="${i}">${i}</button>`;
        h += `<button ${page===lastPage?'disabled':''} data-p="${page+1}">»</button>`;
        p.innerHTML = h;
        p.querySelectorAll('button').forEach(b => b.onclick = () => { page = +b.dataset.p; load(); });
    }

    /* ---- modal tambah/edit (fragment dari server) ---- */
    async function openForm(id = null) {
        document.getElementById('modalTitle').textContent = id ? 'Edit' : 'Tambah';
        const res = await fetch(routes.form(id), { headers: { 'X-Requested-With': 'fetch' } });
        if (res.status === 401) { sessionStorage.setItem('awg-session','1'); location = '{{ route('login') }}'; return; }
        const body = document.getElementById('modalBody');
        body.innerHTML = await res.text();
        // <script> di innerHTML tidak jalan — eksekusi manual
        body.querySelectorAll('script').forEach(o => { const s = document.createElement('script'); s.textContent = o.textContent; o.replaceWith(s); });
        AwgSelect.mount();
        document.getElementById('modalSave').dataset.id = id ?? '';
        Awg.modal.open('formModal');
    }

    document.getElementById('btnAdd').onclick = () => openForm();
    document.getElementById('modalSave').onclick = async function () {
        const id = this.dataset.id, f = document.querySelector('#modalBody form');
        if (!Awg.form.validate(f)) return;
        Awg.btnLoading(this, true, 'Menyimpan…');
        const fd = new FormData(f);
        const res = await fetch(id ? routes.update(id) : routes.store, {
            method: 'POST', body: fd,
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content, 'X-Requested-With': 'fetch' }
        });
        Awg.btnLoading(this, false);
        if (res.ok) { const j = await res.json(); if (j.ok) { Awg.toast('Tersimpan', 'ok'); Awg.modal.close('formModal'); load(); } }
        else {
            const j = await res.json();
            Object.entries(j.errors || {}).forEach(([k, v]) => {
                const inp = f.querySelector(`[name="${k}"]`); if (inp) Awg.form.showError(inp, v[0]);
            });
            Awg.toast('Periksa isian', 'bad');
        }
    };

    /* ---- hapus dengan confirm ---- */
    document.querySelector('#dataTable tbody').addEventListener('click', e => {
        const ed = e.target.closest('[data-edit]'); if (ed) { openForm(ed.dataset.edit); return; }
        const dl = e.target.closest('[data-del]'); if (dl) {
            Awg.confirm('Hapus baris?', 'Data yang dihapus tidak bisa kembali.', async () => {
                const res = await fetch('{{ url('example/delete') }}/' + dl.dataset.del, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content }
                });
                if (res.ok) { Awg.toast('Terhapus', 'ok'); load(); }
            });
        }
    });

    /* ---- search box ---- */
    const si = document.createElement('div'); si.innerHTML = `<div class="awg-field" style="max-width:260px"><div class="awg-input-group"><span class="awg-addon"><i class="fa-solid fa-magnifying-glass"></i></span><input class="awg-input" placeholder="Cari…"></div></div>`;
    document.querySelector('.awg-page-head').appendChild(si);
    let t; si.querySelector('input').oninput = ev => { clearTimeout(t); t = setTimeout(() => { q = ev.target.value; page = 1; load(); }, 350); };

    load();
})();
</script>
@endpush
