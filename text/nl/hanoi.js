// text/nl/hanoi.js
// Rules and history texts of hanoi (nl). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    hanoi_rules_title: "Regels van de Torens van Hanoi",
    hanoi_rules_intro: "Een toren schijven, de kleinste bovenop, staat op de linkerstaaf. Verplaats hem naar de rechterstaaf.",
    hanoi_rules_basics_title: "De regels",
    hanoi_term_move: "Een zet",
    hanoi_rules_move: "Tik een staaf aan: je pakt de bovenste schijf (de staaf krijgt een dikke rand). Tik een staaf aan om de schijf erop te leggen. Tik dezelfde staaf nog eens aan om hem terug te leggen.",
    hanoi_term_rule: "De regel",
    hanoi_rules_rule: "Alleen de bovenste schijf van een staaf mag bewegen, en hij mag nooit op een kleinere schijf liggen. Zo'n zet wordt geweigerd en er beweegt niets.",
    hanoi_term_goal: "Het doel",
    hanoi_rules_goal: "De hele toren op de rechterstaaf (met een ster). Het kleinste aantal zetten is 2 tot de macht het aantal schijven, min 1: 7 bij 3 schijven, 15 bij 4, 255 bij 8.",
    hanoi_term_help: "Terugnemen en hint",
    hanoi_rules_help: "Terugnemen maakt zetten ongedaan. De hint geeft twee staven een dubbele rand: leg de bovenste schijf van de eerste op de tweede – dat is de volgende zet van een kortste weg vanaf de stand waarin je bent.",
    hanoi_history_title: "De geschiedenis van de Torens van Hanoi",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "De Franse wiskundige Édouard Lucas presenteerde de puzzel in 1883 als een spel dat zogenaamd gevonden was door een \"N. Claus (de Siam)\" – de letters van \"Lucas d'Amiens\" in een andere volgorde. In 1889 gaf hij het uit als boekje.",
    hanoi_history_legend_title: "Een verzonnen legende",
    hanoi_history_legend_p1: "Het boekje vertelde over priesters in een tempel in Benares die een toren van 64 gouden schijven verplaatsen; als ze klaar zijn, vergaat de wereld. De legende hoorde bij het verhaal van het spel, niet bij de echte geschiedenis.",
    hanoi_history_math_title: "Het kleinste aantal zetten",
    hanoi_history_math_p1: "Voor n schijven zijn minstens 2^n − 1 zetten nodig: eerst de n − 1 kleinere schijven naar de middelste staaf, dan de grootste naar het doel, dan de kleinere erbovenop. Met 64 schijven en één zet per seconde zou dat veel langer duren dan het heelal oud is."
});
I18n.markTextLoaded("nl");
