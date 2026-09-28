/* ===========================================================
   AWG-UIKIT-RACING — Notification Center + Chat (shared, lokal)
   Author : AWGNET-RACING & AGENT AI TEAM
   =========================================================== */
(function () {
    'use strict';
    const d = document;

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /* ============ NOTIFICATION CENTER ============ */
    const Notif = {
        items: [],
        filter: 'all',
        _el: null,
        init(items) {
            if (items) this.items = items;
            this._els = d.querySelectorAll('[data-awg-notif]');
            this._els.forEach(host => {
                const btn = host.querySelector('[data-awg-notif-btn]');
                const panel = host.querySelector('.awg-notif-panel');
                if (!btn || !panel) return;
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    const open = panel.classList.toggle('open');
                    if (open) this.render(panel);
                });
                d.addEventListener('click', e => {
                    if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
                });
                d.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('open'); });
            });
            this.updateBadges();
        },
        updateBadges() {
            const n = this.items.filter(i => i.unread).length;
            d.querySelectorAll('[data-awg-notif-count]').forEach(el => {
                el.textContent = n;
                el.hidden = n === 0;
            });
        },
        render(panel) {
            const list = panel.querySelector('.awg-notif-list');
            if (!list) return;
            const tabs = panel.querySelector('.awg-notif-tabs');
            if (tabs && !tabs._wired) {
                tabs._wired = true;
                tabs.addEventListener('click', e => {
                    const b = e.target.closest('button[data-filter]');
                    if (!b) return;
                    this.filter = b.dataset.filter;
                    tabs.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
                    this.render(panel);
                });
            }
            const markBtn = panel.querySelector('[data-awg-notif-mark]');
            if (markBtn && !markBtn._wired) {
                markBtn._wired = true;
                markBtn.addEventListener('click', () => {
                    this.items.forEach(i => i.unread = false);
                    this.render(panel); this.updateBadges();
                });
            }
            const rows = this.filter === 'all' ? this.items : this.items.filter(i => i.type === this.filter);
            list.innerHTML = rows.length ? rows.map(i => `
                <button type="button" class="awg-notif-item${i.unread ? ' unread' : ''}" data-id="${esc(String(i.id))}">
                    <span class="ic ${esc(i.type)}"><svg class="awg-ic"><use href="${esc(i.icon || 'assets/icons.svg#ic-bell')}"></use></svg></span>
                    <span class="body"><b>${esc(i.title)}</b><small>${esc(i.text)}</small><time>${esc(i.time)}</time></span>
                    ${i.unread ? '<span class="dot-unread" aria-label="Belum dibaca"></span>' : ''}
                </button>`).join('')
                : `<div class="awg-notif-empty"><svg class="awg-ic"><use href="assets/icons.svg#ic-bell"></use></svg><p class="awg-small">Tidak ada notifikasi di kategori ini.</p></div>`;
            list.querySelectorAll('.awg-notif-item').forEach(el =>
                el.addEventListener('click', () => {
                    const it = this.items.find(x => String(x.id) === el.dataset.id);
                    if (it) { it.unread = false; this.render(panel); this.updateBadges(); }
                    if (it && it.href) location.href = it.href;
                }));
        }
    };

    /* ============ CHAT / MESSENGER ============ */
    const Chat = {
        init() {
            d.querySelectorAll('[data-awg-chat]').forEach(box => {
                const threads = box.querySelector('.awg-chat-threads');
                if (!threads) return;
                threads.addEventListener('click', e => {
                    const th = e.target.closest('[data-chat-id]');
                    if (!th) return;
                    threads.querySelectorAll('.awg-chat-thread').forEach(x => x.classList.toggle('active', x === th));
                    // ganti thread: load data-thread attr
                    const data = th.dataset;
                    const nameEl = box.querySelector('[data-chat-name]');
                    const statEl = box.querySelector('[data-chat-status]');
                    if (nameEl) nameEl.textContent = data.name || '';
                    if (statEl) statEl.textContent = data.status || '';
                    const msgs = box.querySelector('.awg-chat-msgs');
                    if (msgs && data.messages) {
                        try {
                            msgs.innerHTML = JSON.parse(data.messages).map(m =>
                                `<div class="awg-msg ${m.me ? 'me' : 'them'}">${esc(m.text)}<time>${esc(m.time)}</time></div>`).join('');
                        } catch (err) { /* abaikan JSON rusak */ }
                    }
                    if (box.classList.contains('list-only')) {
                        box.classList.remove('list-only');
                        box.classList.add('thread-only');
                    }
                    const unread = th.querySelector('.side .n');
                    if (unread) unread.remove();
                    const inp = box.querySelector('.awg-chat-input input');
                    if (inp) inp.focus();
                });
                const back = box.querySelector('[data-chat-back]');
                if (back) back.addEventListener('click', () => {
                    box.classList.remove('thread-only');
                    box.classList.add('list-only');
                });
                const form = box.querySelector('[data-chat-send]');
                if (form) form.addEventListener('submit', e => {
                    e.preventDefault();
                    const inp = form.querySelector('input');
                    const txt = inp.value.trim();
                    if (!txt) return;
                    const msgs = box.querySelector('.awg-chat-msgs');
                    const t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    msgs.insertAdjacentHTML('beforeend', `<div class="awg-msg me">${esc(txt)}<time>${t}</time></div>`);
                    msgs.scrollTop = msgs.scrollHeight;
                    inp.value = '';
                    // demo auto-reply setelah 1.2s
                    setTimeout(() => {
                        if (!msgs.isConnected) return;
                        msgs.insertAdjacentHTML('beforeend',
                            `<div class="awg-msg them">Baik, terima kasih informasinya 🙏<time>${t}</time></div>`);
                        msgs.scrollTop = msgs.scrollHeight;
                    }, 1200);
                });
            });
        }
    };

    function init() {
        Notif.init();
        Chat.init();
    }
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
    else init();

    window.AwgNotif = Notif;
    window.AwgChat = Chat;
})();
