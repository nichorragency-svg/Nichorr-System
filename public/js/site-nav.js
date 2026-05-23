async function loadSiteNav() {
    const mounts = document.querySelectorAll('[data-nichorr-nav]');
    if (!mounts.length) return;

    try {
        const res = await fetch('/partials/top-nav.html');
        const html = await res.text();
        mounts.forEach((mount) => {
            mount.innerHTML = html;
            const nav = mount.querySelector('.nichorr-top-nav');
            if (mount.dataset.theme === 'light' && nav) {
                nav.classList.add('theme-light');
            }
        });
        if (document.querySelector('.nichorr-top-nav:not(.theme-light)')) {
            document.body.classList.add('has-nichorr-nav');
        }
    } catch (e) {
        console.error('[SiteNav] Failed to load navigation:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadSiteNav);
