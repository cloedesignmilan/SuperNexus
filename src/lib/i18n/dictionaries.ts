export type Locale = 'en' | 'it';

export const dictionaries = {
  en: {
    hero: {
      badge: "The Missing Link in Your Conversions",
      title1: "Stop Using Fashion Imagery",
      title2: "That Don’t Sell.",
      subtitle: "Turn any product photo into high-converting images in seconds.",
      subtitle2: "No photographers. No models. No skills required. Just your smartphone.",
      tryItFree: "Try it Free",
      trusted: "Trusted by growing fashion brands worldwide",
      seeResults: "See the Results"
    },
    metrics: {
      images: "Images Created",
      stores: "Stores Growing With Us"
    },
    problem: {
      title: "Your beautiful images",
      titleHighlight: "aren't converting.",
      pains: [
        { title: 'Flat Visuals', text: 'Your photos look flat, boring, and lack the premium touch that builds trust.' },
        { title: 'High Costs', text: 'You don’t have the huge budget for professional models, photographers, and studios.' },
        { title: 'Brand Restrictions', text: 'You are often not authorized to use official supplier images, leaving you with poor alternatives.' },
        { title: 'Social Burnout', text: 'Posting daily requires constant new visuals, which is exhausting and hard to maintain.' },
        { title: 'DIY AI Struggles', text: 'Generic AI tools take hours of prompting and still yield fake, unprofessional results.' },
        { title: 'Slow Turnaround', text: 'Shooting and editing content takes too much time, delaying your product launches.' }
      ]
    },
    solution: {
      title: "Built to be a",
      titleHighlight: "Sales Machine.",
      subtitle: "Take a quick photo of your product… and turn it into images that look like a professional photoshoot.",
      benefits: [
        { title: 'Studio Lighting', text: 'Studio-quality lighting and shadows applied automatically.' },
        { title: 'Realistic Models', text: 'Generate ultra-realistic human models or mannequin styling.' },
        { title: 'Platform Ready', text: 'Perfectly formatted for Meta Ads, E-Commerce, and Instagram.' },
        { title: 'Instant Delivery', text: 'Ready in seconds. Zero editing or Photoshop skills required.' }
      ]
    },
    economics: {
      title: "The Economics of AI.",
      text1: "Average traditional photoshoot costs ",
      text1Bold: "$1,500/day",
      text1End: " (models, studio, photographer).",
      text2: "Generating 100 images with SuperNexus costs ",
      text2Bold: "less than a coffee.",
      savings: "Average Annual Savings",
      savingsValue: "$2,000–$10,000 / year"
    },
    features: {
      title1: "No photo sets.",
      title2: "No Apps to install.",
      webApp: {
        title: "Everything via Web App.",
        subtitle: "Upload the photo on the Dashboard, get perfect versions back. Secure and mobile-first, with no apps to install on your device."
      },
      costs: {
        title: "Cut Shooting Costs.",
        subtitle: "Eliminate the monthly budget for models, makeup artists, photographers, and studios once and for all. All your creations remain accessible 24/7 in your secure Web App Dashboard."
      }
    },
    pricing: {
      title: "Start converting today.",
      cancelAnytime: "Cancel anytime. Your plan will remain active until expiration or until all images are fully utilized.",
      starter: {
        tag: "Perfect for testing without subscription.",
        per: "/one-time",
        features: ["images", "Web App Dashboard Access", "Instant Setup", "No expiration date"],
        button: "Get Started"
      },
      retail: {
        tag: "Scale your volumes without a subscription.",
        per: "/one-time",
        features: ["images", "Web App Dashboard Access", "Instant Setup", "No expiration date"],
        button: "Buy Now"
      },
      subscription: {
        badge: "MOST POPULAR",
        tag: "Scale your social volumes.",
        per: "/month",
        extraLabel: "Extra Top-up:",
        extraDesc: "images for",
        features: ["images/month", "Web App Dashboard Access", "Instant Setup", "No expiration date"],
        button: "Subscribe Now"
      },
      custom: {
        title1: "Custom",
        title2: "AI Models",
        subtitle: "Train the AI exactly on your brand's aesthetic. Perfect for unique niches and specialized catalogs.",
        features: ["Bespoke Categories", "Custom Subcategories", "Dedicated Support", "Priority Generation"],
        button: "Request a Quote"
      }
    },
    footer: {
      desc: "The ultimate AI generative engine built exclusively for fashion e-commerce. Scale your social volumes, reduce photography costs, and drive higher conversions.",
      contact: "Contact Support",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      rights: "© 2026 SuperNexus AI. All rights reserved.",
      slogan: "Engineered for High-Performance Generative Fashion."
    },
    guestTryOut: {
      title: "Experience the Magic.",
      subtitle: "Upload a raw photo and choose any style from our full taxonomy. Generate up to 2 times for free (3 images each).",
      uploadPrompt: "Upload a raw clothing photo...",
      uploadSub: "Supports JPG, PNG, WEBP (Max 10MB)",
      selectCat: "Select Category",
      selectMode: "Select Style",
      selectSubcat: "Select Environment",
      generateBtn: "Generate AI Images",
      generating: "Processing Magic...",
      processingPhase: "Analyzing fabric and reconstructing lighting...",
      freeTrialExhausted: "Free Trial Exhausted",
      exhaustedDesc: "You have reached the maximum limit of 2 free generations on this device. Create an account to unlock unlimited access, higher resolution, and commercial rights.",
      registerBtn: "Register for Full Access",
      resetBtn: "Try another photo"
    }
  },
  it: {
    hero: {
      badge: "L'Anello Mancante Nelle Tue Conversioni",
      title1: "Smetti Di Usare Immagini Fashion",
      title2: "Che Non Vendono.",
      subtitle: "Trasforma le foto dei tuoi prodotti in immagini ad alta conversione, in pochi secondi.",
      subtitle2: "Nessun fotografo. Nessun modello. Nessuna competenza richiesta. Solo il tuo smartphone.",
      tryItFree: "Provalo Gratis",
      trusted: "Scelto da brand di moda in rapida crescita",
      seeResults: "Guarda i Risultati"
    },
    metrics: {
      images: "Immagini Create",
      stores: "Store In Crescita Con Noi"
    },
    problem: {
      title: "Le tue belle immagini",
      titleHighlight: "non convertono.",
      pains: [
        { title: 'Immagini Piatte', text: 'Le tue foto sembrano piatte, noiose e mancano di quel tocco premium che genera fiducia.' },
        { title: 'Costi Eccessivi', text: 'Non hai a disposizione budget enormi per modelli professionisti, fotografi o studi fotografici.' },
        { title: 'Restrizioni Brand', text: 'Spesso non sei autorizzato a usare le foto ufficiali dei fornitori, restando con alternative scadenti.' },
        { title: 'Burnout Social', text: 'Pubblicare ogni giorno richiede contenuti sempre nuovi, uno sforzo estenuante e difficile da mantenere.' },
        { title: 'Difficoltà IA Fai-da-te', text: 'I tool IA generici richiedono ore di test e producono comunque risultati finti e poco professionali.' },
        { title: 'Tempi Lunghi', text: 'Scattare ed editare richiede troppo tempo, rallentando i lanci dei tuoi nuovi prodotti.' }
      ]
    },
    solution: {
      title: "Progettato per essere",
      titleHighlight: "Una Macchina di Vendita.",
      subtitle: "Scatta una foto rapida del tuo prodotto... e trasformala in immagini che sembrano uscite da uno shooting professionale.",
      benefits: [
        { title: 'Illuminazione Studio', text: 'Luci e ombre di qualità fotografica applicate in automatico.' },
        { title: 'Modelli Realistici', text: 'Genera modelli umani ultra-realistici o styling con manichino invisibile.' },
        { title: 'Pronto per le Piattaforme', text: 'Formattazione perfetta per Meta Ads, E-Commerce e Instagram.' },
        { title: 'Consegna Immediata', text: 'Tutto pronto in pochi secondi. Nessuna competenza di Photoshop richiesta.' }
      ]
    },
    economics: {
      title: "L'Economia dell'Intelligenza Artificiale.",
      text1: "Uno shooting tradizionale costa in media ",
      text1Bold: "1.500€/giorno",
      text1End: " (modelli, studio, fotografo).",
      text2: "Generare 100 immagini con SuperNexus costa ",
      text2Bold: "meno di un caffè.",
      savings: "Risparmio Medio Annuale",
      savingsValue: "2.000€ – 10.000€ / anno"
    },
    features: {
      title1: "Nessun set fotografico.",
      title2: "Nessuna App da installare.",
      webApp: {
        title: "Tutto tramite Web App.",
        subtitle: "Carica la foto sulla Dashboard, ottieni indietro versioni perfette. Sicuro e pensato per mobile, senza nessuna app da installare sul tuo dispositivo."
      },
      costs: {
        title: "Abbatti i Costi Fotografici.",
        subtitle: "Elimina una volta per tutte il budget mensile per modelli, truccatori, fotografi e studi. Tutte le tue creazioni restano accessibili 24/7 nella tua sicura Dashboard Web."
      }
    },
    pricing: {
      title: "Inizia a convertire oggi.",
      cancelAnytime: "Disdici in qualsiasi momento. Il piano resterà attivo fino alla scadenza o fino all'esaurimento delle immagini.",
      starter: {
        tag: "Perfetto per testare senza abbonamento.",
        per: "/una tantum",
        features: ["immagini", "Accesso Dashboard Web", "Setup Istantaneo", "Nessuna Scadenza"],
        button: "Inizia Subito"
      },
      retail: {
        tag: "Scala i tuoi volumi senza abbonamento.",
        per: "/una tantum",
        features: ["immagini", "Accesso Dashboard Web", "Setup Istantaneo", "Nessuna Scadenza"],
        button: "Acquista Ora"
      },
      subscription: {
        badge: "PIÙ POPOLARE",
        tag: "Scala i volumi per i tuoi social.",
        per: "/mese",
        extraLabel: "Ricarica Extra:",
        extraDesc: "immagini per",
        features: ["immagini/mese", "Accesso Dashboard Web", "Setup Istantaneo", "Nessuna Scadenza"],
        button: "Abbonati Ora"
      },
      custom: {
        title1: "Modelli IA",
        title2: "Personalizzati",
        subtitle: "Addestra l'IA esattamente sull'estetica del tuo brand. Perfetto per nicchie uniche e cataloghi specializzati.",
        features: ["Categorie su Misura", "Sottocategorie Personalizzate", "Supporto Dedicato", "Generazioni Prioritarie"],
        button: "Richiedi un Preventivo"
      }
    },
    footer: {
      desc: "Il motore generativo AI costruito esclusivamente per l'e-commerce di moda. Scala i tuoi volumi social, riduci i costi fotografici e aumenta le conversioni.",
      contact: "Contatta il Supporto",
      terms: "Termini e Condizioni",
      privacy: "Privacy Policy",
      rights: "© 2026 SuperNexus AI. Tutti i diritti riservati.",
      slogan: "Ingegnerizzato per Moda Generativa ad Alte Prestazioni."
    },
    guestTryOut: {
      title: "Vivi la Magia.",
      subtitle: "Carica una foto e scegli uno stile. Genera fino a 2 volte gratis (3 immagini ciascuna).",
      uploadPrompt: "Carica una foto del capo...",
      uploadSub: "Supporta JPG, PNG, WEBP (Max 10MB)",
      selectCat: "Seleziona Categoria",
      selectMode: "Seleziona Stile",
      selectSubcat: "Seleziona Ambiente",
      generateBtn: "Genera Immagini IA",
      generating: "Creazione in corso...",
      processingPhase: "Analisi del tessuto e ricostruzione delle luci...",
      freeTrialExhausted: "Prova Gratuita Esaurita",
      exhaustedDesc: "Hai raggiunto il limite massimo di 2 generazioni gratuite su questo dispositivo. Crea un account per sbloccare l'accesso illimitato, maggiore risoluzione e diritti commerciali.",
      registerBtn: "Registrati per l'Accesso Completo",
      resetBtn: "Prova un'altra foto"
    }
  }
};
