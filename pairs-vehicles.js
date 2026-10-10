// pairs-vehicles.js
// The "Vehicles" card faces for Pairs: 18 line drawings in the style of
// pairs-animals.js (viewBox 0 0 40 40, black on white), most seen from
// the side. Each one is told apart by its outline - wheels, rotor, sail,
// ladder, tracks, balloon - never by colour, so they read on
// black-and-white e-ink. Look-alikes are left out on purpose: no tram
// next to the bus, no motorbike next to the bicycle, no taxi next to the
// car.

const PairsVehicles = (function () {
  const S = 'fill="none" stroke="#141413" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const T = 'fill="none" stroke="#141413" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const B = 'fill="#141413"';
  const W = 'fill="#fff" stroke="#141413" stroke-width="2.4" stroke-linejoin="round"';
  const wheel = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + B + '/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.38).toFixed(1) + '" fill="#fff"/>';
  const icons = {
    // Car: low body with a rounded roof and two wheels.
    car: '<path d="M3 27V21L9 19.5L13 12H26L31 19.5L37 21V27Z" ' + W + '/>' +
      '<path d="M20 12.5V19.5M10 19.5H31" ' + T + '/>' + wheel(11, 27.5, 4.2) + wheel(29, 27.5, 4.2),
    // Bus: long box with a row of windows.
    bus: '<rect x="2.5" y="8" width="35" height="20" rx="3" ' + W + '/>' +
      '<path d="M6 12H12V18H6ZM15 12H21V18H15ZM24 12H30V18H24ZM33 12V24" ' + T + '/>' + wheel(10, 29, 4) + wheel(30, 29, 4),
    // Truck: tall cargo box behind a small cab.
    truck: '<rect x="2.5" y="7" width="21" height="20" ' + W + '/>' +
      '<path d="M23.5 13H31L37 20V27H23.5Z" ' + W + '/><path d="M26.5 15.5H30.5L34 20H26.5Z" ' + T + '/>' +
      wheel(9, 29, 4) + wheel(31, 29, 4),
    // Tractor: big back wheel, small front wheel, cab and exhaust.
    tractor: '<path d="M28 15V7" ' + S + '/><rect x="8" y="5" width="11" height="12" ' + T + '/>' +
      '<rect x="18" y="15" width="16" height="8" ' + W + '/>' +
      '<circle cx="12" cy="27" r="9" ' + W + '/><circle cx="12" cy="27" r="3.2" ' + B + '/>' +
      '<circle cx="31" cy="30" r="5" ' + W + '/><circle cx="31" cy="30" r="1.8" ' + B + '/>',
    // Bicycle: two thin wheels, frame, saddle and handlebar.
    bicycle: '<circle cx="9.5" cy="26" r="7" ' + S + '/><circle cx="30.5" cy="26" r="7" ' + S + '/>' +
      '<path d="M9.5 26L16 16H27L30.5 26M16 16L21 26L27 16M13.5 12.5H19M16 16L16 12.5M27 16L26 11H30" ' + S + ' stroke-width="2"/>',
    // Kick scooter: low deck, two small wheels, tall handle.
    scooter: '<path d="M7 30H28L25 8M20.5 8H29.5" ' + S + ' stroke-width="3"/>' + wheel(9, 32, 3.4) + wheel(29, 32, 3.4),
    // Train: steam engine with chimney, cab and three wheels.
    train: '<rect x="4" y="15" width="18" height="13" ' + W + '/><rect x="20" y="7" width="13" height="21" ' + W + '/>' +
      '<rect x="8" y="8" width="5" height="7" ' + B + '/><rect x="23" y="10.5" width="7" height="5.5" ' + T + '/>' +
      '<path d="M4 28L1.5 32" ' + S + '/>' + wheel(10, 30.5, 3.6) + wheel(18.5, 30.5, 3.6) + wheel(27.5, 30.5, 3.6),
    // Ship: hull with portholes, cabin and filled funnel, on waves.
    ship: '<rect x="18" y="7" width="5" height="9" ' + B + '/><rect x="10" y="15" width="17" height="8" ' + W + '/>' +
      '<path d="M3 23H37L32 32H8Z" ' + W + '/>' +
      '<circle cx="13" cy="27" r="1.4" ' + B + '/><circle cx="20" cy="27" r="1.4" ' + B + '/><circle cx="27" cy="27" r="1.4" ' + B + '/>' +
      '<path d="M2 36Q5 34 8 36T14 36T20 36T26 36T32 36T38 36" ' + T + '/>',
    // Sailboat: small hull, a white and a filled sail on one mast.
    sailboat: '<path d="M20 28V4" ' + S + '/><path d="M21.5 6L33 26H21.5Z" ' + W + '/><path d="M18.5 9L9 26H18.5Z" ' + B + '/>' +
      '<path d="M5 28H35L30 34H10Z" ' + W + '/>' +
      '<path d="M2 37.5Q5 35.5 8 37.5T14 37.5T20 37.5T26 37.5T32 37.5T38 37.5" ' + T + '/>',
    // Airplane: long body with a tail fin, a filled wing and windows.
    airplane: '<path d="M14 21L22 31H26.5L22.5 21Z" ' + B + '/>' +
      '<path d="M2 20.5C2 17.5 6 16 10 16H30L35.5 8.5H38L36.5 20.5C36.5 21.5 35.5 22 34 22H5C3 22 2 21.5 2 20.5Z" ' + W + '/>' +
      '<circle cx="12" cy="19" r="1.1" ' + B + '/><circle cx="16.5" cy="19" r="1.1" ' + B + '/><circle cx="21" cy="19" r="1.1" ' + B + '/><circle cx="25.5" cy="19" r="1.1" ' + B + '/>' +
      '<path d="M3 18.5C4 17.5 6 17 8 17V20H3Z" ' + B + '/>',
    // Helicopter: round cabin, long tail, rotor on top and skids.
    helicopter: '<path d="M4 10H31M17.5 10V15M27 21H37.5M37 16V26M9 33H27M12.5 29V33M22.5 29V33" ' + S + '/>' +
      '<ellipse cx="17.5" cy="22" rx="10.5" ry="7.5" ' + W + '/>' +
      '<path d="M8 22C8 18 11 16.5 15 16.5V22Z" ' + B + '/>',
    // Rocket: pointed body with a round window, filled fins and a flame.
    rocket: '<path d="M14 22L8 30V34L14 29.5ZM26 22L32 30V34L26 29.5Z" ' + B + '/>' +
      '<path d="M20 2.5C27 8.5 27 20 26 29H14C13 20 13 8.5 20 2.5Z" ' + W + '/>' +
      '<circle cx="20" cy="14" r="3.6" ' + T + '/><path d="M17 31L20 38L23 31" ' + S + '/>',
    // Fire engine: long body with a ladder on top, siren on the cab.
    fireengine: '<path d="M4 9.5H27M4 13.5H27M7 9.5V13.5M11 9.5V13.5M15 9.5V13.5M19 9.5V13.5M23 9.5V13.5" ' + T + '/>' +
      '<rect x="2.5" y="15.5" width="26.5" height="11.5" ' + W + '/>' +
      '<path d="M29 15.5H33L37.5 21V27H29Z" ' + W + '/><rect x="30" y="11.5" width="3.5" height="4" ' + B + '/>' +
      wheel(9.5, 29, 4) + wheel(31, 29, 4),
    // Excavator: tracks, body with cab, bent arm with a filled bucket.
    excavator: '<path d="M20 22L29 8L36 16" ' + S + ' stroke-width="3.2"/>' +
      '<path d="M33 15.5L38.5 18L36.5 25L31.5 22Z" ' + B + '/>' +
      '<rect x="5" y="18" width="17" height="10" ' + W + '/><rect x="8" y="11.5" width="8.5" height="6.5" ' + T + '/>' +
      '<rect x="2.5" y="28.5" width="23" height="8" rx="4" ' + W + '/>' +
      '<circle cx="7" cy="32.5" r="1.6" ' + B + '/><circle cx="14" cy="32.5" r="1.6" ' + B + '/><circle cx="21" cy="32.5" r="1.6" ' + B + '/>',
    // Hot-air balloon: big round envelope with stripes over a basket.
    balloon: '<path d="M20 2.5C29 2.5 33.5 8.5 33.5 15C33.5 22 25.5 25 24 28H16C14.5 25 6.5 22 6.5 15C6.5 8.5 11 2.5 20 2.5Z" ' + W + '/>' +
      '<path d="M20 2.5C14.5 8 14.5 20 17 28M20 2.5C25.5 8 25.5 20 23 28" ' + T + '/>' +
      '<path d="M16.5 28L17 32M23.5 28L23 32" ' + T + '/><rect x="15.5" y="32" width="9" height="5.5" ' + B + '/>',
    // Pram: round body, filled hood, handle and two wheels.
    pram: '<path d="M32 18L35.5 10H38.5" ' + S + '/>' +
      '<path d="M8 18H32C32 25 27 29 20 29C13 29 8 25 8 18Z" ' + W + '/>' +
      '<path d="M8 18C8 10 13.5 6 20 6V18Z" ' + B + '/>' +
      '<circle cx="13" cy="33.5" r="3.6" ' + W + '/><circle cx="27" cy="33.5" r="3.6" ' + W + '/>',
    // Cable car: cabin hanging from a sloping cable.
    cablecar: '<path d="M2 5L38 11M20 8V15" ' + S + '/><circle cx="20" cy="8" r="2.2" ' + B + '/>' +
      '<rect x="8.5" y="15" width="23" height="19" rx="3" ' + W + '/>' +
      '<rect x="11.5" y="18" width="7.5" height="7.5" ' + T + '/><rect x="21" y="18" width="7.5" height="7.5" ' + T + '/>',
    // Submarine: long rounded hull, tower with periscope, portholes, propeller.
    submarine: '<path d="M23.5 11V5H27.5" ' + S + '/><rect x="17" y="11" width="9" height="8" ' + W + '/>' +
      '<path d="M7 25C7 20.5 10 18.5 14 18.5H31C35 18.5 37.5 21 37.5 25C37.5 29 35 31.5 31 31.5H14C10 31.5 7 29.5 7 25Z" ' + W + '/>' +
      '<path d="M7 25L3 21V29Z" ' + B + '/>' +
      '<circle cx="15" cy="25" r="1.7" ' + B + '/><circle cx="22" cy="25" r="1.7" ' + B + '/><circle cx="29" cy="25" r="1.7" ' + B + '/>'
  };

  // Card order: index = card value in PairsCore (0..17).
  const NAMES = ["car", "bus", "truck", "tractor", "bicycle", "scooter", "train", "ship", "sailboat",
    "airplane", "helicopter", "rocket", "fireengine", "excavator", "balloon", "pram", "cablecar", "submarine"];
  // English names for screen readers; I18n translates them through the
  // msg_pairs_vehicle_* keys.
  const LABELS = {
    car: "Car", bus: "Bus", truck: "Truck", tractor: "Tractor", bicycle: "Bicycle", scooter: "Scooter", train: "Train",
    ship: "Ship", sailboat: "Sailboat", airplane: "Airplane", helicopter: "Helicopter", rocket: "Rocket",
    fireengine: "Fire engine", excavator: "Excavator", balloon: "Hot-air balloon", pram: "Pram", cablecar: "Cable car",
    submarine: "Submarine"
  };

  function svg(n, cls) {
    return '<svg class="' + (cls || "pairs-symbol") + '" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + (icons[NAMES[n]] || "") + "</svg>";
  }

  return { NAMES, LABELS, icons, svg };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PairsVehicles;
}
if (typeof window !== "undefined") {
  window.PairsVehicles = PairsVehicles;
}
