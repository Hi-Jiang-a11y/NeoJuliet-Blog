import { initTyping } from '/scripts/text-effect-typing.js';

function initTypingPage() {
    const el = document.getElementById('typing');
    if (!el) return;

    // ✅ 从 HTML 读取内容（关键）
    const text = el.dataset.text || "Welcome";

    el.textContent = '';
    initTyping('typing', text, 90, 5000);
}

/* 初次加载 */
initTypingPage();

/* 页面切换 */
document.addEventListener('astro:page-load', initTypingPage);
