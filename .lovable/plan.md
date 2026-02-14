

## Ongelma

`FlowEnginePage`-komponentti kayttaa `useState(initialWorkspace)` tilanhallintaan. Kun React navigoi samasta komponentista toiseen reittiin (esim. `/flow` -> `/flow/prompt-generator`), komponentti-instanssi sailyy ja `useState` EI paivity uudella `initialWorkspace`-arvolla. Siksi tyotila pysyy aina "selection"-nakymassa.

## Ratkaisu

Kaksi muutosta:

### 1. Synkronoi `activeWorkspace` propin kanssa (`FlowEnginePage.tsx`)

Lisataan `useEffect` joka paivittaa `activeWorkspace`-tilan aina kun `initialWorkspace`-prop muuttuu:

```typescript
useEffect(() => {
  setActiveWorkspace(initialWorkspace);
}, [initialWorkspace]);
```

### 2. Lisaa `key`-prop reitteihin varmuudeksi (`App.tsx`)

Lisataan jokaiselle Flow-reitille uniikki `key`, joka pakottaa Reactin luomaan uuden komponentti-instanssin:

```tsx
<Route path="/flow" element={<ErrorBoundary><FlowEnginePage key="selection" /></ErrorBoundary>} />
<Route path="/flow/prompt-generator" element={<ErrorBoundary><FlowEnginePage key="prompt-generator" initialWorkspace="prompt-generator" /></ErrorBoundary>} />
<Route path="/flow/color-codes" element={<ErrorBoundary><FlowEnginePage key="color-codes" initialWorkspace="color-codes" /></ErrorBoundary>} />
```

Nama kaksi muutosta yhdessa varmistavat, etta tyotilat avautuvat luotettavasti seka suoralla URL-navigoinnilla etta korttien kautta.

