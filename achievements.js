// achievements.js
// A small set of badges derived entirely from the existing per-game
// records in game-stats.js (wins/bestStreak) - no separate storage of
// its own, so "unlocked" is just a predicate over data already there,
// computed fresh each time stats.html is opened.

const Achievements = (function () {
  const LIST = [
    { id: "first_win", icon: "\u{1F947}", nameKey: "achv_first_win_name", descKey: "achv_first_win_desc", check: (s) => s.totalWins >= 1 },
    { id: "ten_wins", icon: "\u{1F396}", nameKey: "achv_ten_wins_name", descKey: "achv_ten_wins_desc", check: (s) => s.totalWins >= 10 },
    { id: "fifty_wins", icon: "\u{1F3C5}", nameKey: "achv_fifty_wins_name", descKey: "achv_fifty_wins_desc", check: (s) => s.totalWins >= 50 },
    { id: "hundred_wins", icon: "\u{1F3C6}", nameKey: "achv_hundred_wins_name", descKey: "achv_hundred_wins_desc", check: (s) => s.totalWins >= 100 },
    { id: "streak_3", icon: "\u{1F525}", nameKey: "achv_streak_3_name", descKey: "achv_streak_3_desc", check: (s) => s.bestStreakOverall >= 3 },
    { id: "streak_5", icon: "\u{1F525}", nameKey: "achv_streak_5_name", descKey: "achv_streak_5_desc", check: (s) => s.bestStreakOverall >= 5 },
    { id: "streak_10", icon: "\u{1F525}", nameKey: "achv_streak_10_name", descKey: "achv_streak_10_desc", check: (s) => s.bestStreakOverall >= 10 },
    { id: "five_games", icon: "\u{1F3B2}", nameKey: "achv_five_games_name", descKey: "achv_five_games_desc", check: (s) => s.gamesWithWin >= 5 },
    { id: "fifteen_games", icon: "\u{1F5FA}", nameKey: "achv_fifteen_games_name", descKey: "achv_fifteen_games_desc", check: (s) => s.gamesWithWin >= 15 },
    { id: "all_games", icon: "\u{1F451}", nameKey: "achv_all_games_name", descKey: "achv_all_games_desc", check: (s) => s.totalTrackedGames > 0 && s.gamesWithWin >= s.totalTrackedGames }
  ];

  function computeSummary() {
    if (typeof GameStats === "undefined") {
      return { totalWins: 0, bestStreakOverall: 0, gamesWithWin: 0, totalTrackedGames: 0 };
    }
    const all = GameStats.getAll();
    let totalWins = 0;
    let bestStreakOverall = 0;
    let gamesWithWin = 0;
    GameStats.GAMES.forEach((g) => {
      const rec = all[g];
      totalWins += rec.wins;
      if (rec.bestStreak > bestStreakOverall) bestStreakOverall = rec.bestStreak;
      if (rec.wins > 0) gamesWithWin++;
    });
    return { totalWins, bestStreakOverall, gamesWithWin, totalTrackedGames: GameStats.GAMES.length };
  }

  function getStatus() {
    const summary = computeSummary();
    return LIST.map((a) => ({
      id: a.id,
      icon: a.icon,
      nameKey: a.nameKey,
      descKey: a.descKey,
      unlocked: a.check(summary)
    }));
  }

  return { getStatus };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Achievements;
}
