import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    name: "Abiti donna eleganti",
    category: "Donna",
    base_prompt: "Photorealistic image, real person wearing an elegant women's dress. Commercial quality, natural lighting, boutique setting.",
    rules: "Stesso colore, tessuto, shape, proporzioni. Se non è chiaro se pantalone o gonna, flagga.",
    scenes: JSON.stringify([
      "Davanti allo specchio (prova abito)",
      "Commessa che sistema l'abito",
      "Camminata dentro negozio verso uscita",
      "Evento elegante serale",
      "Invitata a matrimonio",
      "Festa 18 anni",
      "Cena elegante",
      "Teatro",
      "Meeting professionale",
      "Passeggiata in città elegante"
    ])
  },
  {
    name: "Invitata matrimonio",
    category: "Donna - Cerimonia",
    base_prompt: "Photorealistic image, real person as a wedding guest wearing an elegant dress. Joyful atmosphere, commercial photography.",
    rules: "Stesso colore, tessuto, fashion style. Nessuna alterazione dell'abito.",
    scenes: JSON.stringify([
      "Davanti allo specchio",
      "Commessa che sistema l'abito",
      "Camminata dentro negozio",
      "Ricevimento di nozze",
      "Brindisi con gli sposi",
      "Ballo serale",
      "Esterno villa d'epoca",
      "Ingresso della chiesa/comune",
      "Tavolo elegante",
      "Foto di gruppo"
    ])
  },
  {
    name: "Festa 18 anni",
    category: "Donna - Party",
    base_prompt: "Photorealistic modern party fashion image, real young person. Glamorous, elegant 18th birthday party setting.",
    rules: "Preserva lo stile giovane ma elegante del capo in foto.",
    scenes: JSON.stringify([
      "Davanti allo specchio",
      "Commessa che sistema",
      "Selfie allo specchio boutique",
      "Arrivo alla festa",
      "Taglio della torta",
      "Ballo con amici",
      "Brindisi a bordo piscina",
      "Divanetto VIP",
      "Esterno locale serale",
      "Pista da ballo"
    ])
  },
  {
    name: "Completo uomo",
    category: "Uomo",
    base_prompt: "Hyper-realistic fashion photography of a man wearing a formal suit. Elegant, professional, high-end catalog quality.",
    rules: "Rispetta le proporzioni di giacca e pantalone, colore esatto.",
    scenes: JSON.stringify([
      "Davanti allo specchio (prova abito)",
      "Sartoria (presa misure)",
      "Uscita dal negozio",
      "Ufficio direzionale",
      "Business lunch",
      "Incontro con clienti",
      "Gala serale",
      "Aeroporto VIP lounge",
      "Cena elegante",
      "Camminata business in città"
    ])
  },
  {
    name: "Cerimonia uomo",
    category: "Uomo - Cerimonia",
    base_prompt: "Beautiful premium wedding photography. Man wearing an elegant wedding/ceremony suit. Real person, natural light.",
    rules: "Tieni i dettagli (es. papillon, cravatta, revers) identici alla foto caricata.",
    scenes: JSON.stringify([
      "Prova sartoriale",
      "Familiari che ammirano",
      "Preparazione sposo",
      "Altare / Ingresso",
      "Festa di matrimonio",
      "Brindisi",
      "Esterno cascina/villa",
      "Ballo degli sposi",
      "Gala",
      "Foto di gruppo elegante"
    ])
  },
  {
    name: "Eventi eleganti",
    category: "Unisex",
    base_prompt: "High fashion editorial photography, real person attending an exclusive elegant event. Natural lighting, 8k.",
    rules: "Capo principale invariato in colore e texture. Focus sul mood elegante.",
    scenes: JSON.stringify([
      "Fitting room",
      "Boutique experience",
      "Red carpet",
      "Teatro (platea)",
      "Cena di lusso",
      "Evento aziendale di fine anno",
      "Mostra d'arte esclusiva",
      "Terrazza panoramica sera",
      "Lounge bar elegante",
      "Sfilata"
    ])
  }
];

async function main() {
  console.log("Seeding prompt templates...");
  for (const t of templates) {
    await prisma.promptTemplate.create({
      data: t,
    });
  }
  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
