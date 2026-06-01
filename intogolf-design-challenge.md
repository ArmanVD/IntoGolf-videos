<img width="269" alt="IntoGolf logo" src="https://github.com/user-attachments/assets/placeholder" />

## Over IntoGolf

IntoGolf is een Nederlands softwarebedrijf dat sinds 2000 beheersystemen ontwikkelt voor golfclubs en -banen. Ze werken samen met clubs aan software die alle dagelijkse processen samenbrengt in één geïntegreerd systeem — van baanplanning en wedstrijdorganisatie tot ledenbeheer en financiën.

Eén van hun producten is **ikgagolfen.nl** — een platform voor golfers waarmee ze eenvoudig starttijden kunnen reserveren op banen in de buurt, hun handicap kunnen bijhouden, en met vrienden kunnen spelen. De app toont ook je WHS handicap, recente rondes en een vergelijking met clubgenoten.

IntoGolf bouwt momenteel aan een **nieuwe versie van de ikgagolfen.nl webapp**. Jij draagt daar als developer aan bij.

**Design challenge: Ontwerp en ontwikkel de "Mijn progressie" pagina voor de nieuwe ikgagolfen.nl webapp.**


## Epics sprint 12

### Fetchen & renderen
Haal de data op van de Directus API en toon de handicap progressie pagina van een golfer. Denk aan het WHS handicap, verloop over tijd, recente rondes, doelen en vergelijking met de club. Zorg ook dat studenten de data van andere golfers kunnen ophalen via het golfer ID.

### Scorekaart invullen & posten
Ontwerp en ontwikkel een manier waarop een golfer een nieuwe ronde kan invoeren — een digitale scorekaart. De ingevulde data wordt via een POST request naar de API verstuurd en verschijnt daarna direct in de lijst met recente rondes.

### Handicap grafiek *(nice to have)*
Visualiseer het handicap verloop van een golfer in een grafiek met tijdfilters (3M, 6M, 1J, Alle). Dit is een uitbreiding voor studenten die verder willen gaan.

### Gebruikerstesten *(nice to have)*
IntoGolf mist op dit moment gebruikersonderzoek. Voer een gebruikerstest uit met minimaal twee echte docenten/medestudenten of golfers uit je omgeving. Documenteer je bevindingen en verwerk verbeteringen in je ontwerp of code.


## Vrijheid in ontwerp

Je mag het design volledig overnemen zoals het is, maar je bent ook vrij om eigen ontwerpkeuzes te maken zolang de functionaliteit klopt. Heb je een beter idee voor de scorekaart, een andere manier om de doelen te tonen, of wil je de pagina anders opbouwen? Dat is prima — onderbouw je keuzes.

## Resources

### API Endpoints

- https://fdnd-agency.directus.app/items/into_golf_golfers
- https://fdnd-agency.directus.app/items/into_golf_rounds
- https://fdnd-agency.directus.app/items/into_golf_handicap_history
- https://fdnd-agency.directus.app/items/into_golf_milestones
- https://fdnd-agency.directus.app/items/into_golf_monthly_ranking

### Handige parameters
```
# Één golfer ophalen
/items/into_golf_golfers/1

# Rondes van een golfer ophalen
/items/into_golf_rounds?filter[golfer_id][_eq]=1&sort=-date&limit=5

# Handicap geschiedenis van een golfer
/items/into_golf_handicap_history?filter[golfer_id][_eq]=1
```

### Design
[Mijn progressie — Design](https://claude.ai/design/p/019e20b0-17b9-76d5-bd02-f9f0e94f7d61?file=ikgagolfen.html)

### Links
[Repository](https://github.com/fdnd-agency/intogolf)
[Live site](https://ikgagolfen.nl)


## Studentenwerk

**Semester 2 - Data Driven Web**

| Naam | Sprint 12 |
| :----- | :----- |
| Student 1 | [Sprint 12](...) |
| Student 2 | [Sprint 12](...) |
| Student 3 | [Sprint 12](...) |
| Student 4 | [Sprint 12](...) |
| Student 5 | [Sprint 12](...) |
