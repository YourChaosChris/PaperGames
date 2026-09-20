// lichess-api.js
// Dünne Wrapper um die wichtigsten Lichess-Endpunkte, die wir brauchen.

const LichessApi = (function () {
  // The seek stream (POST /api/board/seek) stays open until a game starts
  // or the seek is cancelled - it must be read continuously to keep the
  // connection (and therefore the seek) alive, otherwise the browser can
  // drop it once the Response object is no longer referenced, silently
  // cancelling the search for an opponent.
  let activeSeekReader = null;

  function cancelSeek() {
    if (activeSeekReader) {
      try { activeSeekReader.cancel(); } catch (e) {}
      activeSeekReader = null;
    }
  }

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

    // Keep the streaming response alive in the background until it closes
    // on its own (game found or seek cancelled/expired) or cancelSeek() is
    // called once we've attached to the matched game via polling. This is
    // best-effort: some browsers (e.g. older e-ink devices) don't expose a
    // readable response body, so failing to set this up must never break
    // the seek itself, which has already succeeded at this point.
    try {
      cancelSeek();
      if (resp.body && typeof resp.body.getReader === "function") {
        const reader = resp.body.getReader();
        activeSeekReader = reader;
        (async () => {
          try {
            while (true) {
              const { done } = await reader.read();
              if (done) break;
            }
          } catch (e) {
            // Expected once cancelSeek() cancels the reader.
          } finally {
            if (activeSeekReader === reader) activeSeekReader = null;
          }
        })();
      }
    } catch (e) {
      // Streaming isn't supported here - proceed without keeping it warm.
    }

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

  async function getNowPlayingList() {
    const resp = await fetch("https://lichess.org/api/account/playing?nb=10", {
      headers: {
        ...authHeaders(),
        "Accept": "application/json"
      }
    });
    if (!resp.ok) {
      throw new Error("Error at /api/account/playing: " + resp.status);
    }
    const data = await resp.json();
    return data.nowPlaying || [];
  }

  async function getCurrentPlaying() {
    const list = await getNowPlayingList();
    if (list.length === 0) return null;
    // Wir nehmen einfach das erste laufende Spiel
    return list[0];
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
    cancelSeek,
    challengeAi,
    getCurrentPlaying,
    getNowPlayingList,
    makeMove,
    resignGame,
    handleDraw
  };
})();
