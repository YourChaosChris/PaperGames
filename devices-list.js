// devices-list.js
// The e-readers PaperGames is known to run on, kept by hand - one entry
// per device, in the style of games-catalog.js, so a new report is one
// more line here. Only devices someone has actually reported back on go
// in; no person's name, ever - just the device and the dates.
//
//   device     the device's name (a proper name, not translated)
//   screen     screen size, or null when the report didn't name the model
//   checkedKey i18n key saying what was checked
//   dates      date(s) of the report(s), as shown
//
// devices.html shows the list as a table; nothing is detected or sent.

const DEVICES_LIST = [
  { device: "PocketBook Era", screen: "7″", checkedKey: "devices_checked_user_report", dates: "2026-09-28, 2026-09-30" },
  { device: "Tolino Vision Color", screen: "7″", checkedKey: "devices_checked_user_report", dates: "2026-09-30" },
  { device: "Boox", screen: null, checkedKey: "devices_checked_user_report", dates: "2026-09-25 – 2026-10-05" }
];

(function () {
  function cell(tag, text, key) {
    const el = document.createElement(tag);
    if (key) {
      el.setAttribute("data-i18n", key);
      el.textContent = (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : text;
    } else {
      el.textContent = text;
    }
    return el;
  }

  function render() {
    const body = document.getElementById("devices-table-body");
    if (!body) return;
    body.innerHTML = "";
    DEVICES_LIST.forEach((d) => {
      const tr = document.createElement("tr");
      tr.appendChild(cell("td", d.device));
      tr.appendChild(d.screen ? cell("td", d.screen) : cell("td", "model not reported", "devices_screen_unknown"));
      tr.appendChild(cell("td", "", d.checkedKey));
      tr.appendChild(cell("td", d.dates));
      body.appendChild(tr);
    });
  }

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", render);
})();

if (typeof window !== "undefined") window.DEVICES_LIST = DEVICES_LIST;
if (typeof module !== "undefined" && module.exports) module.exports = DEVICES_LIST;
