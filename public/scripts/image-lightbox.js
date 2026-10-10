(() => {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', '放大图片');
    lightbox.innerHTML = `
        <img class="image-lightbox__image" alt="">
    `;
    // Keep the lightbox outside Astro's swapped <body> so it survives
    // client-side page transitions.
    document.documentElement.append(lightbox);

    const enlargedImage = lightbox.querySelector('.image-lightbox__image');
    let lastFocusedElement = null;
    let closeTimer;

    const close = () => {
        if (lightbox.hidden) return;
        lightbox.classList.remove('is-open');
        document.body.classList.remove('image-lightbox-open');
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
            lightbox.hidden = true;
            enlargedImage.removeAttribute('src');
        }, 180);
        lastFocusedElement?.focus?.();
    };

    const open = (image) => {
        window.clearTimeout(closeTimer);
        lastFocusedElement = document.activeElement;
        enlargedImage.src = image.currentSrc || image.src;
        enlargedImage.alt = image.alt || '';
        lightbox.hidden = false;
        document.body.classList.add('image-lightbox-open');
        requestAnimationFrame(() => lightbox.classList.add('is-open'));
    };

    document.addEventListener('click', (event) => {
        const image = event.target.closest?.('.prose img');
        if (image) {
            event.preventDefault();
            open(image);
            return;
        }
        if (event.target === lightbox || event.target === enlargedImage) close();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
    });
})();
