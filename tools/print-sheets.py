#!/usr/bin/env python3
# tools/print-sheets.py
# Builds the HTML sources for the printable PDFs (worksheets for schools,
# one-page guide to print) into a temporary folder. tools/print-sheets.js
# then turns them into PDFs in downloads/.
#
#   python3 tools/print-sheets.py <out-dir>
#
# Needs the Python package segno (QR codes, BSD licence):
#   pip3 install --user segno
# The QR codes are drawn as inline SVG; nothing of segno ends up on the site.

import os, sys
import segno

BASE = "https://yourchaoschris.github.io/PaperGames/"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pg-print"
os.makedirs(OUT, exist_ok=True)

CSS = """
@page { size: A4; margin: 12mm 14mm 11mm 14mm; }
* { box-sizing: border-box; }
body { font-family: Georgia, "Times New Roman", serif; font-variant-numeric: lining-nums; color: #000; background: #fff; font-size: 11.5pt; line-height: 1.4; margin: 0; }
h1 { font-size: 20pt; margin: 0 0 4mm; }
h2 { font-size: 14pt; margin: 6mm 0 2mm; }
p { margin: 0 0 3mm; }
ol, ul { margin: 0 0 3mm; padding-left: 7mm; }
li { margin-bottom: 2mm; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8mm; border-bottom: 1.5pt solid #000; padding-bottom: 3mm; margin-bottom: 4mm; }
.brand { font-size: 10pt; letter-spacing: 0.5pt; text-transform: uppercase; }
.qr { text-align: center; font-size: 9pt; width: 34mm; }
.qr svg { width: 26mm; height: 26mm; display: block; margin: 0 auto 1mm; }
.task { border: 1pt solid #000; padding: 2mm 4mm; margin-bottom: 3mm; break-inside: avoid; }
.lines { border-bottom: 0.6pt solid #000; height: 7mm; }
.page { break-after: page; }
.page:last-child { break-after: auto; }
.foot { font-size: 9pt; margin-top: 4mm; border-top: 0.6pt solid #000; padding-top: 2mm; }
table.grid { border-collapse: collapse; margin: 2mm 0 3mm; }
table.grid td { width: 9mm; height: 9mm; border: 0.8pt solid #000; text-align: center; font-size: 15pt; }
table.grid tr:nth-child(2) td, table.grid tr:nth-child(4) td { }
table.g4 tr:nth-child(2) td { border-bottom: 2.4pt solid #000; }
table.g4 td:nth-child(2) { border-right: 2.4pt solid #000; }
table.cols td, table.cols th { border: 0.8pt solid #000; padding: 1.5mm 4mm; text-align: center; }
table.cols { border-collapse: collapse; margin: 2mm 0 3mm; }
.heaps span { display: inline-block; margin-right: 8mm; font-size: 15pt; letter-spacing: 1.5pt; }
.big { font-size: 16pt; }
.steps li { margin-bottom: 4mm; }
"""

def qr_svg(url):
    q = segno.make(url, error="m")
    import io
    buf = io.BytesIO()
    q.save(buf, kind="svg", scale=4, border=2, dark="#000", light="#fff", xmldecl=False, svgns=True, nl=False)
    s = buf.getvalue().decode("utf-8")
    return s

def page_html(lang, title, body):
    return ("<!DOCTYPE html><html lang=\"%s\"><head><meta charset=\"utf-8\"><title>%s</title><style>%s</style></head><body>%s</body></html>"
            % (lang, title, CSS, body))

def head(lang, title, sub, url, qr_label):
    return ("<div class=\"head\"><div><div class=\"brand\">PaperGames</div><h1>%s</h1><p>%s</p></div>"
            "<div class=\"qr\">%s%s</div></div>" % (title, sub, qr_svg(url), qr_label))

def heap(n):
    return "<span>" + " ".join(["&#9679;"] * n) + "</span>"

def grid4(rows):
    out = "<table class=\"grid g4\">"
    for r in rows:
        out += "<tr>" + "".join("<td>%s</td>" % (c if c != "." else "") for c in r) + "</tr>"
    return out + "</table>"

def board_svg():
    # 8x8 checkers board, a1 bottom left is dark. White man c3, black men d4, f6.
    sq = 9
    s = ["<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"58mm\" height=\"58mm\" viewBox=\"0 0 %d %d\">" % (sq * 8 + 8, sq * 8 + 8)]
    # Dark squares are hatched, not grey: the site is strictly black and white.
    s.append("<defs><pattern id=\"h\" width=\"2\" height=\"2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"2\" stroke=\"#000\" stroke-width=\"0.6\"/></pattern></defs>")
    for r in range(8):          # r = 0 is rank 8 at the top
        for f in range(8):
            rank = 8 - r
            dark = (f + 1 + rank) % 2 == 0
            s.append("<rect x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" fill=\"%s\" stroke=\"#000\" stroke-width=\"0.3\"/>"
                     % (8 + f * sq, r * sq, sq, sq, "url(#h)" if dark else "#fff"))
    def piece(file, rank, white):
        cx = 8 + file * sq + sq / 2
        cy = (8 - rank) * sq + sq / 2
        s.append("<circle cx=\"%.1f\" cy=\"%.1f\" r=\"3.4\" fill=\"%s\" stroke=\"#000\" stroke-width=\"0.8\"/>" % (cx, cy, "#fff" if white else "#000"))
    piece(2, 3, True)   # c3
    piece(3, 4, False)  # d4
    piece(5, 6, False)  # f6
    for i, ch in enumerate("abcdefgh"):
        s.append("<text x=\"%.1f\" y=\"%d\" font-size=\"4\" text-anchor=\"middle\">%s</text>" % (8 + i * sq + sq / 2, sq * 8 + 6, ch))
    for r in range(8):
        s.append("<text x=\"3\" y=\"%.1f\" font-size=\"4\" text-anchor=\"middle\">%d</text>" % (r * sq + sq / 2 + 1.5, 8 - r))
    s.append("</svg>")
    return "".join(s)

T = {
 "de": {
   "teacher": "Lösungen für Lehrkräfte", "free": "Kostenlos aus PaperGames. Darf für den Unterricht frei kopiert werden.",
   "scan": "Spiel öffnen", "name": "Name:", "goal": "Ziel",
   "nim_t": "Nim: Wer nimmt den letzten Stein?", "nim_s": "Strategie finden",
   "nim_goal": "Du lernst, vorauszudenken und eine sichere Gewinnstrategie zu finden.",
   "nim_rules": "<b>Regeln:</b> Es liegen Haufen mit Steinen. Wer am Zug ist, nimmt von <b>einem</b> Haufen beliebig viele Steine, mindestens einen. Wer den letzten Stein nimmt, gewinnt.",
   "nim_1": "Ein Haufen mit 5 Steinen. Du bist am Zug. Wie viele Steine nimmst du, um sofort zu gewinnen?",
   "nim_2": "Zwei Haufen mit je 2 Steinen. Du bist am Zug. Kannst du sicher gewinnen, wenn der andere keinen Fehler macht? Begründe.",
   "nim_3": "Zwei Haufen mit 4 und 2 Steinen. Du bist am Zug. Welcher Zug sichert dir den Sieg?",
   "nim_4": "Drei Haufen mit 3, 4 und 5 Steinen (so beginnt Nim in PaperGames). Finde den einen Zug, der dir den Sieg sichert. Tipp: Probiere, den Gegner in eine Lage zu bringen, in der jeder seiner Züge dir hilft.",
   "nim_sol": ["Alle 5 Steine nehmen.",
               "Nein. Was du nimmst, kann der andere auf dem anderen Haufen genauso nehmen (Spiegeln). Er nimmt dann den letzten Stein.",
               "Nimm 2 Steine vom Haufen mit 4. Dann liegen 2 und 2, und du spiegelst ab jetzt jeden Zug.",
               "Nimm 2 Steine vom Haufen mit 3. Es bleiben 1, 4 und 5. Erklärung für Ältere: Schreibe die Haufen als Zweierzahlen (1 = 001, 4 = 100, 5 = 101). In jeder Stelle steht dann eine gerade Anzahl Einsen. Aus so einer Lage verliert der Spieler am Zug, wenn der andere richtig spielt (Bouton, 1901)."],
   "han_t": "Türme von Hanoi", "han_s": "Muster und Zählen",
   "han_goal": "Du findest ein Zahlenmuster und lernst, eine große Aufgabe in kleine zu zerlegen.",
   "han_rules": "<b>Regeln:</b> Alle Scheiben liegen auf dem linken Stab A, die größte unten. Bringe den ganzen Turm auf den rechten Stab C. Du bewegst immer nur eine Scheibe, und nie liegt eine größere auf einer kleineren.",
   "han_1": "Wie viele Züge brauchst du mindestens für 1, 2 und 3 Scheiben? Probiere mit Münzen oder Papierstücken.",
   "han_2": "Fülle die Tabelle aus. Welches Muster siehst du?",
   "han_3": "Wie viele Züge braucht man mindestens für 8 Scheiben?",
   "han_4": "Schreibe alle 7 Züge für 3 Scheiben von A nach C auf (zum Beispiel: kleine Scheibe von A nach C).",
   "han_tab_d": "Scheiben", "han_tab_m": "Züge",
   "han_sol": ["1 Scheibe: 1 Zug, 2 Scheiben: 3 Züge, 3 Scheiben: 7 Züge.",
               "1, 3, 7, 15, 31. Jede Zahl ist das Doppelte der vorigen plus 1. Als Formel: 2<sup>n</sup> − 1.",
               "255 Züge.",
               "1. klein A→C, 2. mittel A→B, 3. klein C→B, 4. groß A→C, 5. klein B→A, 6. mittel B→C, 7. klein A→C."],
   "sud_t": "Sudoku", "sud_s": "Logisch schließen",
   "sud_goal": "Du lernst, Schritt für Schritt aus sicheren Hinweisen zu folgern, ohne zu raten.",
   "sud_rules": "<b>Regeln:</b> In jeder Zeile, jeder Spalte und jedem Kasten steht jede Zahl genau einmal. Beim kleinen Sudoku sind es die Zahlen 1 bis 4 und Kästen mit 2 × 2 Feldern.",
   "sud_1": "Löse das kleine Sudoku.",
   "sud_2": "Löse noch ein kleines Sudoku.",
   "sud_3": "In einer Zeile eines großen Sudokus (Zahlen 1 bis 9) stehen: 5 3 _ 6 7 8 9 1 2. Welche Zahl fehlt?",
   "sud_4": "Erkläre einem Mitschüler in zwei Sätzen, wie du in Aufgabe 1 die erste Zahl gefunden hast.",
   "sud_sol_3": "Es fehlt die 4.", "sud_sol_4": "Freie Antwort. Gut ist zum Beispiel: In dieser Zeile fehlen nur noch zwei Zahlen, und eine davon steht schon in der Spalte.",
   "che_t": "Dame: erste Regeln", "che_s": "Regeln lesen und anwenden",
   "che_goal": "Du lernst die Grundregeln der Dame und rechnest einen Mehrfachsprung voraus.",
   "che_rules": "<b>Regeln:</b> Gespielt wird auf den dunklen Feldern eines Bretts mit 8 × 8 Feldern. Steine ziehen schräg nach vorn auf ein freies Feld. Steht ein gegnerischer Stein schräg davor und dahinter ist frei, wird er übersprungen und geschlagen. Schlagen ist Pflicht, auch mehrmals hintereinander. Wer die letzte Reihe erreicht, bekommt eine Dame.",
   "che_1": "Wie viele Steine hat jeder Spieler am Anfang? Auf wie vielen Feldern dürfen Steine stehen?",
   "che_2": "Weiß ist am Zug (Weiß zieht nach oben). Welche Steine schlägt der weiße Stein auf c3, und auf welchem Feld landet er?",
   "che_3": "Was passiert, wenn ein Stein die letzte Reihe auf der anderen Seite erreicht?",
   "che_4": "Darf Weiß in Aufgabe 2 stattdessen einen anderen Zug machen? Begründe.",
   "che_note": "In PaperGames kannst du zwischen englischen, deutschen, russischen, brasilianischen und italienischen Regeln wählen. Die Aufgaben gelten für alle.",
   "che_sol": ["Jeder hat 12 Steine. Steine stehen nur auf den 32 dunklen Feldern.",
               "Er schlägt d4 und landet auf e5, dann schlägt er f6 und landet auf g7. Zwei Steine sind geschlagen.",
               "Der Stein wird zur Dame (umgedreht oder mit einem zweiten Stein gekrönt).",
               "Nein. Schlagen ist Pflicht, und ein begonnener Mehrfachsprung wird zu Ende gezogen."],
   "guide_t": "So kommt PaperGames auf deinen E-Reader", "guide_s": "Kostenlose Brett-, Karten- und Rätselspiele. Ohne Konto, ohne Werbung, offline.",
   "guide_steps": ["Schalte am E-Reader das WLAN ein.",
                   "Öffne den Browser. Er heißt je nach Gerät „Browser“, „Webbrowser“ oder „Chrome“ und liegt meist im Menü oder unter „Apps“ oder „Mehr“.",
                   "Tippe oben in die Adresszeile und gib diese Adresse ein:<br><b class=\"big\">yourchaoschris.github.io/PaperGames</b>",
                   "Setze ein Lesezeichen, damit du die Seite wiederfindest. Wenn der Browser „Zum Startbildschirm hinzufügen“ anbietet, geht auch das.",
                   "Warte, bis auf der Startseite „Offline bereit“ steht. Das kann ein bis zwei Minuten dauern. Danach läuft PaperGames auch ohne WLAN.",
                   "Wähle ein Spiel. In jedem Spiel stehen die Regeln, und unten findest du „Idee oder Fehler melden“."],
   "guide_dev": "<b>Getestet auf:</b> tolino, Kobo, PocketBook, Boox und anderen Readern mit Browser, auch auf Handy, Tablet und Computer. Auf dem Kindle hängt es vom Browser ab. Geräte ohne Browser (zum Beispiel reMarkable) können die Seite nicht öffnen.",
   "guide_help": "<b>Zeigt die Seite einen alten Stand?</b> In der Anleitung auf der Seite gibt es den Knopf „Jetzt aktualisieren erzwingen“.",
   "guide_qr": "Mit dem Handy scannen",
 },
 "en": {
   "teacher": "Solutions for teachers", "free": "Free from PaperGames. You may copy it freely for lessons.",
   "scan": "Open the game", "name": "Name:", "goal": "Goal",
   "nim_t": "Nim: who takes the last stone?", "nim_s": "Finding a strategy",
   "nim_goal": "You learn to think ahead and find a safe winning strategy.",
   "nim_rules": "<b>Rules:</b> There are heaps of stones. On your turn you take as many stones as you like from <b>one</b> heap, at least one. Whoever takes the last stone wins.",
   "nim_1": "One heap with 5 stones. It is your turn. How many stones do you take to win at once?",
   "nim_2": "Two heaps with 2 stones each. It is your turn. Can you be sure to win if the other player makes no mistake? Explain.",
   "nim_3": "Two heaps with 4 and 2 stones. It is your turn. Which move makes sure you win?",
   "nim_4": "Three heaps with 3, 4 and 5 stones (this is how Nim starts in PaperGames). Find the one move that makes sure you win. Hint: try to leave a position where every move of the other player helps you.",
   "nim_sol": ["Take all 5 stones.",
               "No. Whatever you take, the other player can take the same from the other heap (mirroring). Then they take the last stone.",
               "Take 2 stones from the heap of 4. Now there are 2 and 2, and from now on you mirror every move.",
               "Take 2 stones from the heap of 3. That leaves 1, 4 and 5. For older students: write the heaps in binary (1 = 001, 4 = 100, 5 = 101). Every column then has an even number of ones. From such a position the player to move loses against correct play (Bouton, 1901)."],
   "han_t": "Towers of Hanoi", "han_s": "Patterns and counting",
   "han_goal": "You find a number pattern and learn to split a big task into small ones.",
   "han_rules": "<b>Rules:</b> All discs are on the left rod A, the biggest at the bottom. Move the whole tower to the right rod C. You move one disc at a time, and a bigger disc never lies on a smaller one.",
   "han_1": "How many moves do you need at least for 1, 2 and 3 discs? Try it with coins or pieces of paper.",
   "han_2": "Fill in the table. What pattern do you see?",
   "han_3": "How many moves do you need at least for 8 discs?",
   "han_4": "Write down all 7 moves for 3 discs from A to C (for example: small disc from A to C).",
   "han_tab_d": "Discs", "han_tab_m": "Moves",
   "han_sol": ["1 disc: 1 move, 2 discs: 3 moves, 3 discs: 7 moves.",
               "1, 3, 7, 15, 31. Each number is double the one before plus 1. As a formula: 2<sup>n</sup> − 1.",
               "255 moves.",
               "1. small A→C, 2. middle A→B, 3. small C→B, 4. big A→C, 5. small B→A, 6. middle B→C, 7. small A→C."],
   "sud_t": "Sudoku", "sud_s": "Logical reasoning",
   "sud_goal": "You learn to reason step by step from safe clues, without guessing.",
   "sud_rules": "<b>Rules:</b> Every row, every column and every box contains each number exactly once. The small sudoku uses the numbers 1 to 4 and boxes of 2 × 2 squares.",
   "sud_1": "Solve the small sudoku.",
   "sud_2": "Solve another small sudoku.",
   "sud_3": "A row of a big sudoku (numbers 1 to 9) reads: 5 3 _ 6 7 8 9 1 2. Which number is missing?",
   "sud_4": "Explain to a classmate in two sentences how you found the first number in task 1.",
   "sud_sol_3": "The 4 is missing.", "sud_sol_4": "Open answer. A good one is for example: only two numbers are missing in this row, and one of them is already in that column.",
   "che_t": "Checkers: first rules", "che_s": "Reading and applying rules",
   "che_goal": "You learn the basic rules of checkers and think a multiple jump through.",
   "che_rules": "<b>Rules:</b> The game is played on the dark squares of an 8 × 8 board. Pieces move diagonally forward to an empty square. If an opposing piece stands diagonally in front and the square behind it is empty, you jump over it and capture it. Capturing is compulsory, also several times in a row. A piece that reaches the last row becomes a king.",
   "che_1": "How many pieces does each player have at the start? On how many squares can pieces stand?",
   "che_2": "White to move (White moves up). Which pieces does the white piece on c3 capture, and on which square does it land?",
   "che_3": "What happens when a piece reaches the last row on the other side?",
   "che_4": "In task 2, may White make a different move instead? Explain.",
   "che_note": "In PaperGames you can choose English, German, Russian, Brazilian or Italian rules. These tasks work with all of them.",
   "che_sol": ["Each player has 12 pieces. Pieces stand only on the 32 dark squares.",
               "It captures d4 and lands on e5, then captures f6 and lands on g7. Two pieces are captured.",
               "The piece becomes a king (turned over or crowned with a second piece).",
               "No. Capturing is compulsory, and a multiple jump that has started is finished."],
   "guide_t": "How to get PaperGames on your e-reader", "guide_s": "Free board, card and puzzle games. No account, no ads, works offline.",
   "guide_steps": ["Turn on WiFi on your e-reader.",
                   "Open the browser. Depending on the device it is called \"Browser\", \"Web browser\" or \"Chrome\", usually in the menu or under \"Apps\" or \"More\".",
                   "Tap the address bar at the top and enter this address:<br><b class=\"big\">yourchaoschris.github.io/PaperGames</b>",
                   "Set a bookmark so you can find the page again. If the browser offers \"Add to home screen\", that works too.",
                   "Wait until the home page says \"Ready offline\". This can take a minute or two. After that PaperGames also works without WiFi.",
                   "Choose a game. Every game has its rules, and at the bottom you find \"Report an idea or bug\"."],
   "guide_dev": "<b>Tested on:</b> tolino, Kobo, PocketBook, Boox and other readers with a browser, also on phones, tablets and computers. On a Kindle it depends on the browser. Devices without a browser (for example reMarkable) cannot open the page.",
   "guide_help": "<b>The page shows an old version?</b> The guide on the site has a \"Force update now\" button.",
   "guide_qr": "Scan with your phone",
 },
}

SUD1 = ["12.4", ".41.", ".14.", "4..1"]
SUD1S = ["1234", "3412", "2143", "4321"]
SUD2 = ["21..", "4..1", "1..4", "..1."]
SUD2S = ["2143", "4321", "1234", "3412"]

def sheet(lang, key, url, tasks_html, solutions_html):
    t = T[lang]
    p1 = ("<div class=\"page\">" + head(lang, t[key + "_t"], t[key + "_s"], url, t["scan"]) +
          "<p>" + t["name"] + " ______________________________</p>" +
          "<p><b>" + t["goal"] + ":</b> " + t[key + "_goal"] + "</p><p>" + t[key + "_rules"] + "</p>" +
          tasks_html + "<div class=\"foot\">" + t["free"] + " " + BASE + "</div></div>")
    p2 = ("<div class=\"page\"><div class=\"head\"><div><div class=\"brand\">PaperGames</div><h1>" + t["teacher"] +
          "</h1><p>" + t[key + "_t"] + "</p></div></div>" + solutions_html + "<div class=\"foot\">" + t["free"] + "</div></div>")
    return page_html(lang, "PaperGames – " + t[key + "_t"], p1 + p2)

def task(n, text, extra=""):
    return "<div class=\"task\"><p><b>%d.</b> %s</p>%s</div>" % (n, text, extra)

def lines(k):
    return "".join("<div class=\"lines\"></div>" for _ in range(k))

def sol_list(items):
    return "<ol>" + "".join("<li>%s</li>" % i for i in items) + "</ol>"

files = {}
for lang in ("de", "en"):
    t = T[lang]
    q = "?lang=" + lang
    # Nim
    tasks = (task(1, t["nim_1"], "<p class=\"heaps\">" + heap(5) + "</p>" + lines(1)) +
             task(2, t["nim_2"], "<p class=\"heaps\">" + heap(2) + heap(2) + "</p>" + lines(2)) +
             task(3, t["nim_3"], "<p class=\"heaps\">" + heap(4) + heap(2) + "</p>" + lines(1)) +
             task(4, t["nim_4"], "<p class=\"heaps\">" + heap(3) + heap(4) + heap(5) + "</p>" + lines(2)))
    files["nim-%s" % lang] = sheet(lang, "nim", BASE + "nim.html" + q, tasks, sol_list(t["nim_sol"]))
    # Hanoi
    tab = ("<table class=\"cols\"><tr><th>" + t["han_tab_d"] + "</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>"
           "<tr><th>" + t["han_tab_m"] + "</th><td></td><td></td><td></td><td></td><td></td></tr></table>")
    tasks = (task(1, t["han_1"], lines(1)) + task(2, t["han_2"], tab + lines(1)) +
             task(3, t["han_3"], lines(1)) + task(4, t["han_4"], lines(3)))
    files["hanoi-%s" % lang] = sheet(lang, "han", BASE + "hanoi.html" + q, tasks, sol_list(t["han_sol"]))
    # Sudoku
    tasks = (task(1, t["sud_1"], grid4(SUD1)) + task(2, t["sud_2"], grid4(SUD2)) +
             task(3, t["sud_3"], lines(1)) + task(4, t["sud_4"], lines(2)))
    sols = ("<ol><li>" + grid4(SUD1S) + "</li><li>" + grid4(SUD2S) + "</li><li>" + t["sud_sol_3"] +
            "</li><li>" + t["sud_sol_4"] + "</li></ol>")
    files["sudoku-%s" % lang] = sheet(lang, "sud", BASE + "sudoku.html" + q, tasks, sols)
    # Checkers
    tasks = (task(1, t["che_1"], lines(1)) + task(2, t["che_2"], "<p>" + board_svg() + "</p>" + lines(1)) +
             task(3, t["che_3"], lines(1)) + task(4, t["che_4"], lines(1)) + "<p>" + t["che_note"] + "</p>")
    files["checkers-%s" % lang] = sheet(lang, "che", BASE + "checkers.html" + q, tasks, sol_list(t["che_sol"]))
    # One-page guide
    body = (head(lang, t["guide_t"], t["guide_s"], BASE + q, t["guide_qr"]) +
            "<ol class=\"steps\">" + "".join("<li>%s</li>" % s for s in t["guide_steps"]) + "</ol>" +
            "<p>" + t["guide_dev"] + "</p><p>" + t["guide_help"] + "</p>" +
            "<div class=\"foot\">PaperGames · " + BASE + "</div>")
    files["guide-%s" % lang] = page_html(lang, "PaperGames – " + t["guide_t"], body)

for name, html in files.items():
    with open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8") as f:
        f.write(html)
print("wrote", len(files), "files to", OUT)
