// text/nl/shogi.js
// Rules and history texts of shogi (nl). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    shogi_rules_title: "Shogi-regels",
    shogi_rules_intro: "Een korte samenvatting van hoe PaperGames Shogi (Japans schaak) speelt - handig als je van het internationale schaken komt, want hier werken een paar dingen anders.",
    shogi_rules_basics_title: "Het basisidee",
    shogi_term_board: "Het bord en de stukken",
    shogi_rules_board: "Elke kant heeft 20 stukken op een 9x9-bord: een koning, een toren, een loper, twee gouden generaals, twee zilveren generaals, twee paarden, twee lansen en negen pionnen. Stukken zijn platte vijfhoeken die naar de tegenstander wijzen - aan welke kant een stuk toebehoort, zie je aan de richting waarin het wijst, niet aan de kleur. Zwart begint altijd.",
    shogi_term_promotion: "Promotie",
    shogi_rules_promotion: "Elk stuk behalve de koning en de gouden generaal kan promoveren tot een sterkere vorm zodra het naar binnen, naar buiten of binnen de verste drie rijen van het bord beweegt. Promoveren is optioneel, behalve wanneer een pion of lans de allerlaatste rij bereikt, of een paard een van de laatste twee rijen - dan is het verplicht, omdat het stuk anders nooit meer een legale zet zou hebben.",
    shogi_term_drops: "Slaan en neerzetten",
    shogi_rules_drops: "Een stuk slaan verwijdert het niet uit het spel: het wisselt van kant, wordt teruggezet naar zijn onbevorderde vorm, en gaat naar de hand van de slaande speler. In een latere beurt mag die speler, in plaats van een stuk op het bord te bewegen, een stuk uit zijn hand op elk leeg veld neerzetten - een van de kenmerkende ideeën van Shogi, en de reden waarom partijen zelden zonder materiaal komen te zitten.",
    shogi_term_drop_limits: "Beperkingen bij het neerzetten",
    shogi_rules_drop_limits: "Een pion of lans mag niet op de laatste rij worden neergezet, en een paard mag niet op een van de laatste twee rijen worden neergezet, omdat ze daar geen legale zet zouden hebben. Een pion mag niet worden neergezet op een lijn waar je al een eigen onbevorderde pion op hebt, en een neergezette pion mag nooit direct schaakmat geven (schaak geven mag nog steeds, alleen geen mat).",
    shogi_rules_end_title: "Hoe een partij eindigt",
    shogi_term_win: "Winnen",
    shogi_rules_win: "Een koning in schaak die niet kan ontsnappen, blokkeren of het bedreigende stuk kan slaan, staat schaakmat - de partij eindigt meteen.",
    shogi_term_resignation: "Opgeven",
    shogi_rules_resignation: "Een speler kan op elk moment opgeven, waarmee de partij meteen in het voordeel van de tegenstander eindigt.",
    shogi_term_sennichite: "Herhaling (sennichite)",
    shogi_rules_sennichite: "Als dezelfde stelling - dezelfde stukken op dezelfde velden, dezelfde stukken in beide handen en dezelfde speler aan zet - vier keer voorkomt, is de partij remise. Uitzondering: als een speler tijdens de hele herhaling met elke zet schaak gaf, verliest die speler. PaperGames past deze regel automatisch toe.",
    shogi_history_title: "De Geschiedenis van Shogi",
    shogi_history_origins_title: "Uit India, via Zuidoost-Azië",
    shogi_history_origins_p1: "Net als internationaal schaken en Xiangqi stamt Shogi uiteindelijk af van chaturanga, het oude Indiase oorlogsspel dat zich vanaf ongeveer de 6e eeuw n.Chr. langs handelsroutes over Azië verspreidde. Het bereikte Japan ergens vóór de 10e eeuw, hoogstwaarschijnlijk via Zuidoost-Azië en China, en werd in de eeuwen daarna aangepast tot specifiek Japanse vormen.",
    shogi_history_origins_p2: "Vroege Japanse schaakvarianten waren aanzienlijk groter dan het moderne spel - sommige historische vormen, zoals Dai Shogi en het enorme Tai Shogi, gebruikten borden van 15x15 velden of meer met ruim honderd stukken per kant. De 9x9-versie met 20 stukken die vandaag wordt gespeeld, werd rond de 16e eeuw de standaard.",
    shogi_history_spread_title: "De Oorsprong van de Neerzetregel",
    shogi_history_spread_p1: "Het bepalende kenmerk van Shogi - dat een geslagen stuk van kant wisselt en weer op het bord kan worden neergezet - heeft geen equivalent in schaken of Xiangqi en onderscheidt het van elk ander spel in deze verzameling. Historici brengen het ontstaan ervan meestal in verband met de praktijk, gangbaar onder Japans strijdende samoerai-clans, om gevangengenomen soldaten rechtstreeks in het eigen leger op te nemen in plaats van ze puur als verliezen te behandelen.",
    shogi_history_spread_p2: "Wat de precieze oorsprong ook is, de neerzetregel verandert het karakter van het spel ingrijpend: materiaal verdwijnt vrijwel nooit permanent, partijen lopen zelden vast door simpele materiaaluitwisseling, en een agressieve aanval kan onbeperkt worden gevoed met wat de aanvaller al heeft geslagen.",
    shogi_history_modern_title: "Een Levende Professionele Traditie",
    shogi_history_modern_p1: "Shogi kent sinds de Edo-periode (17e-19e eeuw) een ononderbroken professionele toernooitraditie in Japan, toen het Tokugawa-shogunaat een erfelijk stelsel van professionele spelershuizen financierde - een lijn die uitgroeide tot de moderne Japan Shogi Association, opgericht in 1924.",
    shogi_history_modern_p2: "Computer-Shogi liep lange tijd achter op computerschaken door de enorme vertakkingsgraad die de neerzetregel met zich meebrengt, maar halverwege de jaren 2010 versloegen programma's zoals Ponanza de beste menselijke professionals overtuigend, wat dezelfde debatten over mens-tegen-computer op gang bracht die het schaken één of twee decennia eerder had doorgemaakt."
});
I18n.markTextLoaded("nl");
