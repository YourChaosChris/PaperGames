// text/nl/skyscrapers.js
// Rules and history texts of skyscrapers (nl). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    skyscrapers_rules_title: "Skyscrapers-regels",
    skyscrapers_rules_intro: "Een korte samenvatting van hoe PaperGames Skyscrapers (Wolkenkrabbers) speelt - handig als je wat roestig bent of het net leert.",
    skyscrapers_rules_basics_title: "Het basisidee",
    skyscrapers_term_board: "Het rooster",
    skyscrapers_rules_board: "Elk vakje bevat de hoogte van een gebouw, van 1 (het laagst) tot N (het hoogst, waarbij N de grootte van het rooster is). Rond het rooster dragen sommige rijen en kolommen een aanwijzingsgetal net buiten die rand - niet per se elke rij of kolom, en niet per se aan elke kant.",
    skyscrapers_term_clues: "De randaanwijzingen lezen",
    skyscrapers_rules_clues: "Een aanwijzing geeft aan hoeveel gebouwen je zou zien als je vanaf die kant die rij of kolom in kijkt, waarbij een hoger gebouw elk lager gebouw ervoor vanuit dat gezichtspunt volledig aan het zicht onttrekt. Aanwijzingen bovenaan kijken hun kolom naar beneden, die onderaan kijken hem naar boven, die links kijken hun rij naar rechts, en die rechts kijken hem naar links.",
    skyscrapers_term_goal: "Het doel",
    skyscrapers_rules_goal: "Vul elk vakje met een hoogte van 1 tot N zodat elke rij en elke kolom elke hoogte precies één keer bevat (dezelfde regel als bij de rijen en kolommen van Sudoku, maar zonder blokregel), en elke aanwijzing rond het rooster overeenkomt met het aantal gebouwen dat vanaf die kant werkelijk zichtbaar is.",
    skyscrapers_term_input: "Hoogtes invoeren",
    skyscrapers_rules_input: "Selecteer een vakje en kies dan een hoogte van het paneel onder het bord (of typ een cijfer op een toetsenbord). Een vakje met een gestippelde rand herhaalt op dit moment een hoogte die al elders in zijn rij of kolom voorkomt - zie dat als teken dat er iets moet veranderen.",
    skyscrapers_term_difficulty: "Moeilijkheidsgraad",
    skyscrapers_rules_difficulty: "Makkelijk, Gemiddeld en Moeilijk gebruiken steeds grotere roosters (4x4, 5x5 en 6x6) met steeds minder onthulde randaanwijzingen - meer hoogtes om tegelijk mee te jongleren, maar steeds dezelfde twee regels.",
    skyscrapers_rules_example_title: "Een uitgewerkt voorbeeld",
    skyscrapers_term_example: "Zichtbare gebouwen tellen",
    skyscrapers_rules_example_p1: "Neem een rij van vier gebouwen, hoogtes 3, 1, 4, 2, van links naar rechts gelezen. Kijkend vanaf links: de 3 is als eerste zichtbaar, want er is nog niets hogers aan voorafgegaan. De 1 is lager dan de al geziene 3, dus blijft erachter verborgen. De 4 is hoger dan alles ervoor, dus is ook zichtbaar. De 2 is lager dan de 4, dus blijft verborgen.",
    skyscrapers_rules_example_p2: "Dat zijn 2 gebouwen zichtbaar vanaf links - de 3 en de 4 - dus past een linkeraanwijzing van 2 bij deze rij. Kijk je naar diezelfde rij vanaf rechts (in kijkvolgorde gelezen als 2, 4, 1, 3): de 2 is als eerste zichtbaar, de 4 is hoger dus ook zichtbaar, en zowel de 1 als de 3 daarna zijn lager dan de al geziene 4, dus geen van beide is zichtbaar - ook hier een rechteraanwijzing van 2, hier puur toevallig voor deze specifieke rij.",
    skyscrapers_rules_end_title: "Een puzzel afronden",
    skyscrapers_term_win: "Opgelost",
    skyscrapers_rules_win: "De puzzel is opgelost zodra het rooster volledig is ingevuld, elke rij en kolom elke hoogte precies één keer bevat, en elke randaanwijzing overeenkomt met het werkelijke aantal zichtbare gebouwen van zijn rij of kolom.",
    skyscrapers_history_title: "De geschiedenis van Skyscrapers",
    skyscrapers_history_origins_title: "Wortels in de puzzeltijdschriftcultuur",
    skyscrapers_history_origins_p1: "Anders dan Sudoku heeft Skyscrapers geen enkele, goed gedocumenteerde uitvinder of eerste publicatiedatum waarover historici het eens zijn. Zoals veel logicapuzzelgenres lijkt het geleidelijk te zijn ontstaan en verspreid via de puzzeltijdschriftcultuur, in plaats van toegeschreven te worden aan één met naam genoemde bedenker op één bepaald moment - het idee van de zichtbaarheidsaanwijzing is eenvoudig genoeg dat meer dan één puzzelontwerper er onafhankelijk van elkaar op kan zijn gekomen.",
    skyscrapers_history_origins_p2: "Wat wel vaststaat, is de wiskunde erachter: net als bij Sudoku is een opgelost Skyscrapers-rooster een Latijns vierkant - een rooster waarin elk symbool, hier een gebouwhoogte, precies één keer per rij en kolom voorkomt -, een object dat Leonhard Euler in de 18e eeuw bestudeerde, lang voordat een van beide puzzels bestond.",
    skyscrapers_history_spread_title: "Een wedstrijdpuzzel",
    skyscrapers_history_spread_p1: "Skyscrapers vond zijn breedste internationale publiek via competitief puzzelen, met name het World Puzzle Championship, een jaarlijkse internationale puzzelwedstrijd die voor het eerst in 1992 werd gehouden, waar het een van de vele terugkerende standaardgenres is naast de Sudoku-familie en andere op Latijnse vierkanten gebaseerde puzzels.",
    skyscrapers_history_spread_p2: "Die wedstrijdomgeving hielp om de regels en presentatie van de puzzel vast te leggen in de standaardvorm die vandaag wordt gespeeld, ook zonder één erkende uitvinder - net zoals verschillende terugkerende puzzelgenres hun uiteindelijke vorm minder aan één bedenker te danken hebben dan aan herhaald gebruik in puzzeltijdschriften en wedstrijdpuzzelsets.",
    skyscrapers_history_modern_title: "Latijnse vierkanten, van buitenaf bekeken",
    skyscrapers_history_modern_p1: "Wat Skyscrapers conceptueel bijzonder maakt, is hoe het een ruimtelijk, visueel idee - langs een rij gebouwen kijken en tellen hoeveel er hoog genoeg zijn om gezien te worden - stapelt op logica die al bekend is van de rijen en kolommen van Sudoku. Precies die combinatie geeft de puzzel ook zijn naam en zijn thematische presentatie, in tegenstelling tot het simpele rooster van cijfers dat een Sudoku of een kaal Latijns-vierkantpuzzel toont.",
    skyscrapers_history_modern_p2: "Het is ook precies de eigenschap waarop de generator van PaperGames omgekeerd leunt: omdat een randaanwijzing eigenlijk gewoon een feit is dat uit een voltooid rooster wordt berekend, wordt elke puzzel hier gemaakt door eerst een volledig geldig rooster te bouwen, daaruit elke mogelijke aanwijzing te berekenen, en vervolgens alleen zoveel van die aanwijzingen te bewaren als nodig zijn om het rooster op één unieke oplossing vast te leggen - dezelfde genereer-en-reduceer-aanpak die de Sudoku- en Kakuro-generators van deze verzameling gebruiken, aangepast aan een andere voorwaarde."
});
I18n.markTextLoaded("nl");
