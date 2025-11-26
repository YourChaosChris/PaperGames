// lichess-auth.js
// OAuth2 PKCE Login mit Lichess, komplett clientseitig, ohne WebCrypto-Abhängigkeit.
// Nutzt einen einfachen SHA-256 in JavaScript, damit es auch auf älteren Browsern (z.B. Tolino) läuft.

var LichessAuth;

(function () {
  // Fallback, falls window.location.origin nicht existiert (ältere WebKit-Versionen)
  var origin = window.location.origin;
  if (!origin) {
    origin = window.location.protocol + "//" + window.location.host;
  }

  const LICHESS_CLIENT_ID = "eInkChess-demo"; // frei wählbar
  const LICHESS_REDIRECT_URI = origin + window.location.pathname;
  const LICHESS_OAUTH_AUTHORIZE = "https://lichess.org/oauth";
  const LICHESS_OAUTH_TOKEN = "https://lichess.org/api/token";
  const LICHESS_SCOPE = "board:play";

  const KEY_TOKEN = "eInkChess_access_token";
  const KEY_TOKEN_EXP = "eInkChess_access_token_expires_at";
  const KEY_VERIFIER = "eInkChess_pkce_verifier";
  const KEY_STATE = "eInkChess_oauth_state";

  function safeGetItem(key) {
    try {
      if (window.localStorage) {
        const v = localStorage.getItem(key);
        if (v !== null) return v;
      }
    } catch (e) {
    }
    try {
      if (window.sessionStorage) {
        return sessionStorage.getItem(key);
      }
    } catch (e) {
    }
    return null;
  }

  function safeSetItem(key, value) {
    try {
      if (window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
    }
    try {
      if (window.sessionStorage) {
        sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
    }
  }

  function safeRemoveItem(key) {
    try {
      if (window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
    }
    try {
      if (window.sessionStorage) {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
    }
  }


  function getAccessToken() {
    try {
      const token = safeGetItem(KEY_TOKEN);
      if (!token) return null;
      const expRaw = safeGetItem(KEY_TOKEN_EXP);
      if (expRaw) {
        const exp = parseInt(expRaw, 10);
        if (!isNaN(exp) && Date.now() > exp) {
          safeRemoveItem(KEY_TOKEN);
          safeRemoveItem(KEY_TOKEN_EXP);
          return null;
        }
      }
      return token;
    } catch (e) {
      return null;
    }
  }

  function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    // Wenn vorhanden, nutze kryptographisch starken Zufall, sonst Math.random
    if (window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(length);
      window.crypto.getRandomValues(bytes);
      for (let i = 0; i < length; i++) {
        result += charset[bytes[i] % charset.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        const r = Math.floor(Math.random() * charset.length);
        result += charset.charAt(r);
      }
    }
    return result;
  }

  // Einfacher SHA-256 für ASCII-Strings (ausreichend für PKCE code_verifier)
  function sha256Bytes(str) {
    // String -> Bytes (ASCII)
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      // code_verifier nutzt ohnehin nur ASCII-Zeichen
      bytes.push(c & 0xff);
    }

    // Hilfsfunktionen
    function rotr(x, n) {
      return (x >>> n) | (x << (32 - n));
    }

    // Konstanten (K) und Initialwerte (H) für SHA-256
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    // Preprocessing (Padding)
    const bitLen = bytes.length * 8;
    // append '1' bit (0x80)
    bytes.push(0x80);
    // append '0' bits until length ≡ 448 mod 512 (i.e. bytes.length ≡ 56 mod 64)
    while ((bytes.length % 64) !== 56) {
      bytes.push(0x00);
    }
    // append original length (64-bit big endian)
    for (let i = 7; i >= 0; i--) {
      bytes.push((bitLen >>> (i * 8)) & 0xff);
    }

    // Verarbeiten in 512-bit Blöcken
    const w = new Array(64);
    for (let i = 0; i < bytes.length; i += 64) {
      // 16 Worte à 32 Bit
      for (let j = 0; j < 16; j++) {
        const idx = i + j * 4;
        w[j] = ((bytes[idx] << 24) | (bytes[idx + 1] << 16) | (bytes[idx + 2] << 8) | (bytes[idx + 3])) >>> 0;
      }
      // erweitern auf 64 Worte
      for (let j = 16; j < 64; j++) {
        const s0 = (rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3)) >>> 0;
        const s1 = (rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10)) >>> 0;
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
      }

      // Arbeitsvariablen
      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;

      for (let j = 0; j < 64; j++) {
        const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
        const ch = ((e & f) ^ (~e & g)) >>> 0;
        const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
        const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
        const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        const temp2 = (S0 + maj) >>> 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
      h5 = (h5 + f) >>> 0;
      h6 = (h6 + g) >>> 0;
      h7 = (h7 + h) >>> 0;
    }

    const hash = [];
    const hs = [h0, h1, h2, h3, h4, h5, h6, h7];
    for (let i = 0; i < hs.length; i++) {
      hash.push((hs[i] >>> 24) & 0xff);
      hash.push((hs[i] >>> 16) & 0xff);
      hash.push((hs[i] >>> 8) & 0xff);
      hash.push(hs[i] & 0xff);
    }
    return hash;
  }

  function base64UrlEncode(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    // btoa erwartet Latin-1; unsere Bytes sind im Bereich 0..255
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function pkceChallengeFromVerifier(codeVerifier) {
    const hashBytes = sha256Bytes(codeVerifier);
    return base64UrlEncode(hashBytes);
  }

  async function login() {
    const codeVerifier = generateRandomString(64);
    const state = generateRandomString(32);
    try {
      safeSetItem(KEY_VERIFIER, codeVerifier);
      safeSetItem(KEY_STATE, state);
    } catch (e) {
    }

    const codeChallenge = pkceChallengeFromVerifier(codeVerifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: LICHESS_CLIENT_ID,
      redirect_uri: LICHESS_REDIRECT_URI,
      scope: LICHESS_SCOPE,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      state: state
    });

    const url = LICHESS_OAUTH_AUTHORIZE + "?" + params.toString();
    window.location.href = url;
  }


  function getQueryParam(name) {
    var search = window.location.search || "";
    if (!search) return null;
    if (search.charAt(0) === "?") {
      search = search.substring(1);
    }
    var parts = search.split("&");
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split("=");
      if (kv.length > 0 && decodeURIComponent(kv[0]) === name) {
        return kv.length > 1 ? decodeURIComponent(kv[1].replace(/\+/g, " ")) : "";
      }
    }
    return null;
  }

  async function maybeFinishLoginFromRedirect() {
    var code = null;
    var state = null;
    var urlObj = null;

    try {
      if (window.URL) {
        urlObj = new URL(window.location.href);
        if (urlObj && urlObj.searchParams) {
          code = urlObj.searchParams.get("code");
          state = urlObj.searchParams.get("state");
        }
      }
    } catch (e) {
      // older browser: ignore and fall back to manual parsing
      urlObj = null;
    }

    if (!code) {
      code = getQueryParam("code");
    }
    if (!state) {
      state = getQueryParam("state");
    }

    if (!code) return false;

    let verifier = null;
    let storedState = null;
    try {
      storedState = safeGetItem(KEY_STATE);
      verifier = safeGetItem(KEY_VERIFIER);
    } catch (e) {
    }

    if (!storedState || !verifier || state !== storedState) {
      return false;
    }

    try {
      safeRemoveItem(KEY_STATE);
      safeRemoveItem(KEY_VERIFIER);
    } catch (e) {
      // ignorieren
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: LICHESS_REDIRECT_URI,
      client_id: LICHESS_CLIENT_ID,
      code_verifier: verifier
    });

    // fetch mit Fallback auf XMLHttpRequest für sehr alte Browser
    function doPost(url, bodyParams) {
      if (window.fetch) {
        return fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: bodyParams
        });
      } else {
        return new Promise(function (resolve, reject) {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url, true);
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                  ok: true,
                  status: xhr.status,
                  json: function () {
                    return Promise.resolve(JSON.parse(xhr.responseText));
                  }
                });
              } else {
                resolve({ ok: false, status: xhr.status });
              }
            }
          };
          xhr.onerror = function (e) {
            reject(e);
          };
          xhr.send(bodyParams.toString());
        });
      }
    }

    const resp = await doPost(LICHESS_OAUTH_TOKEN, body);
    if (!resp || !resp.ok) {
      return false;
    }

    const data = await resp.json();
    const token = data.access_token;
    const expiresIn = data.expires_in || (365 * 24 * 60 * 60);
    const expAt = Date.now() + expiresIn * 1000 - 60 * 1000; // 1 Minute Puffer

    try {
      safeSetItem(KEY_TOKEN, token);
      safeSetItem(KEY_TOKEN_EXP, String(expAt));
    } catch (e) {
    }

    // URL aufräumen (code/state aus der Adressleiste entfernen)
    try {
      if (urlObj && urlObj.searchParams) {
        urlObj.searchParams.delete("code");
        urlObj.searchParams.delete("state");
        window.history.replaceState({}, "", urlObj.toString());
      }
    } catch (e) {
      // nicht kritisch
    }

    return true;
  }

  }

  function logout() {
    try {
      safeRemoveItem(KEY_TOKEN);
      safeRemoveItem(KEY_TOKEN_EXP);
    } catch (e) {
      // egal
    }
  }

  LichessAuth = window.LichessAuth = {
    getAccessToken: getAccessToken,
    login: login,
    maybeFinishLoginFromRedirect: maybeFinishLoginFromRedirect,
    logout: logout
  };
})();
