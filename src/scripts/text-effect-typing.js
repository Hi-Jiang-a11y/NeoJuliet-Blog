export function initTyping(elementId, text = "Welcome to Juliet's Blog", speed = 100, delay = 2000) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let i = 0;

  function typeChar() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(typeChar, speed);
    } else {
      el.classList.add("blinking");
      setTimeout(() => {
        el.classList.remove("blinking");
        el.textContent = "";
        i = 0;
        typeChar();
      }, delay);
    }
  }

  typeChar();
}

