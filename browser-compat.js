// browser-compat.js
// window.safeConfirm(message): drop-in replacement for window.confirm for
// devices whose browser reports the function but never shows a dialog.
// The Kindle e-ink browser is the known case: window.confirm exists on the
// window object, but calling it silently returns false (or hangs) instead
// of opening a dialog, which makes confirmation guards unusable there.
// On a Kindle we therefore skip the question and return true - the guarded
// action (resign, new game, ...) simply runs as if the user had confirmed.
// Everywhere else safeConfirm behaves exactly like window.confirm.
//
(function () {
  function isKindle() {
    try {
      var ua = navigator.userAgent || "";
      return /Kindle/i.test(ua);
    } catch (e) {
      return false;
    }
  }

  window.safeConfirm = function (message) {
    if (isKindle()) return true;
    return window.confirm(message);
  };
})();
