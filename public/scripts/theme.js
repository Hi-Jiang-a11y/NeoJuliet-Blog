const root = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle");
const menu = document.getElementById("theme-menu");

// 初始化主题
const saved = localStorage.getItem("theme");
if (saved) {
	root.dataset.theme = saved;
}

// 打开 / 关闭菜单
toggleBtn?.addEventListener("click", (e) => {
	e.stopPropagation();
	menu.hidden = !menu.hidden;
});

// 切换主题
menu?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const theme = btn.dataset.theme;

    if (theme === "default") {
        // 回到 :root
        delete root.dataset.theme;
        localStorage.removeItem("theme");
    } else {
        root.dataset.theme = theme;
        localStorage.setItem("theme", theme);
    }

    menu.hidden = true;
});
// 点击空白处关闭
document.addEventListener("click", () => {
	menu.hidden = true;
});

