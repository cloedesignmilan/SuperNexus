import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper per generare scene combinando arrays di elementi
function generateCombinations(locations: string[], moments: string[], actions: string[], max: number = 100): string[] {
    const scenes: string[] = [];
    for (const loc of locations) {
        for (const mom of moments) {
            for (const act of actions) {
                if (scenes.length < max) {
                    scenes.push(`${act} ${loc}, ${mom}`);
                }
            }
        }
    }
    // Mescoliamo per bene a scopo descrittivo nel DB
    return scenes.sort(() => Math.random() - 0.5).slice(0, max);
}

// 1. ELEGANZA ADULTI (GALA)
const galaLocations = ["in un esclusivo rooftop bar di Manhattan", "in un foyer d'opera neobarocco", "su un tappeto rosso sfarzoso", "all'interno di un ristorante stellato Michelin", "allo sbarco di un ponte da yacht extralusso", "in una terrazza panoramica con piscina in vetro"];
const galaMoments = ["luce bluastra cyberpunk notturna", "flash accecanti dei paparazzi", "luce calda diffusa da storici lampadari in cristallo", "golden hour mozzafiato sullo sfondo", "illuminazione direzionale da passerella di alta moda"];
const galaActions = ["Posa sofisticata ed enigmatica", "Camminata fiera da supermodella", "Mentre degusta champagne con sguardo fendente", "Girandosi a sorpresa verso l'obiettivo", "In piedi con postura impeccabile", "Seduta in posa rilassata ma lussuosa"];

// 2. SPOSA
const sposaLocations = ["in una storica villa italiana col lago alle spalle", "sotto un meraviglioso arco decorato di glicini", "nella navata luminosa di una maestosa cattedrale gotica", "in un giardino botanico incantato e lussureggiante", "all'interno di una suite nozze imperiale dai dettagli d'oro", "sulla sabbia finissima di una spiaggia privata esotica"];
const sposaMoments = ["illuminata dai caldi raggi del tramonto", "avvolta dalla nebbia romantica mattutina", "illuminazione cinematografica drammatica hollywoodiana", "luce eterea e soffusa dal cielo nuvoloso", "circondata da lucciole o illuminazioni calde a bulbo"];
const sposaActions = ["Fermo immagine nostalgico guardando l'orizzonte", "Sfilando dolcemente e sollevando i lembi del velo", "In posa maestosa ed elegante di fronte all'obiettivo", "Sorridente e luminosa con lo sguardo rivolto in basso", "Di profilo per enfatizzare la caduta del tessuto", "Seduta romanticamente per un ritratto intimo ad altissima definizione"];

// 3. FESTA 18 ANNI (TEEN)
const teenLocations = ["in una pista da ballo fumosa da club esclusivo", "al centro di un super-party in piscina in collina", "a bordo di una limousine extralusso con vetri oscurati", "su un rooftop allestito per feste giovanili con vista città", "in una lussuosa stanza loft in affitto piena di palloncini e insegne led"];
const teenMoments = ["sotto violente luci strobo al neon", "con luce mista rosa e viola vibrante", "fotografia in stile polaroid con flash frontale diretto e duro", "illuminazione coloratissima party-chic", "luce calda mescolata al blu della piscina notturna"];
const teenActions = ["Ballando scatenata verso l'obiettivo", "Posa sfacciata e sicura di sé ad altissima energia", "Soffiando coriandoli o glitter in direzione del fotografo", "Ridendo felice con lo sguardo in camera", "Camminando fiera come una regina della festa"];

// 4. FITNESS
const fitnessLocations = ["su un'ardua pista di atletica tartan isolata", "in un'arena high-tech pesi e calisthenics moderna", "nel verde di uno spartano sentiero forestale bagnato", "su un vasto parcheggio sotterraneo industriale in stile urbano", "in un campo da tennis in cemento illuminato artificialmente", "su uno scoglio alto che guarda l'oceano infuriato"];
const fitnessMoments = ["luce laterale intensissima (edge lighting) sui muscoli", "illuminazione cruda e tagliente per enfatizzare il sudore e le texture", "luce dell'alba frizzante e stimolante", "tramonto mozzafiato con il sole esattamente dietro le spalle in silhouette parziale"];
const fitnessActions = ["In scatto veloce sprigionando pura energia agonistica", "In posa di stiramento muscolare e sfida", "Fermo immagine del respiro affannato dopo l'allenamento", "Pugni al cielo in posa pugilistica vittoriosa", "Guardando con ferocia motivazionale dritto nella telecamera", "Piegamento esplosivo con tensione fisica realistica"];

// 5. BAMBINI
const kidsLocations = ["in un prato sterminato e fiorito come in una favola", "sulle travi in legno di un grazioso parco giochi all'aperto nordico", "lungo i camminamenti in pavé di un incantevole paesino provenzale", "davanti a una storica e luccicante giostra giostra a cavalli", "sul bagnasciuga tranquillo durante la marea calante", "in un lussuoso e moderno store di giocattoli magico"];
const kidsMoments = ["luce del sole naturale soffusa", "illuminazione morbida 'dreamy' pastello che accoglie e fa sorridere", "golden hour primaverile che illumina i capelli da dietro", "giornata estiva con luce fresca, nitida e iper-colorata"];
const kidsActions = ["Correndo felice senza guardare l'obiettivo, naturalezza candida", "Giocando spensierato con un grosso palloncino tondo in mano", "Fermo in posa con uno sguardo furbetto da catalogo di lusso", "Esplorando l'ambiente circostante con lo stupore infantile negli occhi", "Ridendo genuinamente rincorrendo un animale domestico fuori campo", "Mangiando sorridente un gelato seduto composto"];

// 6. STREETWEAR 
const streetLocations = ["in una stazione metropolitana sotterranea brutalista e sporca di graffiti", "su scalinate d'emergenza in metallo di un grattacielo", "in un enorme parcheggio urbano semi-vuoto con rampe in cemento", "sulla pedana in cemento fuso di un ruvido skatepark", "in uno stretto ed oscuro vicolo cyberpunk incuneato fra neon sfavillanti"];
const streetMoments = ["riprese analogiche sporche e granulose stile rullino da 35mm medio formato", "luce al neon tremolante artificiale, toni drammatici di ciano ed arancio", "ombra netta e cruda tagliata dalla luce del sole a picco sui palazzi alti", "illuminato solo dai fanali fortissimi di un'automobile vicina"];
const streetActions = ["Posando seduto casualmente col cappuccio calato e sguardo freddo", "Passeggiando incurante con le mani nelle tasche a ritmo street", "Salto dinamico in mid-air su ostacolo urbano immortalato ad altissima velocità", "Guardando attraverso la recinzione a maglie metalliche con espressione tagliente", "Seduto sfrontatamente sul bordo stradale con le ginocchia larghe"];

const premiumTemplates = [
    {
        name: "Eleganza Adulti (Gala)",
        category: "Donna",
        base_prompt: "Shot on Sony A1 G-Master 85mm f/1.2 lens. High-end Vogue magazine editorial cover photography. Superlative, luxurious atmosphere. Incredibly sharp focus, masterful commercial lighting, hyper-realistic 8k details, flawless human skin and pores.",
        rules: "STRICT: Do NOT alter the clothing piece provided at all. The fit, the style, and the color MUST REMAIN 100% VISUALLY IDENTICAL. Photorealistic rendering, absolute realism.",
        scenes: JSON.stringify(generateCombinations(galaLocations, galaMoments, galaActions, 100))
    },
    {
        name: "Sposa e Sposo",
        category: "Cerimonia",
        base_prompt: "Shot on Sony A1 G-Master 85mm f/1.4 lens. Best luxury bridal magazine editorial photography. Dreamy depth of field, sublime ethereal atmosphere, perfectionist skin texture and realistic face. Ultra high resolution.",
        rules: "STRICT: Keep the dress and tailoring STRICTLY IDENTICAL in every detail. Do not hallucinate styles not present. Absolute photorealism.",
        scenes: JSON.stringify(generateCombinations(sposaLocations, sposaMoments, sposaActions, 100))
    },
    {
        name: "Festa 18 Anni (Teen)",
        category: "Donna Ragazze",
        base_prompt: "High-end Gen-Z trendy lifestyle commercial photography. Vivid, neon contrasts or harsh fashionable flash look (Terry Richardson style flash photography). Modern, hyperrealistic, dynamic.",
        rules: "STRICT: The garment is completely locked. Keep 100% same fit, hemline and texture as original. Photorealistic realistic teenagers.",
        scenes: JSON.stringify(generateCombinations(teenLocations, teenMoments, teenActions, 100))
    },
    {
        name: "Sportivo (Fitness)",
        category: "Unisex",
        base_prompt: "Cinematic commercial athletic campaign photography. Ultra-sharp details, dramatic rim lighting, visible sweat textures, high contrast commercial sports lookbook. Shot on 8k medium format.",
        rules: "STRICT: Keep the sportswear precisely identically constructed. Logo placements or zippers must be replicated identically.",
        scenes: JSON.stringify(generateCombinations(fitnessLocations, fitnessMoments, fitnessActions, 100))
    },
    {
        name: "Kids & Ragazzi",
        category: "Bambini",
        base_prompt: "Premium children catalog lifestyle photography. Organic and airy bright lighting, perfect focus, vivid natural colors, heartwarming joyful mood. Super 8k high photorealistic resolution.",
        rules: "STRICT: Retain the EXACT children's clothing piece. Keep identical prints or styles. Cute realistic models.",
        scenes: JSON.stringify(generateCombinations(kidsLocations, kidsMoments, kidsActions, 100))
    },
    {
        name: "Streetwear Urbano",
        category: "Uomo/Unisex",
        base_prompt: "Hypebeast high-fashion streetwear editorial lookbook. Cinematic grit, modern city low-angle photography. High fashion lighting, moody urban shadows, immaculate detail.",
        rules: "STRICT: DO NOT modify the streetwear garment. Keep absolute identical zippers, forms, strings and cuts.",
        scenes: JSON.stringify(generateCombinations(streetLocations, streetMoments, streetActions, 100))
    }
];

async function main() {
    for (const data of premiumTemplates) {
        const existing = await prisma.promptTemplate.findFirst({ where: { name: data.name } });
        if (existing) {
            await prisma.promptTemplate.update({ where: { id: existing.id }, data: data });
        } else {
            await prisma.promptTemplate.create({ data: data });
        }
    }
    console.log("Super-espansione Combinatoria: Generati fino a 100 prompt iperrealistici per Categoria!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
