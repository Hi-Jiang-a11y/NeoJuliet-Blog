let typingVersion = 0;

export function initTyping(
  elementId,
  text = "Welcome",
  speed = 100,
  delay = 2000
) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // ✅ 每次调用生成新版本
  const currentVersion = ++typingVersion;

  let i = 0;
  el.textContent = "";

  function typeChar() {
    // ❗ 如果不是当前版本，立即停止
    if (currentVersion !== typingVersion) return;

    if (!document.body.contains(el)) return;

    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(typeChar, speed);
    } else {
      el.classList.add("blinking");

      setTimeout(() => {
        if (currentVersion !== typingVersion) return;
        if (!document.body.contains(el)) return;

        el.classList.remove("blinking");
        el.textContent = "";
        i = 0;
        typeChar();
      }, delay);
    }
  }

  typeChar();
}
