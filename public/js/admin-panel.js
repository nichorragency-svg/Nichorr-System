async function fetchTrends() {
    const list = document.getElementById('trendList');
    try {
        const resp = await fetch('/api/nichorr/admin/trends');
        const data = await resp.json();
        if (!data.success || !data.trends.length) {
            list.innerHTML = '<p class="muted">No trends found.</p>';
            return;
        }
        list.innerHTML = data.trends.map((t) => `
            <div class="trend-item">
                <div>
                    <strong>${escapeHtml(t.title)} <span class="tag">Trend</span></strong>
                    <small class="muted">${escapeHtml((t.contentSnippet || '').slice(0, 100))}...</small>
                </div>
                <button type="button" class="btn-write" data-topic="${escapeAttr(t.title)}">Use topic</button>
            </div>`).join('');
        list.querySelectorAll('[data-topic]').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.getElementById('aiTopic').value = btn.dataset.topic;
                document.getElementById('aiWriter').scrollIntoView({ behavior: 'smooth' });
            });
        });
    } catch (e) {
        list.innerHTML = '<p class="error-text">Trend radar connection failed.</p>';
    }
}

async function loadDashboardData() {
    try {
        const statResp = await fetch('/api/nichorr/admin/stats');
        const statData = await statResp.json();
        if (statData.success) {
            document.getElementById('blogCount').innerText = statData.stats.blogs;
            document.getElementById('ebookCount').innerText = statData.stats.ebooks;
            document.getElementById('linkCount').innerText = statData.stats.links;
        }
        const blogResp = await fetch('/api/blogs');
        const blogData = await blogResp.json();
        renderBlogTable(blogData.success ? blogData.blogs : []);
    } catch (e) {
        console.error('Dashboard load error:', e);
    }
}

function renderBlogTable(blogs) {
    const tableBody = document.getElementById('blogTableBody');
    if (!blogs.length) {
        tableBody.innerHTML = '<tr><td colspan="3" class="center">No posts found.</td></tr>';
        return;
    }
    tableBody.innerHTML = blogs.map((blog) => `
        <tr>
            <td>${escapeHtml(blog.title)}</td>
            <td>${new Date(blog.createdAt).toLocaleDateString()}</td>
            <td><button type="button" class="btn-delete" data-id="${blog._id}">Delete</button></td>
        </tr>`).join('');
    tableBody.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', () => deleteBlog(btn.dataset.id));
    });
}

async function deleteBlog(id) {
    if (!confirm('Delete this post?')) return;
    const resp = await fetch(`/api/blogs/delete/${id}`, { method: 'DELETE' });
    const res = await resp.json();
    if (res.success) {
        showToast('Post deleted.', 'success');
        loadDashboardData();
    } else showToast('Delete failed.', 'error');
}

async function updateRights() {
    const email = document.getElementById('userEmail').value;
    const plan = document.getElementById('userPlan').value;
    const secret = document.getElementById('adminSecret').value;
    const status = document.getElementById('statusMsg');
    try {
        const resp = await fetch('/api/nichorr/admin/upgrade-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, plan, secret })
        });
        const data = await resp.json();
        status.innerText = data.message;
        status.className = data.success ? 'ok' : 'error-text';
    } catch (e) {
        status.innerText = 'Error updating user.';
        status.className = 'error-text';
    }
}

async function generateAiArticle(e) {
    e.preventDefault();
    const topic = document.getElementById('aiTopic').value.trim();
    const category = document.getElementById('aiCategory').value;
    const btn = document.getElementById('aiSubmitBtn');
    const loading = document.getElementById('aiLoading');

    if (!topic) return showToast('Enter a topic.', 'error');

    btn.disabled = true;
    loading.hidden = false;

    try {
        const resp = await fetch('/api/blogs/generate-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, category })
        });
        const data = await resp.json();
        if (!data.success) throw new Error(data.message || 'Generation failed');

        showToast(`Published: ${data.blog.title}`, 'success');
        document.getElementById('aiTopic').value = '';
        loadDashboardData();
    } catch (err) {
        showToast(err.message || 'AI generation failed.', 'error');
    } finally {
        btn.disabled = false;
        loading.hidden = true;
    }
}

function showToast(msg, type) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast toast-${type}`;
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 4500);
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
}

document.getElementById('aiForm').addEventListener('submit', generateAiArticle);
document.getElementById('upgradeBtn').addEventListener('click', updateRights);
window.addEventListener('load', () => {
    fetchTrends();
    loadDashboardData();
});
