// backup.js
// Lets a player back up and restore all of PaperGames' local data (per-
// game saves, win/loss/streak stats - achievements are derived from
// those, so nothing extra to save for them - favorites, and
// preferences like language/font size/adaptive difficulty) as a single
// JSON file. The only way to survive a device reset or browser data
// clear, since everything otherwise lives only in this browser's
// localStorage and nowhere else - this project has no server, no
// accounts, and nothing to sync from.
//
// Deliberately excludes the Lichess OAuth token
// (einkchess_lichess_manual_token): it's a live credential, not player
// data, and reconnecting after a restore is one click on the Chess
// page - a backup file is worth keeping around or sharing between a
// player's own devices without also carrying that around.

const Backup = (function () {
  const PREFIX = "einkchess_";
  const EXCLUDED = ["einkchess_lichess_manual_token"];

  function collect() {
    const data = {};
    if (!window.localStorage) return data;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.indexOf(PREFIX) === 0 && EXCLUDED.indexOf(key) === -1) {
        data[key] = window.localStorage.getItem(key);
      }
    }
    return data;
  }

  function exportBackup() {
    const payload = {
      app: "PaperGames",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: collect()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "papergames-backup-" + payload.exportedAt.slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function isValidPayload(obj) {
    return !!obj && typeof obj === "object" && !!obj.data && typeof obj.data === "object" && !Array.isArray(obj.data);
  }

  // callback(error) - error is null on success, or an Error describing
  // what went wrong (invalid JSON, wrong shape, or a storage failure).
  function importBackup(file, callback) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (e) {
        callback(new Error("invalid_json"));
        return;
      }
      if (!isValidPayload(parsed)) {
        callback(new Error("invalid_format"));
        return;
      }
      try {
        Object.keys(parsed.data).forEach((key) => {
          if (key.indexOf(PREFIX) === 0 && EXCLUDED.indexOf(key) === -1) {
            window.localStorage.setItem(key, parsed.data[key]);
          }
        });
      } catch (e) {
        callback(new Error("storage_failed"));
        return;
      }
      callback(null);
    };
    reader.onerror = () => callback(new Error("read_failed"));
    reader.readAsText(file);
  }

  return { exportBackup, importBackup };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Backup;
}
