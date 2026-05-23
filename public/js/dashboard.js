function openScannerPanel() {
    const panel = document.getElementById('auditPanel');
    if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const input = document.getElementById('domainInput');
        if (input) setTimeout(() => input.focus(), 400);
        return;
    }
    window.location.href = '/index.html';
}

function runSingleAudit() {
    const domain = document.getElementById('domainInput').value.trim();
    if (!domain) {
        alert('Please enter a domain first.');
        return;
    }
    const cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    saveToHistory(cleanDomain);
    window.location.href = '/modules/audit-engine/analysis-report.html?domain=' + encodeURIComponent(cleanDomain);
}

function saveToHistory(domain) {
    let history = JSON.parse(localStorage.getItem('nichorr_history') || '[]');
    history = history.filter((item) => item !== domain);
    history.unshift(domain);
    if (history.length > 5) history.pop();
    localStorage.setItem('nichorr_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const el = document.getElementById('searchHistory');
    if (!el) return;
    const history = JSON.parse(localStorage.getItem('nichorr_history') || '[]');
    el.innerHTML = history
        .map(
            (site) =>
                `<span class="history-tag" data-site="${site}">${site}</span>`
        )
        .join('');
    el.querySelectorAll('.history-tag').forEach((tag) => {
        tag.addEventListener('click', () => {
            document.getElementById('domainInput').value = tag.dataset.site;
            runSingleAudit();
        });
    });
}

async function loadDashboardStats() {
    const el = document.getElementById('totalAssets');
    if (!el) return;
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        el.innerText = data.success ? data.totalSites : '0';
    } catch (e) {
        console.error('[Dashboard] stats error:', e);
        el.innerText = '0';
    }
}

async function loadLiveSignals() {
    const el = document.getElementById('inventoryList');
    if (!el) return;
    try {
        const res = await fetch('/api/nichorr/inventory');
        const data = await res.json();
        if (!data.success || !data.data.length) {
            el.innerHTML = '<p style="color:#64748b;">No sites in vault yet. Scan one above.</p>';
            return;
        }
        el.innerHTML = data.data
            .slice(0, 8)
            .map(
                (l) =>
                    `<p style="margin:8px 0;font-size:0.9rem;"><strong>${l.siteTitle || l.websiteUrl}</strong><br>` +
                    `<span style="color:#94a3b8;">DA ${l.authorityScore} · ${l.outreachStatus}</span></p>`
            )
            .join('');
    } catch (e) {
        el.innerHTML = '<p style="color:#64748b;">Could not load live signals.</p>';
    }
}

function initDashboard() {
    const getStarted = document.getElementById('getStartedBtn');
    if (getStarted) {
        getStarted.addEventListener('click', (e) => {
            e.preventDefault();
            openScannerPanel();
        });
    }
    const auditBtn = document.getElementById('auditBtn');
    if (auditBtn) auditBtn.addEventListener('click', runSingleAudit);

    const domainInput = document.getElementById('domainInput');
    if (domainInput) {
        domainInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') runSingleAudit();
        });
    }

    renderHistory();
    loadDashboardStats();
    loadLiveSignals();
}

document.addEventListener('DOMContentLoaded', initDashboard);
