const OPERATOR_EMAIL = 'nichorragency@gmail.com';

function toast(msg, ok) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast ' + (ok ? 'ok' : 'err');
    setTimeout(() => { el.className = 'toast'; }, 4500);
}

async function scanSite() {
    const url = document.getElementById('siteUrl').value.trim();
    const btn = document.getElementById('scanBtn');
    const spin = document.getElementById('scanSpinner');

    if (!url) return toast('Please enter a website link.', false);

    btn.disabled = true;
    spin.classList.add('show');

    try {
        const res = await fetch('/api/nichorr/analyze-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUrl: url,
                category: 'General Industry',
                userEmail: OPERATOR_EMAIL
            })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        toast(data.updated ? 'Site updated in vault!' : 'Site scanned and added!', true);
        document.getElementById('siteUrl').value = '';
        loadVault();
    } catch (e) {
        toast(e.message || 'Scan failed. Check the URL and try again.', false);
    } finally {
        btn.disabled = false;
        spin.classList.remove('show');
    }
}

function renderVault(items) {
    const list = document.getElementById('vaultList');
    const pending = items.filter((i) => i.outreachStatus === 'Pending');
    document.getElementById('pendingCount').textContent = pending.length + ' pending';

    if (!pending.length) {
        list.innerHTML = '<p class="empty">No pending sites. Scan a new link above.</p>';
        return;
    }

    list.innerHTML = pending.map((row) => `
        <div class="site-row" data-id="${row._id}">
            <div class="site-info">
                <strong>${esc(row.siteTitle || row.websiteUrl)}</strong>
                <small>${esc(row.websiteUrl)} · DA ${row.authorityScore}</small>
                <input type="email" class="email-edit" data-email-for="${row._id}"
                    placeholder="Contact email (required)"
                    value="${row.ownerEmail !== 'Not Found' ? esc(row.ownerEmail) : ''}">
            </div>
            <button type="button" class="btn btn-pitch" data-pitch="${row._id}">🚀 Send Automated Email Pitch</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-pitch]').forEach((btn) => {
        btn.addEventListener('click', () => sendPitch(btn));
    });
}

async function sendPitch(btn) {
    const row = btn.closest('.site-row');
    const id = btn.dataset.pitch;
    const emailInput = row.querySelector('[data-email-for="' + id + '"]');
    const email = (emailInput && emailInput.value.trim()) || '';

    if (!email || !email.includes('@')) {
        return toast('Enter a valid email for this site first.', false);
    }

    btn.disabled = true;
    btn.textContent = 'Sending professional pitch...';

    try {
        const res = await fetch('/api/nichorr/admin/send-pitch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, targetEmail: email })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        toast('Email sent! Status is now Contacted.', true);
        loadVault();
    } catch (e) {
        toast(e.message || 'Could not send email.', false);
        btn.disabled = false;
        btn.textContent = 'Send Automated Email Pitch';
    }
}

async function loadVault() {
    try {
        const res = await fetch('/api/nichorr/inventory?status=Pending');
        const data = await res.json();
        renderVault(data.success ? data.data : []);
    } catch (e) {
        document.getElementById('vaultList').innerHTML =
            '<p class="empty">Could not load vault. Is the server running?</p>';
    }
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

document.getElementById('scanBtn').addEventListener('click', scanSite);
document.getElementById('siteUrl').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') scanSite();
});
loadVault();
