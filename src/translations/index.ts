
export type Language = 'EN' | 'FI';

type TranslationType = {
  [language in Language]: {
    [key: string]: string;
  };
};

export const translations: TranslationType = {
  EN: {
    // Hero
    "hero.tagline": "Unlock the secrets of crypto success with premium resources and expert insights",
    "hero.cta": "Explore Products",

    // Products
    "products.title": "Premium Products",
    "products.learnMore": "Learn More",
    "products.selfMastery.title": "Drop00 Guides",
    "products.selfMastery.subtitle": "Transform your mind. Upgrade your life.",
    "products.selfMastery.description": "Practical guides on mental reprogramming, self-awareness, and peak focus.",

    // Contact
    "contact.title": "Get in Touch",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.submit": "Send Message",
    "contact.namePlaceholder": "Your name",
    "contact.emailPlaceholder": "your@email.com",
    "contact.messagePlaceholder": "Your message...",

    // Mobile Menu
    "mobileMenu.what": "What is Multiply",
    "mobileMenu.description": "Multiply is a platform that combines mind mastery, authentic crypto utility, and visual monetization.\n\nOur mission is to ensure that you multiply your existing potential and focus it on things that create value and continuity.",

    // Think and Grow

    // About Page
    "back": "Back to Homepage",
    "about": "About",
    "about.title": "About Us",
    "about.content1": "This is a placeholder page for the About section. Here you can share information about your mission, vision, and the story behind your personal development guides.",
    "about.content2": "The content here is intentionally minimal as a starting point for you to expand with your actual information about the project and its creators.",
    
  },
  FI: {
    // Hero
    "hero.tagline": "Avaa kryptomenestyksen salaisuudet premium-resurssien ja asiantuntijanäkemysten avulla",
    "hero.cta": "Tutustu tuotteisiin",

    // Products
    "products.title": "Premium-tuotteet",
    "products.learnMore": "Lue lisää",
    "products.selfMastery.title": "Drop00 Guides",
    "products.selfMastery.subtitle": "Muuta mielesi. Päivitä elämäsi.",
    "products.selfMastery.description": "Käytännön oppaita mielen uudelleenohjelmoinnista, itsetuntemuksesta ja parhaasta keskittymisestä.",

    // Contact
    "contact.title": "Ota yhteyttä",
    "contact.name": "Nimi",
    "contact.email": "Sähköposti",
    "contact.message": "Viesti",
    "contact.submit": "Lähetä viesti",
    "contact.namePlaceholder": "Nimesi",
    "contact.emailPlaceholder": "sinun@email.com",
    "contact.messagePlaceholder": "Viestisi...",

    // Mobile Menu
    "mobileMenu.what": "Mikä on Multiply",
    "mobileMenu.description": "Multiply on alusta, joka yhdistää mielen hallinnan, aidon kryptohyödyn ja visuaalisen kaupallistamisen.\n\nMeidän tehtävä on varmistaa, että moninkertaistat sun olemassa olevan potentiaalin ja fokusoit sen asioihin, jotka luo arvoa ja jatkuvuutta.",

    // Think and Grow

    // About Page
    "back": "Takaisin etusivulle",
    "about": "Tietoa",
    "about.title": "Tietoa meistä",
    "about.content1": "Tämä on paikkamerkki Tietoa-osiolle. Täällä voit jakaa tietoa missiostasi, visiostasi ja henkilökohtaisten kehitysoppaiden tarinasta.",
    "about.content2": "Sisältö on tarkoituksella minimaalinen lähtökohtana, jotta voit laajentaa sitä todellisilla tiedoilla projektista ja sen tekijöistä.",
    
  }
};

