

# Background Studio - Seuraavat vaiheet

## Yhteenveto

Rakennetaan kaksi keskeista ominaisuutta Background Studioon: **Background Controls -sätöpaneeli** ja **Hero Image Drop Zone**. Molemmat integroidaan olemassa olevaan HeroBackgroundWorkspace-komponenttiin.

---

## Vaihe 1: Background Controls -säätöpaneeli

Päivitetään nykyinen Style-tab kattavaksi Background Controls -paneeliksi, joka sisältää:

**Gradient Controls:**
- Gradient type selector (linear / radial / conic) -- valinta vaihtaa gradient-renderöintiä `buildHeroGradient`-funktiossa
- Angle slider (0-360 astetta) -- ohjaa linear-gradientin kulmaa
- Blend mode selector (normal, overlay, soft-light, multiply, screen)

**Pattern Controls:**
- Noise amount slider (0-100%)
- Grain size slider (fine / medium / coarse)
- Texture opacity slider

**Advanced Controls:**
- Vignette toggle + intensity slider
- Soft light overlay toggle
- Radial focus position (x/y sliderit, jotka ohjaavat radial-gradientin keskipistettä)
- Exposure control slider
- Gamma control slider

**Tekniset muutokset:**
- Lisätään `HeroBackgroundSettings`-interfaceen uudet kentät: `gradientType`, `gradientAngle`, `blendMode`, `noiseAmount`, `grainSize`, `radialFocusX`, `radialFocusY`, `exposure`, `gamma`
- Päivitetään `buildHeroGradient` (heroGradient.ts) tukemaan uusia gradient-tyyppejä ja kulmia
- Päivitetään `DEFAULT_SETTINGS` uusilla oletusarvoilla
- Style-tabin UI rakennetaan uudelleen sisältämään kaikki kontrollit selkeissä osioissa (Gradient / Pattern / Advanced)
- Slider-komponenttia (`@radix-ui/react-slider`) käytetään kaikkiin liukusäätimiin

---

## Vaihe 2: Hero Image Drop Zone

Rakennetaan drag-and-drop -ominaisuus, jolla käyttäjä voi pudottaa kuvan taustan päälle.

**Toiminnallisuus:**
- Drop zone ilmestyy kun käyttäjä raahaa tiedoston preview-alueen päälle
- Tukee PNG, JPG, WebP -formaatteja
- Kuva renderöidään taustan päälle automaattisilla efekteillä:
  - Soft shadow (`drop-shadow`)
  - Subtle glow (box-shadow accent-värillä)
  - Contrast correction (automaattinen)
  - Background blur mask (valinnainen toggle)

**Simulate-togglet:**
- "Simulate website hero" -- kuva keskellä, otsikko ja napit näkyvissä
- "Simulate card layout" -- kuva korttimuodossa
- "Simulate full-screen section" -- kuva koko näkymän kokoisena

**"Auto adjust background to image" -toiminto:**
- Analysoi pudotetun kuvan dominant-värin Canvas-API:lla (piirtää kuvan pieneen canvasiin, lukee pikselitiedot, laskee keskiarvon)
- Säätää gradientin sävyjä automaattisesti yhteensopivaksi kuvan kanssa

**Tekniset muutokset:**
- Lisätään uusi state: `droppedImage` (data URL), `imageSimulateMode`, `imageBlurMask`, `autoAdjustBg`
- Lisätään `onDragOver`, `onDragLeave`, `onDrop` -handlerit preview-containeriin
- Lisätään `extractDominantColor`-apufunktio, joka käyttää canvasia värin analysointiin
- Kuva näytetään `<img>`-elementtinä taustan päällä z-index-kerroksessa
- Lisätään View-tabiin tai erilliseen osioon togglet simulate-moodeja varten

---

## Vaihe 3: heroGradient.ts-päivitykset

- Lisätään tuki `gradientAngle`-parametrille linear-gradienteissa
- Lisätään tuki `conic-gradient`-tyypille
- Lisätään tuki `radialFocusX` / `radialFocusY` -parametreille radial-gradienteissa
- Blend mode sovelletaan CSS `mix-blend-mode` -tyylillä preview-elementtiin

---

## Muutettavat tiedostot

1. **src/components/flow-engine/HeroBackgroundWorkspace.tsx** -- Pääkomponentti: uudet statet, Style-tabin UI-uudistus, Drop Zone -logiikka, simulate-togglet
2. **src/components/flow-engine/heroGradient.ts** -- Gradient-renderöinti: uudet gradient-tyypit, kulmat, radial focus
3. Molemmat vaiheet toteutetaan samassa komponentissa ilman uusia tiedostoja

