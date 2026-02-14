

## Ongelma

Style-osion esikatselukuvat nayttavat tyhgilta/samanlaisilta, koska:
1. Esikatseluvarien perusvarit (c1, c2) ovat liian tummia
2. Korostevarit (c3, c4) nayttavat heikosti, koska monet gradient-tyylit kayttavat matalia opacity-arvoja (esim. `25`, `30`)
3. 7 palettia jaetaan 26 tyylille, joten monet tyylit nayttavat identtisilta
4. Pienessa thumbnailissa hienovaraiset gradientit katoavat kokonaan

## Ratkaisu

Muokataan `HeroBackgroundWorkspace.tsx`:n Style-valilehden esikatselulogiikkaa:

### 1. Laajennetaan palettien maara kattamaan kaikki 26 tyylta

Luodaan 26 uniikkia, kirkasta palettia - yksi jokaiselle tyylille. Kaytettaan korkeakontrastisia vareja, joissa c3/c4 ovat kirkkaita ja erottuvat selkeasti tummasta taustasta.

### 2. Nostetaan kirkkautta esikatseluissa

Muutetaan `brightness: 1.3` arvoon `brightness: 1.6` esikatseluissa, jotta himeat tyylit erottuvat paremmin.

### 3. Lisataan `filter: brightness()` suoraan preview-diviin

Sen sijaan etta luotetaan pelkkaan settings-tason brightnessiin, lisataan inline `filter: brightness(1.5)` suoraan esikatselukuvan div-elementtiin. Tama varmistaa, etta jokaiset gradient nakyy.

### Tekninen toteutus

Muutokset kohdistuvat yhteen tiedostoon:

**`src/components/flow-engine/HeroBackgroundWorkspace.tsx`** (rivit ~1645-1700):

- Korvataan 7 palettia 26 uniikilla paletilla, joissa kaytetaan kirkkaita, erottuvia korostevareja
- Lisataan preview-diviin `filter: "brightness(1.5) saturate(1.3)"` inline-tyyli
- Pidetaan `environmentEnabled: true` ja `singleColorMode: false` ennallaan

Esimerkkeja uusista paleteista:
- Halo: sininen/violetti (`#60a5fa`, `#a78bfa`)
- Soft Sweep: turkoosi/keltainen (`#2dd4bf`, `#fbbf24`)
- Aurora: vihrea/syaani (`#34d399`, `#22d3ee`)
- Bokeh Lights: pinkki/oranssi (`#f472b6`, `#fb923c`)
- jne. - jokaiselle oma uniikki variyhdistelma

