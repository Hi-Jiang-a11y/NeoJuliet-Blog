let tocObserver = null;

function initToc() {
    const nav = document.querySelector('.toc');
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;

    // ✅ 清理旧 observer（关键）
    if (tocObserver) {
        tocObserver.disconnect();
        tocObserver = null;
    }

    const mapping = links.map(link => {
        const href = link.getAttribute('href');
        if (!href || href.length < 2) return null;

        let id = href.slice(1);
        try { id = decodeURIComponent(id); } catch {}

        const target = document.getElementById(id);
        if (!target) return null;

        return { link, target };
    }).filter(Boolean);

    if (!mapping.length) return;

    const linkById = new Map(mapping.map(m => [m.target.id, m.link]));

    // ✅ 防止重复绑定（用 onclick 覆盖）
    mapping.forEach(({ link, target }) => {
        link.onclick = (e) => {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                history.replaceState(null, '', '#' + target.id);
            }, 120);
        };
    });

    // ✅ IntersectionObserver
    if ('IntersectionObserver' in window) {
        tocObserver = new IntersectionObserver((entries) => {

            let closest = null;

            for (const { target } of mapping) {
                const rect = target.getBoundingClientRect();
                if (rect.top <= window.innerHeight * 0.5) {
                    const d = Math.abs(rect.top);
                    if (!closest || d < closest.d) {
                        closest = { id: target.id, d };
                    }
                }
            }

            if (closest) {
                linkById.forEach(l => l.classList.remove('active'));
                const active = linkById.get(closest.id);
                if (active) active.classList.add('active');
                return;
            }

        }, {
            root: null,
            rootMargin: '0px 0px -70% 0px',
            threshold: 0
        });

        mapping.forEach(m => tocObserver.observe(m.target));
    }
}

/* 初次加载 */
initToc();

/* 页面切换 */
document.addEventListener('astro:page-load', initToc);
