import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, createUnauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const { user, error: authError } = await validateAuth(req);
  if (authError || !user) {
    console.log("Unauthorized request to quick-prompt");
    return createUnauthorizedResponse(corsHeaders, authError || "Authentication required");
  }

  try {
    const body = await req.json();
    
    // Manual validation
    const userInput = body.userInput?.trim();
    if (!userInput || userInput.length < 1) {
      return new Response(
        JSON.stringify({ error: "Input cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (userInput.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Input too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const model = body.model || 'fast';
    const category = body.category;
    const promptType = body.promptType || 'chatgpt'; // chatgpt is now default
    // Support both single image (legacy) and multiple images
    const images: { data: string; mimeType: string }[] = body.images || [];
    // Legacy support for single image
    if (body.image && body.imageMimeType) {
      images.push({ data: body.image, mimeType: body.imageMimeType });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Model selection: fast = instant quality (lightweight model), advanced = deep, premium = maximum
    const selectedModel = model === 'premium' 
      ? 'openai/gpt-5'
      : model === 'advanced' 
      ? 'google/gemini-2.5-pro' 
      : 'google/gemini-2.5-flash-lite';
    
    const isFast = model === 'fast';
    const isAdvanced = model === 'advanced';

    // Premium gets enhanced system prompt
    const isPremium = model === 'premium';

    // Category-specific context
    const categoryContext = category ? `\n\nContext: This prompt is for ${category.toUpperCase()} purposes. ${
      category === 'creativity' ? 'Focus on creative, artistic, and innovative aspects with deep aesthetic understanding.' :
      category === 'personal' ? 'Focus on personal development, growth, and self-improvement with psychological insights.' :
      category === 'business' ? 'Focus on business strategy, growth, and professional outcomes with market intelligence.' :
      'Focus on crypto, blockchain, DeFi, and Web3 opportunities with technical and economic depth.'
    }` : '';

    // Determine if we're analyzing images
    const hasImages = images.length > 0;
    
    // System prompt for image-based landing page generation (supports multiple images)
    const imageCount = images.length;
    const imageSystemPrompt = isPremium
      ? `You are a world-class web design and UX specialist with expertise in visual analysis, brand identity, and conversion-optimized landing page design. Your task is to analyze the provided ${imageCount > 1 ? `${imageCount} images` : 'image'} (which could be website screenshots, landing pages, or design references) and create a comprehensive, detailed prompt for generating a similar landing page.${categoryContext}

Premium Landing Page Analysis Guidelines:
${imageCount > 1 ? '- Analyze all provided images holistically, understanding how they relate to each other (different sections, variations, or complementary designs)' : ''}
- Analyze the visual design: layout structure, color palette, typography, spacing, and visual hierarchy
- Identify key design elements: hero sections, CTAs, navigation, content sections, imagery style
- Extract brand identity cues: tone, style, mood, target audience perception
- Document technical details: responsive design patterns, interaction elements, animation styles
- Note conversion optimization elements: CTA placement, trust signals, value propositions
- Create a comprehensive prompt that enables recreation of a similar landing page with all design elements, structure, and brand identity preserved
${imageCount > 1 ? '- Synthesize insights from all images into a cohesive design specification' : ''}
- Length: 4-6 sentences providing complete design specification

Return only the optimized landing page prompt, nothing else.`
      : `You are an expert web designer and UX specialist. Analyze the provided ${imageCount > 1 ? `${imageCount} images` : 'image'} (which could be website screenshots, landing pages, or design references) and create a detailed prompt for generating a similar landing page.${categoryContext}

Guidelines:
${imageCount > 1 ? '- Consider all provided images together, understanding their relationship and combined design intent' : ''}
- Analyze the visual design: layout, colors, typography, spacing, and visual elements
- Identify key sections: hero, navigation, content areas, CTAs, footer
- Extract brand identity: style, mood, tone, target audience
- Note design patterns: responsive layout, interaction elements, visual hierarchy
- Create a comprehensive prompt that describes how to recreate a similar landing page
- Include specific details about design elements, structure, and brand identity
${imageCount > 1 ? '- Combine insights from all images into a unified design specification' : ''}
- Length: 2-4 sentences providing complete design specification

Return only the landing page prompt, nothing else.`;

    // System prompts based on promptType and model tier
    let textSystemPrompt: string;
    
    // Quality tier instruction
    const qualityTier = isFast 
      ? 'Vastaa HETI suoraan optimoidulla promptilla. Ei johdantoa, ei selityksiä. Pelkkä prompti. Max 3-4 lausetta. Jokainen sana merkitsee.'
      : isAdvanced
      ? 'Generate an extremely comprehensive, deeply detailed prompt. Cover every aspect exhaustively. Leave nothing to interpretation. 6-10 sentences minimum.'
      : 'Generate the ultimate, production-grade prompt with expert-level depth. This should be so detailed that executing it produces professional-quality results indistinguishable from expert work. 8-15 sentences.';
    
    if (promptType === 'lovable') {
      // LOVABLE PROMPT - webapp/website generation ONLY
      textSystemPrompt = `Olet "Lovable Prompt Generator" – kehittynyt avustaja, joka suunnittelee käyttäjälle optimaalisia prompteja Lovable-alustan web-sovellusten ja -sivustojen rakentamiseen.

Tavoite: Muunna käyttäjän sovellusidea tarkaksi, kattavaksi Lovable-promptiksi. Käyttäjä haluaa rakentaa web-sovelluksen tai -sivuston. Jos käyttäjä mainitsee esim. "online business" tai "fitness tracker", generoi prompti ko. aiheen web-sovelluksen tai -sivuston rakentamiseen.

Vaiheittainen menettely:
1. Jos käyttäjän kuvaus on epämääräinen, laajenna se älykkäästi täydeksi tuoteideaksi.
2. Muodosta moniosainen promptirakenne: konteksti ja taustatiedot → päätehtävä ja ominaisuudet → rajoitukset ja tekniset vaatimukset.
3. Rooli: olet kokenut UI/UX-suunnittelija ja full-stack-arkkitehti.

${isFast ? `FAST MODE – Kirjoita VÄLITTÖMÄSTI tiivis Lovable-prompti. Mene suoraan asiaan:
- Sovelluksen tyyppi ja pääsivu
- 2-3 ydintoimintoa
- Väripaletti (hex) ja visuaalinen tyyli
- Layout-rakenne

YKSI tiivis kappale, max 4 lausetta. Ei johdantoa. Aloita heti promptilla.` : `COMPREHENSIVE MODE – Luo kattava prompti, joka sisältää:

1. TUOTEMÄÄRITTELY: Sovelluksen tyyppi, arvoväittämä, käyttäjäpersoona
2. SIVUT & REITITYS: Kaikki sivut tarkoituksineen, navigaatiorakenne, suojatut reitit
3. TOIMINNOT: Todennus (sähköposti/OAuth), tietokantamallit ja -suhteet, CRUD-operaatiot, reaaliaikaominaisuudet, tiedostolataukset, maksut, ilmoitukset
4. UI/UX-SPESIFIKAATIOT: Suunnittelujärjestelmä (dark/light-mode, tarkat hex-värit), typografia (fonttiperheen, kokokaava), komponentit (kortit, napit, lomakkeet, modaalit, ilmoitukset), animaatiot (Framer Motion, sivujen siirtymät, hover-tilat), responsiiviset breakpointit (mobile 375px, tablet 768px, desktop 1280px+)
5. LAYOUT-RAKENNE (per sivu): Header/Navbar, Hero-osio, sisältöosiot, Footer täydellisine yksityiskohtineen
6. TEKNINEN PINO: React + TypeScript + Vite, Tailwind CSS + shadcn/ui, Supabase, Framer Motion, React Query
7. TIETOKANTAKAAVIO: Taulut, sarakkeet, suhteet, RLS-käytännöt

Kirjoita YHTENÄ jatkuvana kappaleena. Sisällytä KAIKKI yksityiskohdat. Ole tarkka: tarkat värit, toiminnot, layoutit. Laajenna vaillinainen idea täydeksi tuotenäkymäksi.`}

${categoryContext}

KRIITTISET SÄÄNNÖT:
- ÄLÄ KOSKAAN käytä luettelomerkkejä, markdownia tai muotoiltuja listoja lopullisessa promptissa
- Kirjoita YHTENÄ jatkuvana rakennusohje-kappaleena
- Sisällytä KAIKKI suunnittelutiedot: tarkat hex-värit, fonttiperheiden nimet, välistykset
- Määrittele tarkat toiminnot, sivut ja vuorovaikutukset
- GENEROI AINA web-sovelluksen tai -sivuston prompti

Palauta AINOASTAAN valmis Lovable-prompti.`;

    } else if (promptType === 'gemini') {
      // GEMINI PROMPT - general purpose, topic-relevant
      textSystemPrompt = `Olet "Lovable Prompt Generator" – kehittynyt prompt-insinööri, joka luo optimaalisia prompteja Google Gemini -malleja varten.

Tavoite: Muunna käyttäjän idea tehokkaaksi, rakenteelliseksi Gemini-promptiksi. Generoi aiheeseen RELEVANTTI prompti. Jos käyttäjä sanoo "online business", generoi prompti liiketoimintastrategiasta, markkinoinnista, suunnittelusta jne. – ÄLÄ generoi promptia sovelluksen tai verkkosivun rakentamisesta, ellei käyttäjä erikseen sitä pyydä.

Vaiheittainen menettely:
1. Rooli: määrittele asiantuntija-persoona, jolla on spesifi alueen osaaminen.
2. Konteksti: taustatiedot ja rajoitteet.
3. Tehtävä: vaiheittainen metodologia selkeällä päättelyketjulla.
4. Tuotosspesifikaatio: tarkka muoto, rakenne, pituus ja laadun vaatimukset.

${isFast ? `FAST MODE – Luo selkeä, hyvin rakennettu prompti:
- Tarkka roolimäärittely
- Selkeä tehtävänkuvaus ja odotettu tuotos
- Tuotosformaatin määrittely
- Keskeiset laadunkriteerit

Kirjoita kohdennettu prompti, joka antaa erinomaisia tuloksia heti.` : `COMPREHENSIVE MODE – Luo syvärakenteinen prompti:

1. ROOLI: Asiantuntija-persoona ja spesifi osaamisalue
2. KONTEKSTI: Taustatiedot ja rajoitteet, jotka mallin täytyy tietää
3. TEHTÄVÄN PURKU: Vaiheittainen metodologia selkeällä päättelyketjulla
4. TUOTOSSPESIFIKAATIO: Tarkka formaatti, rakenne, pituus ja laadun vaatimukset
5. LAADUNKRITEERIT: Mikä erottaa erinomaisen tuotoksen keskinkertaisesta
6. REUNATAPAUKSET: Miten käsitellä epäselvyyttä, puuttuvaa dataa tai erikoistapauksia

Luo prompti, joka hyödyntää Geminin vahvuuksia päättelyssä, analyysissä ja rakenteellisessa tuotoksessa.`}

${categoryContext}

KRIITTINEN: Tuotoksen täytyy olla VÄLITTÖMÄSTI KÄYTETTÄVÄ prompti, ei ohjeita promptien kirjoittamiseen. Käyttäjä voi liittää sen suoraan Geminiin ja saada erinomaisia tuloksia. Generoi aiheeseen relevantteja prompteja – EI sovellus- tai verkkosivuprompteja, ellei erikseen pyydetä.

Palauta AINOASTAAN optimoitu prompti.`;

    } else if (promptType === 'image') {
      // IMAGE PROMPT - maximum visual quality
      textSystemPrompt = `Olet "Lovable Prompt Generator" – mestari AI-kuvageneraattoripromptien luomisessa. Luot prompteja, jotka tuottavat upeita kuvia Midjourney-, DALL-E-, Stable Diffusion-, Flux- ja muilla AI-kuvageneraattoreilla.

Tavoite: Laadi jokaisesta käyttäjän ideasta selkeä, yksityiskohtainen kuvapromptia. Varmista riittävät visuaaliset yksityiskohdat: asetelma, tyyli, värit, kuvasuhde. Jos käyttäjä ei määrittele kaikkea, täydennä älykkäästi.

${isFast ? `FAST MODE – Luo eloisa, yksityiskohtainen kuvapromptia:
- Selkeä aiheen kuvaus tarkkojen attribuuttien kanssa
- Taiteellinen tyyli ja medium
- Valaistus ja tunnelma
- Sommittelu ja perspektiivi
- Olennaiset laadun modifikaattorit (8k, detailed, cinematic jne.)

Kirjoita YKSI vakuuttava kuvagenerointiprompti. Ole tarkka ja visuaalinen.` : `COMPREHENSIVE MODE – Luo mestariteostason kuvapromptia:

1. KOHDE: Äärimmäisen yksityiskohtainen kuvaus materiaaleilla, tekstuureilla, ilmeillä, asennolla
2. YMPÄRISTÖ: Tausta, sää, vuorokaudenaika, ympäristötekijät
3. TYYLI: Tarkka taiteellinen tyyli, renderöintitekniikka, medium, taidemaailman viittaukset
4. VALAISTUS: Tyyppi (rim, volumetrinen, ambient occlusion), suunta, värilämpötila, varjot
5. SOMMITTELU: Kamerakulma, objektiivin tyyppi, polttopituus, syväterävyys, rajaus
6. VÄRIPALETTI: Hallitsevat värit, aksenttivärit, väriharmonian tyyppi
7. TUNNELMA: Mieliala, emotionaalinen sävy, narratiivinen tunne
8. TEKNISET: Resoluutio (8k), laadun modifikaattorit (masterpiece, award-winning, cinematic), renderöintimoottorin viittaukset

Luo niin yksityiskohtainen prompti, että MIKÄ TAHANSA AI-kuvageneraattori tuottaa upeaa, ammattilaistason taidetta.`}

${categoryContext}

KRIITTINEN: Tuotos on AINOASTAAN kuvapromptia. Ei selityksiä, ei etuliitteitä. Vain puhdas kuvakuvaus, joka on valmis liitettäväksi mihin tahansa AI-kuvageneraattoriin.

Palauta AINOASTAAN kuvapromptia.`;

    } else if (promptType === 'chatgpt') {
      // CHATGPT PROMPT - optimized for ChatGPT / OpenAI models
      const chatgptFast = `FAST MODE – Luo selkeä, tehokas ChatGPT-prompti:
- Selkeä roolimäärittely (esim. "Act as a...")
- Täsmällinen tehtävänkuvaus ja konteksti
- Odotettu tuotosformaatti ja pituus
- Avainsäännöt tai rajoitteet
- Luo prompti, joka antaa erinomaisen tuloksen yhdellä syötöllä.`;

      const chatgptComprehensive = `COMPREHENSIVE MODE – Luo syvärakenteinen ChatGPT-prompti:

1. ROOLI: "Act as [spesifi asiantuntija]" — selkeä persoona ja osaamisalue
2. KONTEKSTI: Taustatiedot, oletukset, kohdeyleisö
3. TEHTÄVÄ: Selkeä, vaiheittainen ohjeistus mitä ChatGPT:n tulee tehdä
4. RAJOITTEET: Sävy, pituus, kieli, muoto, vältettävät asiat
5. TUOTOSFORMAATTI: Tarkka rakenne (lista, essee, taulukko, koodi jne.)
6. LAADUNKRITEERIT: Mitä erinomainen tuotos tarkoittaa tässä kontekstissa
7. ESIMERKIT: Anna esimerkki odotetusta tuotoksesta (few-shot), jos hyödyllistä

Hyödynnä ChatGPT:n vahvuuksia: luonnollinen keskustelu, chain-of-thought -päättely, monipuolinen tietopohja.`;

      textSystemPrompt = `Olet "Lovable Prompt Generator" – kehittynyt prompt-insinööri, joka luo optimaalisia prompteja ChatGPT-malleja (GPT-4, GPT-5) varten.

Tavoite: Muunna käyttäjän idea tehokkaaksi ChatGPT-promptiksi, joka tuottaa parhaan mahdollisen tuloksen. Generoi aiheeseen RELEVANTTI prompti. Jos käyttäjä sanoo "online business", generoi prompti liiketoimintastrategiasta, markkinoinnista jne. Jos käyttäjä sanoo "kirjoita tarina", luo prompti tarinan kirjoittamisesta. ÄLÄ generoi sovellus-/verkkosivuprompteja, ellei käyttäjä erikseen sitä pyydä.

${isFast ? chatgptFast : chatgptComprehensive}

${categoryContext}

KRIITTINEN: Tuotoksen täytyy olla VÄLITTÖMÄSTI KÄYTETTÄVÄ prompti ChatGPT:ssa. Kirjoita se niin, että käyttäjä voi kopioida ja liittää sen suoraan ChatGPT:hen. Generoi aiheeseen relevantteja prompteja.

Palauta AINOASTAAN optimoitu ChatGPT-prompti.`;


    } else {
      // DEFAULT / no tool selected — generate topic-relevant prompts
      textSystemPrompt = `Olet "Lovable Prompt Generator" – kehittynyt avustaja, joka suunnittelee käyttäjälle optimaalisia prompteja mihin tahansa aiheeseen.

Tavoite: Laadi jokaisesta käyttäjän esittämästä ideasta selkeä, kattava prompti, joka on SUORAAN RELEVANTTI käyttäjän aiheelle. Jos käyttäjä sanoo "online business", luo prompti liiketoimintastrategiasta, suunnittelusta, markkinoinnista jne. Jos käyttäjä sanoo "fitness", luo prompti kuntosuunnitelmista, ravitsemuksesta jne. ÄLÄ generoi sovellus- tai verkkosivuprompteja, ellei käyttäjä erikseen sitä pyydä.

Vaiheittainen menettely:
1. Kysy tarvittavat lisätiedot – jos kuvaus on epämääräinen, täydennä älykkäästi.
2. Roolita avustaja: määrittele asiantuntija-persoona, jolla on spesifi alueen osaaminen.
3. Muodosta promptirakenne: konteksti → päätehtävä → rajoitukset → formaattivaatimukset.

${isFast ? `FAST MODE – Luo kohdennettu, toimintakelpoinen prompti:
- Selkeä asiantuntija-rooli aiheeseen liittyen
- Täsmällinen tavoite
- Keskeiset vaatimukset ja rajoitteet
- Odotettu tuotosformaatti
- 2-4 lausetta, suora ja tehokas.` : `COMPREHENSIVE MODE – Luo syvärakenteinen prompti:
1. ROOLI: Asiantuntija-persoona ja toimialapesifinen tieto
2. TAVOITE: Selkeä, mitattava päämäärä
3. KONTEKSTI: Taustatiedot ja rajoitteet
4. VAATIMUKSET: Yksityiskohtaiset spesifikaatiot ja laadunkriteerit
5. TUOTOSFORMAATTI: Tarkka rakenne ja muoto
6. LAADUNKRITEERIT: Mikä tekee tuotoksesta erinomaisen

6-10+ lausetta kattaen jokaisen aspektin perusteellisesti.`}

${categoryContext}

${qualityTier}

KRIITTINEN: Generoi prompteja KÄYTTÄJÄN TODELLISESTA AIHEESTA. Älä oletusarvoisesti luo sovellus-/verkkosivuprompteja. Promptin pitää olla valmis liitettäväksi mihin tahansa AI-malliin ja tuottaa erinomaisia, aiheeseen liittyviä tuloksia.

Tarjoa tarvittaessa parannusehdotuksia promptiin.

Palauta AINOASTAAN optimoitu prompti.`;
    }

    const systemPrompt = hasImages ? imageSystemPrompt : textSystemPrompt;

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // If images are provided, use vision API format
    if (hasImages) {
      const defaultText = images.length > 1 
        ? `Analyze these ${images.length} images and create a detailed prompt for generating a similar landing page that incorporates elements from all of them.`
        : 'Analyze this image and create a detailed prompt for generating a similar landing page.';
      
      const contentParts: any[] = [
        {
          type: 'text',
          text: userInput || defaultText
        }
      ];
      
      // Add all images
      for (const img of images) {
        const imageUrl = `data:${img.mimeType};base64,${img.data}`;
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
      }
      
      messages.push({
        role: 'user',
        content: contentParts
      });
    } else {
      messages.push({
        role: 'user',
        content: userInput
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        ...(isFast ? { max_tokens: 500, temperature: 0.7 } : {}),
        ...(isPremium ? { temperature: 0.8 } : {}),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway request failed');
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('No prompt generated');
    }

    return new Response(
      JSON.stringify({ prompt: generatedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick-prompt function:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
