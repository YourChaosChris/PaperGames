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

  // A panel on the page with the message, an optional text field and the
  // buttons. fill(box, actions, close) adds them; close(result) removes the
  // panel and passes result on. An open panel is answered with "none".
  function panel(id, message, none, answer, fill) {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => panel(id, message, none, answer, fill));
      return;
    }
    if (closeOpen) closeOpen();

    const overlay = document.createElement("div");
    overlay.id = id;
    overlay.className = "result-modal-overlay";
    const box = document.createElement("div");
    box.className = "result-modal";
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-modal", "true");
    const text = document.createElement("p");
    text.textContent = message;
    box.appendChild(text);
    const actions = document.createElement("div");
    actions.className = "result-modal-actions";

    const close = (result) => {
      closeOpen = null;
      overlay.remove();
      answer(result);
    };
    fill(box, actions, close);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    closeOpen = () => close(none);
  }

  function askInline(message, answer) {
    panel("safe-confirm-overlay", message, false, answer, (box, actions, close) => {
      actions.appendChild(button(label("confirm_yes", "Yes"), "primary", () => close(true)));
      actions.appendChild(button(label("confirm_no", "No"), "secondary", () => close(false)));
    });
  }

  function copyField(field, done) {
    const viaSelection = () => {
      field.focus();
      field.select();
      try { done(document.execCommand("copy")); } catch (e) { done(false); }
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(field.value).then(() => done(true), viaSelection);
    } else {
      viaSelection();
    }
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

  // window.prompt does not work on a Kindle either (task 218), so text is
  // always asked for on the page. answer(text) gets the entered text, or
  // null after Cancel. With opts.copy the field only shows value, ready to
  // be marked and copied, and answer(null) runs on Close.
  window.safePrompt = function (message, value, answer, opts) {
    const copy = !!(opts && opts.copy);
    panel("safe-prompt-overlay", message, null, answer, (box, actions, close) => {
      const field = document.createElement("input");
      field.type = "text";
      field.className = "safe-prompt-field";
      field.value = value || "";
      field.setAttribute("aria-label", message);
      field.setAttribute("autocomplete", "off");
      box.appendChild(field);
      if (copy) {
        field.readOnly = true;
        field.addEventListener("focus", () => field.select());
        const note = document.createElement("p");
        note.className = "status-text";
        note.setAttribute("aria-live", "polite");
        const copyBtn = button(label("prompt_copy", "Copy"), "primary", () => {
          copyField(field, (ok) => {
            note.textContent = ok ? label("prompt_copied", "Copied.") : "";
            if (!ok) { field.focus(); field.select(); }
          });
        });
        box.appendChild(note);
        actions.appendChild(copyBtn);
        actions.appendChild(button(label("prompt_close", "Close"), "secondary", () => close(null)));
      } else {
        field.addEventListener("keydown", (e) => { if (e.key === "Enter") close(field.value); });
        actions.appendChild(button(label("prompt_ok", "OK"), "primary", () => close(field.value)));
        actions.appendChild(button(label("prompt_cancel", "Cancel"), "secondary", () => close(null)));
      }
    });
  };
})();
