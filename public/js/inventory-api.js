async function updateOutreachStatus(id, status) {
    try {
        const res = await fetch('/api/nichorr/inventory/update-status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        const data = await res.json();
        if (!data.success) console.error('Status update failed:', data.message);
    } catch (err) {
        console.error('Status update error:', err);
    }
}

function updateManualEmail(id, email) {
    const row = masterData.find((l) => l._id === id);
    if (row) row.ownerEmail = email;
}

async function mailToClientReport(client, selectedAssets) {
    const res = await fetch('/api/nichorr/send-report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: client.clientEmail,
            clientName: client.clientName,
            selectedAssets,
            websiteLink: window.location.origin + '/modules/audit-engine/inventory.html'
        })
    });
    return res.json();
}
