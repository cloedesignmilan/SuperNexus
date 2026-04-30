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
    nav: {
      categories: {
        tshirts: "T-Shirts & Tops",
        swimwear: "Swimwear",
        ceremony: "Ceremony & Elegant",
        everyday: "Everyday Fashion",
        footwear: "Footwear"
      },
      login: "Login",
      tryFree: "Try it Free"
    },
    metrics: {
      images: "Images Created",
      stores: "Stores Growing With Us"
    },
    problem: {
      title: "Your beautiful images",
      titleHighlight: "aren't converting.",
      pains: [
        { title: 'High Costs', text: 'You don’t have the huge budget for professional models, photographers, and studios.' },
        { title: 'Brand Restrictions', text: 'You are often not authorized to use official supplier images, leaving you with poor alternatives.' },
        { title: 'Social Burnout', text: 'Shooting, Editing, and Posting every day requires constantly new content, an exhausting effort that is hard to maintain.' },
        { title: 'DIY AI Struggles', text: 'Generic AI tools take hours of prompting and still yield fake, unprofessional results.' }
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
      text1: "A single photoshoot can cost hundreds or even thousands",
      text1Sub: "(models, studio, photographer).",
      text2: "Generating 100 high-quality images cost around $29.",
      text3: "More content. Faster. At a fraction of the cost.",
      savings: "Average Annual Savings",
      savingsValue: "$2,000–$10,000 / year"
    },
    features: {
      title1: "No photo sets.",
      title2: "No Apps to install.",
      webApp: {
        title: "Everything via Web App.",
        subtitle1: "Take a photo. Upload it. Done.",
        subtitle2: "Your images are ready in seconds — directly from your phone.",
        subtitle3: "No downloads. No learning curve."
      },
      costs: {
        title: "Cut Shooting Costs.",
        subtitle1: "Eliminate the ongoing costs of photoshoots — for good.",
        subtitle2: "No more models, photographers, studios, or tight schedules.",
        subtitle3: "Create when you want, access everything anytime.",
        list: [
          "❌ No models to pay",
          "❌ No scheduling headaches",
          "✅ Your images, available 24/7"
        ]
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
        button: "Starting at $299/ea"
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
    ageLock: {
      tag: "True Identity Lock",
      title: "Absolute Demographic Control.",
      subtitle: "Age 18 to 50.",
      desc1: "Stop settling for generic \"flawless 20-something\" AI models.",
      desc2: "Our proprietary Age Lock System lets you target your exact buyer persona with breathtaking, realistic aging—from mature skin textures to natural expression lines.",
      male: "Male, Age",
      female: "Female, Age"
    },
    targetAudience: {
      tag: "TAILOR-MADE FOR YOU",
      title1: "An absolute game-changer",
      title2: "for fashion entrepreneurs.",
      subtitle: "Whether you run a local boutique or a global fashion empire, SuperNexus AI gives you the power of a high-end photography studio right on your smartphone.",
      boutiques: {
        title: "For Boutiques",
        desc: "Turn in-store mirror selfies into Instagram-ready campaigns without hiring a photographer.",
        tip: "Sell more on Instagram"
      },
      ecommerce: {
        title: "For E-Commerce",
        desc: "Increase conversion rates with consistent, premium product visuals that look like a high-end studio.",
        tip: "Lower return rates"
      },
      creators: {
        title: "For Content Creators",
        desc: "Create scroll-stopping lifestyle content in seconds without ever needing a real photoshoot.",
        tip: "Boost engagement"
      }
    },
    showcase: {
      title1: "One Shot.",
      title2: "Infinite Possibilities.",
      subtitle: "From a single warehouse photo to stunning, platform-ready lifestyle shots."
    },
    testimonials: {
      title1: "Over 100 shop owners",
      title2: "have already made the switch.",
      subtitle: "Discover what the pioneers of AI applied to retail are saying.",
      row1: [
        { text: "An absolute game changer. I used to spend thousands of dollars a year on photographers and models. Now the entire budget goes into ads.", author: "Martina V.", role: "Women's Boutique Owner" },
        { text: "Incredible how it respects the fabric texture. Sales generated from Instagram stories have objectively doubled in two months.", author: "David S.", role: "Fashion E-Commerce" },
        { text: "As soon as we uploaded the catalog generated with SuperNexus, our flagship items sold out. They look like stolen catwalk shots.", author: "Julia L.", role: "Store Manager" },
        { text: "My clients think I hired a prestigious agency from Milan. No one knows I do everything from the back of the store on Telegram.", author: "Francesca G.", role: "Concept Store Owner" },
        { text: "I save 3 hours a week on shooting. I take a picture of the mannequin and publish editorial photos. I would NEVER go back.", author: "Lorenzo M.", role: "Clothing Outlet" }
      ],
      row2: [
        { text: "I had strong doubts about formal wear. Instead, Artificial Intelligence manages to define lace and tulle perfectly.", author: "Elena R.", role: "Bridal Atelier & Ceremony" },
        { text: "No more sizing or fit problems. The AI wears the garment and models it on digital mannequins, proportioning it to the best.", author: "Sarah D.", role: "Curvy Boutique" },
        { text: "The feature for menswear has crazy visual quality. Now we use these images directly to run Facebook Ads.", author: "Mark P.", role: "Menswear Store" },
        { text: "It allowed us to launch weekly capsule collections without having to organize mini-shoots every Friday. Innovative.", author: "Valentina F.", role: "Multi-Brand Store" },
        { text: "It's so intuitive that the sales assistants started using it. They now create the social media content for the store during downtime.", author: "Robert T.", role: "Retail Entrepreneur" }
      ]
    },
    dimensionsGuide: {
      badge: "Total Flexibility",
      title1: "Choose the Format. ",
      title2: "We Create the Magic.",
      subtitle: "You're not limited to one style. Select the exact dimensions for your use case. We automatically generate 4 ultra-high resolution variations to give you maximum choice.",
      imagesGen: "4 Images generated",
      card1: { title: "Social Vertical", desc: "Ideal for Reels, TikTok, Shorts, and Stories. Maximum mobile impact." },
      card2: { title: "Perfect Square", desc: "The classic format for Instagram Posts, Carousels, and E-commerce Catalogs." },
      card3: { title: "Premium Portrait", desc: "The format that takes up the most space in Social feeds. Perfect for high fashion." },
      card4: { title: "Desktop & Landscape", desc: "Horizontal orientation for YouTube, Covers, and Website Banners." }
    },
    platformShowcase: {
      badge: "The Ecosystem",
      title1: "Work Anywhere. ",
      title2: "Without Limits.",
      subtitle: "SuperNexus adapts to your workflow. Shoot from the back of the store with your phone, manage huge catalogs from desktop, or use our Telegram Bot for maximum speed.",
      selected: "Selected Platform",
      button: "Try on",
      platforms: {
        mobile: { title: "Mobile App", desc: "Shoot, upload, and generate directly from the palm of your hand. The mobile-first interface is designed for those always working in-store or in the warehouse.", f1: "Direct Camera Upload", f2: "Quick Previews", f3: "Optimized Interface" },
        desktop: { title: "Desktop App", desc: "The command center for high volumes. Analyze data, manage thousands of SKUs, and batch download your campaigns with the comfort of a large screen.", f1: "Batch Catalog Management", f2: "Multiple High-Res Download", f3: "Campaign Organization" },
        telegram: { title: "Telegram Bot", desc: "No app to install. Our integrated Bot allows you to generate photos on the fly by sending a simple message, ideal for teams and quick decisions.", f1: "No App Required", f2: "Instant Workflow", f3: "Team Collaboration" }
      }
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
    nav: {
      categories: {
        tshirts: "T-Shirt e Top",
        swimwear: "Costumi da Bagno",
        ceremony: "Cerimonia ed Elegante",
        everyday: "Moda Quotidiana",
        footwear: "Calzature"
      },
      login: "Accedi",
      tryFree: "Provalo Gratis"
    },
    metrics: {
      images: "Immagini Create",
      stores: "Store In Crescita Con Noi"
    },
    problem: {
      title: "Le tue belle immagini",
      titleHighlight: "non convertono.",
      pains: [
        { title: 'Costi Eccessivi', text: 'Non hai a disposizione budget enormi per modelli professionisti, fotografi o studi fotografici.' },
        { title: 'Restrizioni Brand', text: 'Spesso non sei autorizzato a usare le foto ufficiali dei fornitori, restando con alternative scadenti.' },
        { title: 'Burnout Social', text: 'Scattare, Editare e Pubblicare ogni giorno richiede contenuti sempre nuovi, uno sforzo estenuante e difficile da mantenere.' },
        { title: 'Difficoltà IA Fai-da-te', text: 'I tool IA generici richiedono ore di test e producono comunque risultati finti e poco professionali.' }
      ]
    },
    solution: {
      title: "Progettato per essere",
      titleHighlight: "Una Macchina da Vendita.",
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
      text1: "Un singolo servizio fotografico può costare centinaia o addirittura migliaia di euro",
      text1Sub: "(modelle, studio, fotografo).",
      text2: "Generare 100 immagini di alta qualità costa circa 29€.",
      text3: "Più contenuti. Più velocemente. A una frazione del costo.",
      savings: "Risparmio Medio Annuo",
      savingsValue: "€ 2.000–€ 10.000 / anno"
    },
    features: {
      title1: "Nessun set fotografico.",
      title2: "Nessuna App da installare.",
      webApp: {
        title: "Tutto tramite Web App.",
        subtitle1: "Scatta una foto. Caricala. Fatto.",
        subtitle2: "Le tue immagini sono pronte in pochi secondi — direttamente dal tuo telefono.",
        subtitle3: "Nessun download. Nessuna curva di apprendimento."
      },
      costs: {
        title: "Abbatti i Costi di Shooting.",
        subtitle1: "Elimina i costi continui dei servizi fotografici — per sempre.",
        subtitle2: "Basta modelli, fotografi, studi o orari rigidi.",
        subtitle3: "Crea quando vuoi, accedi a tutto in qualsiasi momento.",
        list: [
          "❌ Nessun modello da pagare",
          "❌ Nessun mal di testa per gli orari",
          "✅ Le tue immagini, disponibili 24/7"
        ]
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
        button: "A partire da 299€/cad"
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
    ageLock: {
      tag: "True Identity Lock",
      title: "Controllo Demografico Assoluto.",
      subtitle: "Età 18 - 50.",
      desc1: "Basta accontentarsi di modelli IA generici e \"perfetti ventenni\".",
      desc2: "Il nostro esclusivo Age Lock System ti permette di intercettare il tuo cliente ideale con un invecchiamento realistico mozzafiato—dalla texture della pelle matura alle naturali linee d'espressione.",
      male: "Uomo, Età",
      female: "Donna, Età"
    },
    targetAudience: {
      tag: "SU MISURA PER TE",
      title1: "Un vero punto di svolta",
      title2: "per gli imprenditori della moda.",
      subtitle: "Che tu gestisca una boutique locale o un impero globale della moda, SuperNexus AI ti dà la potenza di uno studio fotografico di fascia alta direttamente sul tuo smartphone.",
      boutiques: {
        title: "Per le Boutique",
        desc: "Trasforma i selfie allo specchio in negozio in campagne pronte per Instagram senza assumere fotografi.",
        tip: "Vendi di più su Instagram"
      },
      ecommerce: {
        title: "Per E-Commerce",
        desc: "Aumenta le conversioni con foto prodotto premium e coerenti che sembrano scattate in uno studio di fascia alta.",
        tip: "Riduci i resi"
      },
      creators: {
        title: "Per Content Creator",
        desc: "Crea contenuti lifestyle in pochi secondi senza bisogno di uno shooting reale.",
        tip: "Aumenta l'engagement"
      }
    },
    showcase: {
      title1: "Uno Scatto.",
      title2: "Infinite Possibilità.",
      subtitle: "Da una singola foto di magazzino a scatti lifestyle sbalorditivi e pronti per le piattaforme."
    },
    testimonials: {
      title1: "Oltre 100 negozianti",
      title2: "hanno già fatto il salto.",
      subtitle: "Scopri cosa dicono i pionieri dell'IA applicata al retail.",
      row1: [
        { text: "Un punto di svolta assoluto. Prima spendevo migliaia di euro l'anno per fotografi e modelle. Ora l'intero budget va in pubblicità.", author: "Martina V.", role: "Proprietaria Boutique Donna" },
        { text: "Incredibile come rispetti la trama del tessuto. Le vendite generate dalle storie di Instagram sono oggettivamente raddoppiate in due mesi.", author: "David S.", role: "E-Commerce Moda" },
        { text: "Appena abbiamo caricato il catalogo generato con SuperNexus, i nostri articoli di punta sono andati sold out. Sembrano scatti rubati in passerella.", author: "Julia L.", role: "Store Manager" },
        { text: "I miei clienti pensano che abbia ingaggiato un'agenzia prestigiosa di Milano. Nessuno sa che faccio tutto dal retrobottega su Telegram.", author: "Francesca G.", role: "Proprietaria Concept Store" },
        { text: "Risparmio 3 ore a settimana sugli shooting. Faccio una foto al manichino e pubblico foto editoriali. Non tornerei MAI indietro.", author: "Lorenzo M.", role: "Outlet Abbigliamento" }
      ],
      row2: [
        { text: "Avevo forti dubbi sugli abiti da cerimonia. Invece, l'Intelligenza Artificiale riesce a definire pizzo e tulle perfettamente.", author: "Elena R.", role: "Atelier Sposa & Cerimonia" },
        { text: "Niente più problemi di taglie o vestibilità. L'IA indossa il capo e lo modella sui manichini digitali, proporzionandolo al meglio.", author: "Sarah D.", role: "Boutique Curvy" },
        { text: "La funzione per l'abbigliamento maschile ha una qualità visiva pazzesca. Ora usiamo queste immagini direttamente per le Facebook Ads.", author: "Mark P.", role: "Negozio Abbigliamento Uomo" },
        { text: "Ci ha permesso di lanciare capsule collection settimanali senza dover organizzare mini-shooting ogni venerdì. Innovativo.", author: "Valentina F.", role: "Negozio Multi-Brand" },
        { text: "È così intuitivo che hanno iniziato a usarlo anche i commessi. Ora creano loro i contenuti social per il negozio nei momenti morti.", author: "Robert T.", role: "Imprenditore Retail" }
      ]
    },
    dimensionsGuide: {
      badge: "Flessibilità Totale",
      title1: "Scegli il Formato. ",
      title2: "Noi Creiamo la Magia.",
      subtitle: "Non sei limitato a un solo stile. Seleziona le dimensioni esatte per la tua destinazione d'uso. Generiamo automaticamente 4 variazioni ad altissima risoluzione per offrirti la massima scelta.",
      imagesGen: "4 Immagini generate",
      card1: { title: "Social Verticale", desc: "Ideale per Reels, TikTok, Shorts e Storie. Massimo impatto mobile." },
      card2: { title: "Quadrato Perfetto", desc: "Il formato classico per Post Instagram, Caroselli e Cataloghi E-commerce." },
      card3: { title: "Ritratto Premium", desc: "Il formato che occupa più spazio nel feed dei Social. Perfetto per l'alta moda." },
      card4: { title: "Desktop & Landscape", desc: "Orientamento orizzontale per YouTube, Copertine e Banner per Siti Web." }
    },
    platformShowcase: {
      badge: "L'Ecosistema",
      title1: "Lavora Dove Vuoi. ",
      title2: "Senza Confini.",
      subtitle: "SuperNexus si adatta al tuo flusso di lavoro. Scatta dal retrobottega col telefono, gestisci enormi cataloghi da desktop o usa il nostro Bot Telegram per massima velocità.",
      selected: "Piattaforma Selezionata",
      button: "Prova su",
      platforms: {
        mobile: { title: "Mobile App", desc: "Scatta, carica e genera direttamente dal palmo della tua mano. L'interfaccia mobile-first è progettata per chi lavora sempre in negozio o in magazzino.", f1: "Caricamento Diretto da Fotocamera", f2: "Anteprime Rapide", f3: "Interfaccia Ottimizzata" },
        desktop: { title: "Desktop App", desc: "Il centro di comando per volumi elevati. Analizza i dati, gestisci migliaia di SKU e scarica in batch le tue campagne con la massima comodità del grande schermo.", f1: "Gestione Cataloghi in Batch", f2: "Download Multiplo ad Alta Risoluzione", f3: "Organizzazione per Campagne" },
        telegram: { title: "Telegram Bot", desc: "Nessuna app da installare. Il nostro Bot integrato ti permette di generare foto al volo inviando un semplice messaggio, ideale per i team e le decisioni rapide.", f1: "Nessuna App Richiesta", f2: "Flusso di Lavoro Istantaneo", f3: "Team Collaboration" }
      }
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
