// browser-compat.js
// Kindle browsers show no window.confirm dialog and silently answer false,
// so every "Are you sure?" there used to mean no. window.safeConfirm asks
// with the browser's own dialog where that works and with a small Yes/No
// panel on a Kindle, rather than answering yes unasked: a mistaken tap on
// Resign must still be undoable there.
//
// answer(yes) always runs: at once in a normal browser, after the tap on a
// Kindle. The return value is true only for a yes given at once, so a
// caller that has to decide inside its event can stop the event on false
// (confirm-actions.js) and act later if window.safeConfirm.inline is set.
(function () {
  const inline = /Kindle/i.test(navigator.userAgent || "");
  let closeOpen = null;

  function label(key, fallback) {
    return (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : fallback;
  }

  function button(text, className, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function askInline(message, answer) {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => askInline(message, answer));
      return;
    }
    if (closeOpen) closeOpen(false);

    const overlay = document.createElement("div");
    overlay.id = "safe-confirm-overlay";
    overlay.className = "result-modal-overlay";
    const box = document.createElement("div");
    box.className = "result-modal";
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-modal", "true");
    const text = document.createElement("p");
    text.textContent = message;
    const actions = document.createElement("div");
    actions.className = "result-modal-actions";

    const close = (yes) => {
      closeOpen = null;
      overlay.remove();
      answer(yes);
    };
    actions.appendChild(button(label("confirm_yes", "Yes"), "primary", () => close(true)));
    actions.appendChild(button(label("confirm_no", "No"), "secondary", () => close(false)));
    box.appendChild(text);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    closeOpen = close;
  }

  window.safeConfirm = function (message, answer) {
    if (inline) {
      askInline(message, answer);
      return false;
    }
    const yes = window.confirm(message);
    answer(yes);
    return yes;
  };
  window.safeConfirm.inline = inline;
})();
