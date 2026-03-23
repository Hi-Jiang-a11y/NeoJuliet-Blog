function initTheme() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");

    // 初始化主题（可保留，安全）
    const saved = localStorage.getItem("theme");
    if (saved && saved !== "default") {
        root.dataset.theme = saved;
    }

    // 防止重复绑定（关键）
    if (toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            menu.hidden = !menu.hidden;
        };
    }

    if (menu) {
        menu.onclick = (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const theme = btn.dataset.theme;

            if (theme === "default") {
                delete root.dataset.theme;
                localStorage.removeItem("theme");
            } else {
                root.dataset.theme = theme;
                localStorage.setItem("theme", theme);
            }

            menu.hidden = true;
        };
    }

    // 全局点击（避免重复注册）
    document.onclick = () => {
        if (menu) menu.hidden = true;
    };
}

/* 初次加载 */
initTheme();

/* 🔥 关键：页面切换后重新初始化 */
document.addEventListener("astro:page-load", () => {
    initTheme();
});
