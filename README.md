# Kalkulator i konfigurator toplotne pumpe

Jednostavna web aplikacija za privatna domaćinstva koja računa okvirnu potrebnu snagu toplotne pumpe i predlaže konfiguraciju sistema.

## Funkcionalnosti

- unos ključnih parametara objekta (površina, izolacija, klimatska zona, tip grejnog sistema)
- dashboard sa osnovnim KPI informacijama (objekat, snaga, SCOP, godišnji trošak)
- procena projektnih toplotnih gubitaka
- preporuka nominalne snage toplotne pumpe
- procena godišnje potrošnje električne energije i troška
- preporuka temperature polaza i zapremine bafera
- čuvanje konfiguracije u browser localStorage
- izvoz konfiguracije i proračuna u JSON

## Pokretanje

Pošto je aplikacija statička, dovoljno je otvoriti `index.html` u browseru.

Ako želite lokalni server:

```bash
python3 -m http.server 8000
```

Zatim otvorite: <http://localhost:8000>

## Napomena

Proračun je informativan i ne zamenjuje detaljan projekat mašinskih instalacija.
