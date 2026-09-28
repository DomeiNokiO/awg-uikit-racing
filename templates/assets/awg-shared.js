/* ============================================================
   AWG-UIKIT-RACING — Shared Interactivity Layer
   Author : AWGNET-RACING & AGENT AI TEAM
   Scope  : global helpers for dashboard templates + dynamic features
   ============================================================ */
(function(){
'use strict';

const A = window.Awg || {};

/* ---------------- Global search filter helper ---------------- */
A.filterTable = function(input, tableSelector, columns) {
    const q = input.value.toLowerCase();
    document.querySelectorAll(tableSelector + ' tbody tr').forEach(tr => {
        const text = Array.from(tr.querySelectorAll(columns || 'td')).map(td => td.textContent.toLowerCase()).join(' ');
        tr.style.display = text.includes(q) ? '' : 'none';
    });
};

A.debounce = function(fn, wait){
    let t;
    return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); };
};

A.slugify = s => String(s).toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-');

/* ---------------- Quick command palette items for every page ---------------- */
A.globalPaletteItems = function(){
    return [
        {label:'NMS / ISP Dashboard', icon:'ic-gauge', action:()=>location.href='templates/nms-dashboard.html'},
        {label:'Franchise / Kasir Dashboard', icon:'ic-store', action:()=>location.href='templates/franchise-dashboard.html'},
        {label:'Admin CRUD Dashboard', icon:'ic-users', action:()=>location.href='templates/admin-dashboard.html'},
        {label:'Login', icon:'ic-user', action:()=>location.href='templates/auth/login.html'},
        {label:'Profil', icon:'ic-user', action:()=>location.href='templates/profile.html'},
        {label:'Pengaturan', icon:'ic-sliders', action:()=>location.href='templates/settings.html'},
        {label:'Tagihan', icon:'ic-receipt', action:()=>location.href='templates/billing.html'},
        {label:'Ganti tema', icon:'ic-contrast', action:()=>A.theme.toggle()},
    ];
};

/* ---------------- Auto-init simple page helpers ---------------- */
A.initShared = function(){
    // auto tables search via data-awg-filter-target
    document.querySelectorAll('[data-awg-filter-target]').forEach(input=>{
        const target = input.dataset.awgFilterTarget;
        input.addEventListener('input', A.debounce(()=>A.filterTable(input, target), 200));
    });

    // print button
    document.querySelectorAll('[data-awg-print]').forEach(btn=>{
        btn.addEventListener('click', ()=>window.print());
    });

    // density toggle (cozy/compact)
    document.querySelectorAll('[data-awg-density-toggle]').forEach(btn=>{
        btn.addEventListener('click', ()=>A.density.toggle());
    });
};

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', A.initShared);
else A.initShared();

})();
