// lichess-api.js
// Dünne Wrapper um die wichtigsten Lichess-Endpunkte, die wir brauchen.

const LichessApi = (function () {
  function authHeaders() {
    const auth = (typeof window !== "undefined" && window.LichessAuth && typeof window.LichessAuth.getAccessToken === "function")
      ? window.LichessAuth
      : null;
    if (!auth) {
      throw new Error("Lichess login is not available on this device.");
    }
    const token = auth.getAccessToken();
    if (!token) {
      throw new Error("Not logged in to Lichess.");
    }
    return {
      "Authorization": "Bearer " + token
    };
  }

  async function getAccount() {
    const resp = await fetch("https://lichess.org/api/account", {
      headers: authHeaders()
    });
    if (!resp.ok) {
      throw new Error("Error at /api/account: " + resp.status);
    }
    return resp.json();
  }

  async function createSeek(options) {
    const { timeMinutes, incrementSeconds, rated } = options;
    const params = new URLSearchParams();
    params.append("rated", rated ? "true" : "false");
    params.append("time", String(timeMinutes));
    params.append("increment", String(incrementSeconds));
    params.append("variant", "standard");
    params.append("color", "random");
    // ratingRange könnte man noch optional setzen

    const resp = await fetch("https://lichess.org/api/board/seek", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error("Error at /api/board/seek: " + resp.status + " " + text);
    }

    // Die Antwort ist ein Textstream. Für uns reicht: hat funktioniert.
    return true;
  }

  async function challengeAi(options) {
    const { level, color, timeMinutes, incrementSeconds } = options;
    const params = new URLSearchParams();
    params.append("level", String(level));
    params.append("color", color || "random");
    params.append("clock.limit", String(timeMinutes * 60));
    params.append("clock.increment", String(incrementSeconds));

    const resp = await fetch("https://lichess.org/api/challenge/ai", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error("Error at /api/challenge/ai: " + resp.status + " " + text);
    }

    return resp.json();
  }

  async function getCurrentPlaying() {
    const resp = await fetch("https://lichess.org/api/account/playing?nb=5", {
      headers: {
        ...authHeaders(),
        "Accept": "application/json"
      }
    });
    if (!resp.ok) {
      throw new Error("Error at /api/account/playing: " + resp.status);
    }
    const data = await resp.json();
    if (!data.nowPlaying || data.nowPlaying.length === 0) return null;
    // Wir nehmen einfach das erste laufende Spiel
    return data.nowPlaying[0];
  }

  async function makeMove(gameId, uci) {
    const url = "https://lichess.org/api/board/game/" + encodeURIComponent(gameId) +
      "/move/" + encodeURIComponent(uci);
    const resp = await fetch(url, {
      method: "POST",
      headers: authHeaders()
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error("Move failed: " + resp.status + " " + txt);
    }
    return true;
  }


  async function resignGame(gameId) {
    if (!gameId) {
      throw new Error("Missing gameId");
    }
    const url = "https://lichess.org/api/board/game/" + encodeURIComponent(gameId) + "/resign";
    const resp = await fetch(url, {
      method: "POST",
      headers: authHeaders()
    });
    if (!resp.ok) {
      let text = "";
      try {
        text = await resp.text();
      } catch (e) {}
      throw new Error("Resign failed: " + (text || resp.status));
    }
    return true;
  }

  // accept = true -> "yes" (offer/accept), false -> "no" (decline)
  async function handleDraw(gameId, accept = true) {
    if (!gameId) {
      throw new Error("Missing gameId");
    }
    const acceptStr = accept ? "yes" : "no";
    const url = "https://lichess.org/api/board/game/" + encodeURIComponent(gameId) + "/draw/" + acceptStr;
    const resp = await fetch(url, {
      method: "POST",
      headers: authHeaders()
    });
    if (!resp.ok) {
      let text = "";
      try {
        text = await resp.text();
      } catch (e) {}
      throw new Error("Draw offer failed: " + (text || resp.status));
    }
    return true;
  }
  return {
    getAccount,
    createSeek,
    challengeAi,
    getCurrentPlaying,
    makeMove,
    resignGame,
    handleDraw
  };
})();
