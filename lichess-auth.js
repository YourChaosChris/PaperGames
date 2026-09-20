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

  // Set whenever maybeFinishLoginFromRedirect() can't complete the login,
  // so the UI can show *why* instead of just "not connected" - the login
  // flow has several silent-failure points (state lost, code rejected,
  // network error) that were previously indistinguishable to the user.
  let lastError = null;

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

  function base64UrlEncode(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    // btoa erwartet Latin-1; unsere Bytes sind im Bereich 0..255
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  // SHA-256 via the browser's native Web Crypto API. This needs a secure
  // context (https, which GitHub Pages provides), which every browser that
  // already supports fetch()/Promises/Service Workers - all required
  // elsewhere in this app - also supports, so there is no old-browser
  // fallback here: a previous hand-rolled SHA-256 turned out to have a
  // subtle bug (JS shift operators take their amount modulo 32, so a
  // `>>> 32` in the length-padding step was a silent no-op instead of the
  // intended 0), which produced a wrong PKCE code_challenge for almost any
  // real input and made every login fail with "hash of code_verifier does
  // not match code_challenge" - correct by construction beats re-debugging
  // custom crypto.
  async function pkceChallengeFromVerifier(codeVerifier) {
    if (!window.crypto || !window.crypto.subtle || !window.crypto.subtle.digest) {
      throw new Error("This browser doesn't support the Web Crypto API needed for a secure login.");
    }
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(new Uint8Array(digest));
  }

  async function login() {
    const codeVerifier = generateRandomString(64);
    const state = generateRandomString(32);
    try {
      safeSetItem(KEY_VERIFIER, codeVerifier);
      safeSetItem(KEY_STATE, state);
    } catch (e) {
    }

    const codeChallenge = await pkceChallengeFromVerifier(codeVerifier);

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
    lastError = null;
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

    // Lichess redirects back with ?error=... instead of ?code=... when the
    // user declines, or the request itself was rejected outright.
    const oauthError = getQueryParam("error");
    if (!code && oauthError) {
      lastError = "Lichess declined the login: " + oauthError +
        (getQueryParam("error_description") ? " (" + getQueryParam("error_description") + ")" : "");
      return false;
    }

    if (!code) {
      // No code and no explicit ?error= either: if a login was actually
      // started (a PKCE verifier is sitting in storage waiting for this
      // redirect), the flow never made it back with anything usable -
      // otherwise this stays a silent "not connected" forever, which is
      // exactly what was reported (no error shown at all, on two
      // different devices/browsers). Surface it once, then clear the
      // pending state so an unrelated later visit doesn't repeat it.
      let pendingVerifier = null;
      try {
        pendingVerifier = safeGetItem(KEY_VERIFIER);
      } catch (e) {
      }
      if (pendingVerifier) {
        try {
          safeRemoveItem(KEY_VERIFIER);
          safeRemoveItem(KEY_STATE);
        } catch (e) {
        }
        lastError = "A login was started but Lichess never redirected back with an authorization code " +
          "(landed on " + window.location.href + " instead). This can happen if the authorize step opened " +
          "in a separate window/tab, or the connection was interrupted before it could redirect back. " +
          "Please try Connect again.";
      }
      return false;
    }

    try {
      let verifier = null;
      let storedState = null;
      try {
        storedState = safeGetItem(KEY_STATE);
        verifier = safeGetItem(KEY_VERIFIER);
      } catch (e) {
      }

      if (!storedState || !verifier) {
        lastError = "Login couldn't be completed: no matching login session was found on this page. " +
          "This usually means the authorize step opened in a separate browser window/tab that doesn't " +
          "share storage with this one - try Connect again and keep it in the same tab.";
        return false;
      }
      if (state !== storedState) {
        lastError = "Login couldn't be completed: the security check (state) didn't match. Please try Connect again.";
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
                  resolve({
                    ok: false,
                    status: xhr.status,
                    json: function () {
                      try {
                        return Promise.resolve(JSON.parse(xhr.responseText));
                      } catch (e) {
                        return Promise.resolve(null);
                      }
                    }
                  });
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
        let detail = "";
        try {
          const errBody = resp && resp.json ? await resp.json() : null;
          detail = errBody && (errBody.error_description || errBody.error) || "";
        } catch (e) {
        }
        lastError = "Login failed exchanging the code for a token" +
          (resp ? " (HTTP " + resp.status + ")" : "") + (detail ? ": " + detail : ".");
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
    } catch (e) {
      lastError = "Login failed: " + (e && e.message ? e.message : "unknown error.");
      return false;
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
    logout: logout,
    getLastError: function () {
      return lastError;
    }
  };
})();
