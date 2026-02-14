

## Stripe Checkout -korjaus

### Ongelma
Stripe checkout -funktio **toimii teknisesti oikein** — se palauttaa Stripe checkout URL:n onnistuneesti (näkyy network-logeista). Ongelma on siinä, että `window.location.href` ei toimi preview-ikkunassa (iframe), joten käyttäjä ei ohjaudu Stripe-sivulle.

### Ratkaisu
Vaihdetaan `window.location.href` tilalle `window.open()`, joka avaa Stripe Checkoutin uuteen välilehteen. Tämä toimii sekä preview-ympäristössä että tuotannossa.

### Tekniset muutokset

**Tiedosto: `src/pages/Premium.tsx`**
- Rivi 62: Vaihdetaan `window.location.href = data.url` -> `window.open(data.url, "_blank")`
- Tämä avaa Stripe Checkout -sivun uuteen välilehteen, mikä ohittaa iframe-rajoituksen

Tämä on yksinkertainen yhden rivin muutos, joka korjaa ongelman.
