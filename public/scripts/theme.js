(() => {
if (window.__neoJulietThemeInitialized) return;
window.__neoJulietThemeInitialized = true;

function initTheme() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById("theme-toggle");

    // 初始化主题（可保留，安全）
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        root.dataset.theme = saved;
    } else if (saved) {
        delete root.dataset.theme;
        localStorage.removeItem("theme");
    }

    if (toggleBtn) {
        const updateLabel = () => {
            const isDark = root.dataset.theme === "dark";
            toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
            toggleBtn.setAttribute("aria-pressed", String(isDark));
        };
        updateLabel();
        toggleBtn.onclick = () => {
            if (root.dataset.theme === "dark") {
                delete root.dataset.theme;
                localStorage.removeItem("theme");
            } else {
                root.dataset.theme = "dark";
                localStorage.setItem("theme", "dark");
            }
            updateLabel();
        };
    }
}

/* 初次加载 */
initTheme();

/* 🔥 关键：页面切换后重新初始化 */
document.addEventListener("astro:page-load", () => {
    initTheme();
});

/* Preserve the active theme on Astro client-side navigations. Without this,
   the incoming document briefly renders with the default light theme. */
document.addEventListener("astro:before-swap", (event) => {
    if (!event.newDocument) return;
    const theme = document.documentElement.dataset.theme;
    if (theme === "dark") {
        event.newDocument.documentElement.dataset.theme = "dark";
    } else {
        delete event.newDocument.documentElement.dataset.theme;
    }
});
})();
