/* ============================================================
   AWG-UIKIT-RACING — Core JS (vanilla, tanpa dependensi)
   Author : AWGNET-RACING & AGENT AI TEAM
   License: MIT
   Global : window.Awg
   Menyediakan: theme, sidebar drawer, toast, modal, confirm,
   dropdown, tabs/pills/seg, accordion, stepper angka, tags input,
   validasi form, loading tombol, escape HTML, format rupiah.
   Semua mount deklaratif via atribut data-awg-*.
   ============================================================ */
(function () {
    'use strict';

    const Awg = {};

    /* ---------- util ---------- */
    Awg.esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
    Awg.rupiah = (v, prefix = 'Rp ') => prefix + Number(v || 0).toLocaleString('id-ID');
    Awg.num = v => Number(v || 0).toLocaleString('id-ID');
    Awg.$ = (sel, root) => (root || document).querySelector(sel);
    Awg.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    /* ---------- theme ---------- */
    Awg.theme = {
        get() { return document.documentElement.dataset.theme || 'light'; },
        set(t) {
            document.documentElement.dataset.theme = t;
            try { localStorage.setItem('awg-theme', t); } catch (e) {}
            document.dispatchEvent(new CustomEvent('awg:theme', { detail: { theme: t } }));
        },
        toggle() { this.set(this.get() === 'dark' ? 'light' : 'dark'); },
        init() {
            let saved = null;
            try { saved = localStorage.getItem('awg-theme'); } catch (e) {}
            if (saved) this.set(saved);
            Awg.$$('[data-awg-theme-toggle]').forEach(b =>
                b.addEventListener('click', () => Awg.theme.toggle()));
        }
    };

    /* ---------- sidebar drawer ---------- */
    Awg.sidebar = {
        open() { document.body.classList.add('awg-sidebar-open'); },
        close() { document.body.classList.remove('awg-sidebar-open'); },
        toggle() { document.body.classList.toggle('awg-sidebar-open'); },
        init() {
            Awg.$$('[data-awg-menu]').forEach(b =>
                b.addEventListener('click', () => Awg.sidebar.toggle()));
            const ov = Awg.$('.awg-overlay');
            if (ov) ov.addEventListener('click', () => Awg.sidebar.close());
            Awg.$$('.awg-sidebar a').forEach(a =>
                a.addEventListener('click', () => { if (innerWidth < 992) Awg.sidebar.close(); }));
        }
    };

    /* ---------- toast stack with progress bar + swipe dismiss ---------- */
    const toastIcons = {
        info:  '<svg class="awg-ic" aria-hidden="true"><use href="assets/icons.svg#ic-info"></use></svg>',
        ok:    '<svg class="awg-ic" aria-hidden="true"><use href="assets/icons.svg#ic-check-circle"></use></svg>',
        bad:   '<svg class="awg-ic" aria-hidden="true"><use href="assets/icons.svg#ic-x-circle"></use></svg>',
        warn:  '<svg class="awg-ic" aria-hidden="true"><use href="assets/icons.svg#ic-alert-triangle"></use></svg>'
    };
    Awg.toast = function (msg, type = 'info', msOrOpts = 4000) {
        let ms = 4000, pauseOnHover = true;
        if (typeof msOrOpts === 'number') ms = msOrOpts;
        else if (msOrOpts && typeof msOrOpts === 'object') { ms = msOrOpts.ms || 4000; pauseOnHover = msOrOpts.pauseOnHover !== false; }
        let zone = Awg.$('.awg-toast-zone');
        if (!zone) {
            zone = document.createElement('div');
            zone.className = 'awg-toast-zone';
            zone.setAttribute('aria-live', 'polite');
            zone.setAttribute('aria-atomic', 'true');
            document.body.appendChild(zone);
        }
        const el = document.createElement('div');
        el.className = 'awg-toast awg-flex ' + type;
        el.setAttribute('role', 'status');
        el.setAttribute('aria-atomic', 'true');
        el.innerHTML = '<span class="awg-toast-ic" aria-hidden="true">' + (toastIcons[type] || toastIcons.info) + '</span>' +
            '<span class="awg-flex-1">' + Awg.esc(msg) + '</span>' +
            '<button class="x" aria-label="Tutup notifikasi">✕</button>' +
            '<span class="bar" aria-hidden="true"></span>';
        zone.appendChild(el);

        const bar = el.querySelector('.bar');
        let left = ms, raf, started = performance.now(), running = true;
        function tick(now) {
            if (!running) return;
            const pct = Math.max(0, left - (now - started)) / ms * 100;
            el.style.setProperty('--awg-toast-pct', pct + '%');
            if (pct <= 0) { close(); return; }
            raf = requestAnimationFrame(tick);
        }
        function close() {
            running = false; cancelAnimationFrame(raf);
            el.classList.add('hide'); setTimeout(() => el.remove(), 250);
        }
        el.querySelector('.x').addEventListener('click', close);
        if (pauseOnHover) {
            el.addEventListener('mouseenter', () => { if (running) { left = Math.max(0, left - (performance.now() - started)); running = false; cancelAnimationFrame(raf); el.classList.add('paused'); } });
            el.addEventListener('mouseleave', () => { if (!running && el.isConnected) { started = performance.now(); running = true; el.classList.remove('paused'); raf = requestAnimationFrame(tick); } });
        }
        // swipe dismiss
        let sx = 0, dx = 0;
        el.addEventListener('pointerdown', e => { sx = e.clientX; el.classList.add('swiping'); el.setPointerCapture(e.pointerId); });
        el.addEventListener('pointermove', e => {
            if (!sx) return; dx = e.clientX - sx;
            el.style.transform = 'translateX(' + dx + 'px)';
            el.style.opacity = Math.max(.2, 1 - Math.abs(dx) / 220);
        });
        el.addEventListener('pointerup', e => {
            sx = 0; el.classList.remove('swiping');
            if (Math.abs(dx) > 90) { el.style.transform = 'translateX(' + (dx > 0 ? 300 : -300) + 'px)'; setTimeout(close, 160); }
            else { el.style.transform = ''; el.style.opacity = ''; }
            dx = 0;
        });
        el.addEventListener('pointercancel', () => { sx = 0; el.classList.remove('swiping'); el.style.transform = ''; el.style.opacity = ''; dx = 0; });

        raf = requestAnimationFrame(tick);
        return { el, close };
    };

    /* ---------- modal (a11y + focus trap) ---------- */
    Awg.modal = {
        open(id) {
            const bd = document.getElementById(id);
            if (!bd) return;
            bd.dataset.lastFocus = document.activeElement?.id || '';
            bd.classList.add('open');
            document.body.style.overflow = 'hidden';
            Awg.trapFocus(bd);
            const first = bd.querySelector('input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), .awg-sel-trigger, [href], button:not([disabled])');
            if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
        },
        close(id) {
            const bd = document.getElementById(id);
            if (!bd) return;
            bd.classList.remove('open');
            if (!Awg.$('.awg-backdrop.open')) document.body.style.overflow = '';
            const lastId = bd.dataset.lastFocus;
            const last = lastId ? document.getElementById(lastId) : null;
            (last || bd).blur();
            if (last) setTimeout(() => last.focus({ preventScroll: true }), 0);
        },
        init() {
            document.addEventListener('click', e => {
                const t = e.target.closest('[data-awg-modal-open]');
                if (t) { Awg.modal.open(t.dataset.awgModalOpen); return; }
                const c = e.target.closest('[data-awg-modal-close]');
                if (c) { Awg.modal.close(c.dataset.awgModalClose); return; }
                if (e.target.classList.contains('awg-backdrop')) Awg.modal.close(e.target.id);
            });
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    Awg.$$('.awg-backdrop.open').forEach(b => Awg.modal.close(b.id));
                    Awg.$$('.awg-drawer.open').forEach(d => d.classList.remove('open'));
                    document.dispatchEvent(new CustomEvent('awg:esc'));
                }
            });
        }
    };
    Awg.trapFocus = function (root) {
        const focusable = () => root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        root._trapHandler = e => {
            if (e.key !== 'Tab') return;
            const list = Array.from(focusable()).filter(el => el.offsetParent !== null);
            if (!list.length) { e.preventDefault(); return; }
            const first = list[0], last = list[list.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        root.addEventListener('keydown', root._trapHandler);
    };
    Awg.untrapFocus = function (root) {
        if (root && root._trapHandler) root.removeEventListener('keydown', root._trapHandler);
    };

    /* ---------- drawer (a11y + focus trap) ---------- */
    Awg.drawer = {
        open(id) {
            const d = document.getElementById(id);
            if (!d) return;
            d.dataset.lastFocus = document.activeElement?.id || '';
            d.classList.add('open');
            Awg.trapFocus(d);
            const first = d.querySelector('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])');
            if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
        },
        close(id) {
            const d = document.getElementById(id);
            if (!d) return;
            d.classList.remove('open');
            Awg.untrapFocus(d);
            const lastId = d.dataset.lastFocus;
            const last = lastId ? document.getElementById(lastId) : null;
            if (last) setTimeout(() => last.focus({ preventScroll: true }), 0);
        },
        init() {
            document.addEventListener('click', e => {
                const o = e.target.closest('[data-awg-drawer-open]');
                if (o) { Awg.drawer.open(o.dataset.awgDrawerOpen); return; }
                const c = e.target.closest('[data-awg-drawer-close]');
                if (c) { Awg.drawer.close(c.dataset.awgDrawerClose); return; }
                if (e.target.classList.contains('awg-overlay'))
                    Awg.$$('.awg-drawer.open').forEach(d => Awg.drawer.close(d.id));
            });
        }
    };

    /* ---------- confirm ---------- */
    Awg.confirm = function (title, text, onYes, opts = {}) {
        const o = Object.assign({ yes: 'Ya, lanjutkan', no: 'Batal', danger: true }, opts);
        let bd = document.getElementById('awgConfirm');
        if (!bd) {
            bd = document.createElement('div');
            bd.id = 'awgConfirm';
            bd.className = 'awg-backdrop';
            bd.innerHTML = `
              <div class="awg-modal sm" role="dialog" aria-modal="true">
                <div class="awg-modal-head"><h3 data-c-title></h3>
                  <button class="x" data-awg-modal-close="awgConfirm" aria-label="Tutup">✕</button></div>
                <div class="awg-modal-body"><p data-c-text style="margin:0;color:var(--awg-ink-2)"></p></div>
                <div class="awg-modal-foot">
                  <button class="awg-btn awg-btn-ghost" data-c-no></button>
                  <button class="awg-btn" data-c-yes></button>
                </div>
              </div>`;
            document.body.appendChild(bd);
        }
        bd.querySelector('[data-c-title]').textContent = title;
        bd.querySelector('[data-c-text]').textContent = text;
        const yes = bd.querySelector('[data-c-yes]');
        const no = bd.querySelector('[data-c-no]');
        yes.textContent = o.yes;
        no.textContent = o.no;
        yes.className = 'awg-btn ' + (o.danger ? 'awg-btn-danger' : 'awg-btn-primary');
        yes.onclick = () => { Awg.modal.close('awgConfirm'); onYes && onYes(); };
        no.onclick = () => Awg.modal.close('awgConfirm');
        Awg.modal.open('awgConfirm');
    };

    /* ---------- dropdown ---------- */
    Awg.dropdown = {
        closeAll(except) {
            Awg.$$('.awg-dropdown-menu.open').forEach(m => { if (m !== except) m.classList.remove('open'); });
        },
        init() {
            document.addEventListener('click', e => {
                const btn = e.target.closest('[data-awg-drop]');
                const openMenu = btn ? document.getElementById(btn.dataset.awgDrop) : null;
                Awg.dropdown.closeAll(openMenu);
                if (openMenu) openMenu.classList.toggle('open');
                else if (!e.target.closest('.awg-dropdown-menu')) Awg.dropdown.closeAll();
            });
            // item dalam menu: tutup setelah klik
            document.addEventListener('click', e => {
                const item = e.target.closest('.awg-dropdown-item');
                if (item && !item.closest('.awg-dropdown-sub')) Awg.dropdown.closeAll();
            });
        }
    };

    /* ---------- popover ---------- */
    Awg.popover = {
        init() {
            document.addEventListener('click', e => {
                const t = e.target.closest('[data-awg-pop]');
                Awg.$$('.awg-pop.open').forEach(p => { if (!t || p !== document.getElementById(t.dataset.awgPop)) p.classList.remove('open'); });
                if (t) {
                    const p = document.getElementById(t.dataset.awgPop);
                    if (p) {
                        p.classList.add('open');
                        const r = t.getBoundingClientRect();
                        p.style.top = (window.scrollY + r.bottom + 6) + 'px';
                        p.style.left = Math.min(window.scrollX + r.left, document.documentElement.clientWidth - 270) + 'px';
                    }
                }
            });
        }
    };

    /* ---------- tabs / pills / segmented ---------- */
    Awg.tabs = {
        init() {
            Awg.$$('[data-awg-tabs]').forEach(group => {
                const btns = Awg.$$('[data-awg-tab]', group);
                const scope = group.closest('.awg-tabscope') || document;
                btns.forEach(b => b.addEventListener('click', () => {
                    btns.forEach(x => x.classList.remove('active'));
                    b.classList.add('active');
                    const id = b.dataset.awgTab;
                    Awg.$$('[data-awg-panel]', scope).forEach(p =>
                        p.classList.toggle('awg-hide', p.dataset.awgPanel !== id));
                    document.dispatchEvent(new CustomEvent('awg:tab', { detail: { tab: id } }));
                }));
            });
        }
    };

    /* ---------- copy buttons ---------- */
    Awg.copyButtons = {
        init() {
            document.addEventListener('click', e => {
                const btn = e.target.closest('[data-awg-copy]');
                if (!btn) return;
                const target = btn.dataset.awgCopy ? Awg.$(btn.dataset.awgCopy) : null;
                const text = target ? (target.value || target.textContent || target.dataset.value || '') : (btn.dataset.value || btn.textContent || '');
                Awg.copy(text.trim()).then(() => {
                    btn.classList.add('copied');
                    const old = btn.innerHTML;
                    const tmp = btn.dataset.awgCopyOk || '✓ Tersalin';
                    if (btn.dataset.awgCopyOk !== '') btn.innerHTML = `<svg class="awg-ic sm"><use href="assets/icons.svg#ic-check"></use></svg> ${tmp}`;
                    Awg.toast(`Disalin: ${text.trim().slice(0, 60)}${text.length > 60 ? '…' : ''}`, 'ok', 2500);
                    setTimeout(() => { btn.classList.remove('copied'); if (btn.dataset.awgCopyOk !== '') btn.innerHTML = old; }, 1500);
                }).catch(err => { Awg.toast('Gagal menyalin ke clipboard', 'bad'); console.error(err); });
            });
        }
    };

    /* ---------- accordion ---------- */
    Awg.accordion = {
        init() {
            document.addEventListener('click', e => {
                const h = e.target.closest('.awg-acc-head');
                if (h) h.closest('.awg-acc-item').classList.toggle('open');
            });
        }
    };

    /* ---------- stepper angka ---------- */
    Awg.steppers = {
        init() {
            document.addEventListener('click', e => {
                const b = e.target.closest('[data-awg-step]');
                if (!b) return;
                const wrap = b.closest('.awg-stepper');
                const inp = wrap.querySelector('input');
                const min = +inp.min || 0, max = +inp.max || Infinity;
                const dir = b.dataset.awgStep === 'up' ? 1 : -1;
                inp.value = Math.min(max, Math.max(min, (+inp.value || 0) + dir));
                inp.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
    };

    /* ---------- tags input ---------- */
    Awg.tagInput = function (box, opts = {}) {
        const o = Object.assign({ max: 0, onChange: null }, opts);
        const inp = box.querySelector('input');
        function add(val) {
            val = String(val).trim();
            if (!val) return;
            if (o.max && box.querySelectorAll('.tag').length >= o.max) return;
            if (Awg.$$('.tag', box).some(t => t.dataset.v === val)) return;
            const chip = document.createElement('span');
            chip.className = 'tag'; chip.dataset.v = val;
            chip.innerHTML = '<span></span><button type="button" aria-label="Hapus">×</button>';
            chip.firstElementChild.textContent = val;
            chip.lastElementChild.onclick = () => { chip.remove(); sync(); };
            box.insertBefore(chip, inp);
            sync();
        }
        function sync() {
            box.dataset.value = Awg.$$('.tag', box).map(t => t.dataset.v).join(',');
            o.onChange && o.onChange(box.dataset.value.split(',').filter(Boolean));
        }
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(inp.value); inp.value = ''; }
            else if (e.key === 'Backspace' && !inp.value) {
                const last = Awg.$$('.tag', box).pop(); if (last) { last.remove(); sync(); }
            }
        });
        inp.addEventListener('blur', () => { if (inp.value.trim()) { add(inp.value); inp.value = ''; } });
        box.addEventListener('click', e => { if (e.target === box) inp.focus(); });
        return { add, get: () => (box.dataset.value || '').split(',').filter(Boolean), clear: () => { Awg.$$('.tag', box).forEach(t => t.remove()); sync(); } };
    };
    Awg.tagInputs = {
        init() {
            Awg.$$('.awg-tags[data-awg-tags]').forEach(box => { box._awgTags = Awg.tagInput(box, { max: +box.dataset.awgMaxTags || 0 }); });
        }
    };

    /* ---------- validasi form ---------- */
    Awg.form = {
        showError(input, msg) {
            input.classList.add('is-invalid');
            const field = input.closest('.awg-field') || input.parentElement;
            const err = field && field.querySelector('.awg-error');
            if (err) { err.textContent = msg; err.classList.add('show'); }
        },
        clearErrors(form) {
            Awg.$$('.is-invalid', form).forEach(i => i.classList.remove('is-invalid'));
            Awg.$$('.awg-error.show', form).forEach(e => e.classList.remove('show'));
        },
        validate(form) {
            Awg.form.clearErrors(form);
            let ok = true, first = null;
            const mark = (i, m) => { Awg.form.showError(i, m); ok = false; first = first || i; };
            Awg.$$('[required]', form).forEach(i => {
                if (i.type === 'checkbox' && !i.checked) mark(i.closest('.awg-check') || i, i.dataset.msgRequired || 'Wajib dicentang');
                else if (!i.value || !String(i.value).trim()) mark(i, i.dataset.msgRequired || 'Wajib diisi');
            });
            Awg.$$('[data-awg-email]', form).forEach(i => {
                if (i.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)) mark(i, 'Format email tidak valid');
            });
            Awg.$$('[data-awg-number]', form).forEach(i => {
                if (i.value && isNaN(+i.value)) mark(i, 'Harus angka');
            });
            Awg.$$('[data-awg-min]', form).forEach(i => {
                if (i.value && +i.value < +i.dataset.awgMin) mark(i, 'Minimal ' + i.dataset.awgMin);
            });
            Awg.$$('[data-awg-max]', form).forEach(i => {
                if (i.value && +i.value > +i.dataset.awgMax) mark(i, 'Maksimal ' + i.dataset.awgMax);
            });
            Awg.$$('[data-awg-pass]', form).forEach(i => {
                if (i.value && i.value.length < 8) mark(i, 'Minimal 8 karakter');
            });
            // konfirmasi password
            const pass = Awg.$('[data-awg-pass]', form);
            const conf = Awg.$('[data-awg-pass-confirm]', form);
            if (pass && conf && conf.value && conf.value !== pass.value) mark(conf, 'Password tidak sama');
            if (first) first.focus();
            return ok;
        },
        values(form) {
            const data = {};
            new FormData(form).forEach((v, k) => {
                if (k in data) data[k] = [].concat(data[k], v); else data[k] = v;
            });
            return data;
        },
        init() {
            Awg.$$('form[data-awg-validate]').forEach(f => {
                f.addEventListener('submit', e => {
                    if (!Awg.form.validate(f)) { e.preventDefault(); Awg.toast('Periksa kembali isian formulir', 'warn'); }
                });
            });
        }
    };

    /* ---------- loading tombol ---------- */
    Awg.btnLoading = function (btn, on, label) {
        if (on) {
            btn.dataset.oldHtml = btn.innerHTML;
            btn.classList.add('awg-btn-loading', 'disabled');
            if (label) btn.dataset.oldLabel = btn.textContent;
        } else {
            btn.classList.remove('awg-btn-loading', 'disabled');
            if (btn.dataset.oldHtml) btn.innerHTML = btn.dataset.oldHtml;
        }
    };

    /* ---------- copy to clipboard ---------- */
    Awg.copy = function (text) {
        return new Promise((resolve, reject) => {
            text = String(text ?? '');
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
                return;
            }
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy') ? resolve() : reject(new Error('execCommand copy failed')); }
            catch (e) { reject(e); }
            document.body.removeChild(ta);
        });
    };

    /* ---------- init otomatis ---------- */
    function init() {
        Awg.theme.init();
        Awg.sidebar.init();
        Awg.modal.init();
        Awg.drawer.init();
        Awg.dropdown.init();
        Awg.popover.init();
        Awg.tabs.init();
        Awg.copyButtons.init();
        Awg.accordion.init();
        Awg.steppers.init();
        Awg.tagInputs.init();
        Awg.form.init();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.Awg = Awg;
})();
