function initCalendar() {
    const root = document.getElementById("calendar-root");
    if (!root) return;

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    function isToday(date) {
        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        );
    }

    let html = `
        <div class="calendar-header">
            <h3>${monthNames[month]} ${year}</h3>
        </div>
        <div class="calendar-grid">
    `;

    for (const d of daysOfWeek) {
        html += `<div class="calendar-day-week">${d}</div>`;
    }

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const cls = isToday(dateObj) ? "today" : "";
        html += `<div class="calendar-day ${cls}">${day}</div>`;
    }

    html += `</div>`;

    root.innerHTML = html;
}

/* 初次加载 */
initCalendar();

/* 页面切换 */
document.addEventListener("astro:page-load", initCalendar);
