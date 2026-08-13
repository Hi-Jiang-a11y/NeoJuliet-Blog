(() => {
    if (window.__neoJulietHeaderScrollInitialized) return;
    window.__neoJulietHeaderScrollInitialized = true;

    let lastY = window.scrollY;

    const updateHeader = () => {
        const header = document.querySelector('body > header');
        if (!header) return;

        const currentY = window.scrollY;
        if (currentY <= 12) {
            header.classList.remove('header-hidden');
        } else if (currentY > lastY + 4) {
            header.classList.add('header-hidden');
        } else if (currentY < lastY - 4) {
            header.classList.remove('header-hidden');
        }
        lastY = currentY;
    };

    window.addEventListener('scroll', updateHeader, { passive: true });
    document.addEventListener('astro:page-load', () => {
        lastY = window.scrollY;
        updateHeader();
    });
})();
