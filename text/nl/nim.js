// text/nl/nim.js
// Rules and history texts of nim (nl). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    nim_rules_title: "Regels van Nim",
    nim_rules_intro: "Twee spelers nemen om de beurt stenen van meerdere hopen. Met de normale regel wint wie de laatste steen neemt.",
    nim_rules_basics_title: "De regels",
    nim_term_move: "Een zet",
    nim_rules_move: "Kies een rij en neem er zoveel stenen uit als je wilt, minstens één. Tik de steen aan tot waar je wilt nemen: hij en alle stenen rechts ervan krijgen een kruis. Tik dan op „Stenen nemen”.",
    nim_term_end: "Het einde",
    nim_rules_end: "Normaal: wie de laatste steen neemt, wint. Misère: wie de laatste steen neemt, verliest.",
    nim_term_heaps: "Hopen",
    nim_rules_heaps: "3, 4 en 5 stenen (standaard), de klassieke 1, 3, 5 en 7, of willekeurige hopen (3 of 4 hopen van 1 tot 7 stenen).",
    nim_term_secret: "De winnende regel",
    nim_rules_secret: "Schrijf elke hoopgrootte binair en tel de kolommen op zonder onthouden (xor): de uitkomst is de nim-som. Is die 0, dan verliest de speler aan zet bij perfect spel; anders is er altijd een zet die hem 0 maakt. Bij misère speel je net zo, tot er alleen hopen van één steen over zouden blijven – laat er dan een oneven aantal van over.",
    nim_term_computer: "De computer",
    nim_rules_computer: "Makkelijk speelt een willekeurige zet, Gemiddeld de helft van de keren de beste zet, Moeilijk altijd de beste. Vanuit een winnende stand is Moeilijk niet te verslaan; daarom zegt de regel onder de hopen of de beginstand gewonnen of verloren is voor wie begint – kies daarop wie begint.",
    nim_history_title: "De geschiedenis van Nim",
    nim_history_origins_title: "Stenen wegnemen",
    nim_history_origins_p1: "Spellen waarbij je voorwerpen van hopen wegneemt, worden al sinds de oudheid gespeeld; waar Nim vandaan komt, is onzeker. Vaak wordt het in verband gebracht met het Chinese spel jiǎn shízǐ („stenen oprapen”), en de vroegste Europese vermeldingen stammen uit het begin van de 16e eeuw.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "In 1901 publiceerde Charles L. Bouton van Harvard University de volledige theorie van het spel en gaf het de naam Nim. De naam verklaarde hij nooit; vaak wordt hij herleid tot het Duitse woord „nimm” („neem!”).",
    nim_history_machines_title: "Nim-machines",
    nim_history_machines_p1: "Nim was een van de eerste spellen die door machines werden gespeeld: de Nimatron op de Wereldtentoonstelling in New York in 1940, en een computer van Ferranti, getoond op het Festival of Britain in 1951."
});
I18n.markTextLoaded("nl");
