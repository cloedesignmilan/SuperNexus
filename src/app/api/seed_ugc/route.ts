import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Costruiamo variazioni "UGC - Candid" INVECE di variazioni moda.
const var1 = "full body shot from a short distance, captured casually as if by a friend's smartphone";
const var2 = "medium upper body shot, completely relaxed and authentic posture, looking natural and relatable";
const var3 = "candid spontaneous snap, slightly off-guard smiling, captured in a bright relatable lifestyle moment";

function generateScenes(situations: string[]) {
    const scenes: string[] = [];
    situations.forEach(sit => {
        scenes.push(`Casual unretouched smartphone photograph uploaded to social media. ${sit}. ${var1}. Shot outdoors or in bright natural daylight, overexposed sunny mood, relatable everyday aesthetics.`);
        scenes.push(`Casual unretouched smartphone photograph. ${sit}. ${var2}. Bright daylight, spontaneous authentic feel, real authentic human moment feeling.`);
        scenes.push(`Casual candid snapshot taken by a friend. ${sit}. ${var3}. Natural light, completely normal relatable environment, no studio lighting, authentic life.`);
    });
    return scenes;
}

const catCerimonia = [
    "standing at a bright sunny outdoor garden buffet reception chatting with friends",
    "sitting comfortably at a nice restaurant table enjoying a glass of white wine",
    "smiling warmly outside a small countryside church waiting for the ceremony to begin",
    "walking casually on a paved path in a beautiful but normal countryside venue",
    "laughing while holding a small reception cocktail appetizer outdoors",
    "clinking glasses during a toast at a sunlit outdoor patio gathering",
    "posing for a friendly smartphone group selfie at an outdoor elegant lunch",
    "walking towards a restaurant entrance on a bright sunny afternoon",
    "smiling while standing near a beautifully set outdoor garden table",
    "chatting relaxed near a small fountain at a party venue in daylight",
    "standing with an arm around an invisible friend at a daytime wedding reception",
    "sitting gracefully on a wooden garden chair during an afternoon ceremony",
    "laughing at a joke during a sunny outdoor standing buffet",
    "walking across a nicely mowed green lawn at an afternoon garden party",
    "posing casually on an outdoor restaurant terrace with a bright blue sky behind",
    "holding a small paper cone of confetti ready to throw at a wedding exit",
    "standing relaxed by a flowery bush outside a local reception hall",
    "smiling naturally during a warm sunny afternoon social gathering",
    "checking a smartphone casually while leaning against an outdoor patio railing",
    "looking super happy walking onto the patio of a nice countryside restaurant",
    "sitting at a round banquet table under natural daylight coming through big windows",
    "laughing candidly while talking to a relative at an outdoor party",
    "standing relaxed by a small dessert table in a bright sunny garden",
    "holding a fancy mocktail outside on a beautiful summer afternoon",
    "walking towards the camera with a big natural smile at a daytime reception"
];

const catSposi = [
    "walking happily out of a town hall being showered with colourful confetti on a sunny day",
    "laughing holding hands while walking slowly on a simple green countryside lawn",
    "posing casually and smiling awkwardly next to a cute vintage car on a gravel driveway",
    "hugging a family member tightly outside the local church in bright daylight",
    "standing happily doing a spontaneous twirl on a paved patio under the bright sun",
    "smiling broadly while cutting a small rustic wedding cake outdoors in the afternoon",
    "walking towards the camera hand in hand on a sunny countryside path",
    "laughing candidly when a sudden gust of wind blows during a daytime photoshoot",
    "sitting on the back bumper of an old white fiat celebrating and smiling",
    "posing for a casual smartphone selfie held by friends just after the ceremony",
    "standing outdoors in a beautiful blooming garden completely relaxed and happy",
    "holding a simple fresh flower bouquet and smiling at a friend off-camera",
    "walking out of a local registry office waving happily to friends",
    "standing happily under throwing rice, squinting and laughing in the bright sun",
    "leaning against a rustic wooden fence in a countryside agriturismo venue",
    "laughing sitting at the main table in a sunny naturally lit reception room",
    "holding hands while strolling on a bright path in a local park",
    "doing a natural un-choreographed happy dance on the lawn in broad daylight",
    "standing looking happily at the camera surrounded by blurry cheering friends outdoors",
    "smiling gently while standing under a bright sunny archway outside a small town church",
    "laughing spontaneously having a great time during a bright daytime toast",
    "walking barefoot playfully on the grass of a wedding venue in the afternoon",
    "standing close having a quiet happy moment away from the crowd outdoors",
    "posing cheerfully with a piece of wedding cake on a paper plate in the garden",
    "waving goodbye to guests from an open car window in broad daylight"
];

const cat18 = [
    "standing proudly in front of a homemade party table with a large birthday cake",
    "holding huge metallic '18' shaped helium balloons in a sunny backyard",
    "laughing while blowing out candles on an 18th birthday cake in a bright living room",
    "posing for a casual smartphone shot hugging friends in a local rented party room",
    "holding a slice of cake on a plastic plate during a sunny afternoon garden party",
    "waving to friends across a sunny patio decorated with colorful '18' banners",
    "smiling while opening a small wrapped gift outdoors on a bright afternoon",
    "laughing candidly at a joke during a daytime 18th birthday gathering at home",
    "sitting comfortably on a garden sofa surrounded by party balloons",
    "holding a paper cup and chatting with friends during a sunny backyard barbecue",
    "cutting a homemade birthday cake on a picnic table under the bright sun",
    "standing next to a big pile of gifts on a table in a sunlit afternoon room",
    "posing playfully with oversized 18th birthday plastic glasses outdoors",
    "smiling big for the camera while an off-screen person pops a small confetti cannon",
    "leaning on a friend's shoulder during a daytime celebration in a public park",
    "looking super excited while walking into a surprise party in a bright living room",
    "standing in a totally normal sunny courtyard celebrating with close relatives",
    "eating pizza slices with friends on a sunny terrace during their 18th birthday party",
    "laughing while throwing a beach ball in a sunny local backyard party",
    "posing with parents in a well lit standard living room with a birthday cake on the table",
    "holding a bunch of normal colorful balloons walking in a sunny park",
    "standing next to a 'Happy 18th' generic paper banner taped to a garden fence",
    "smiling with a totally relaxed friendly vibe outside a modest local venue",
    "taking a fun group selfie outdoors with '18' balloons clearly visible in the background",
    "sitting on a wooden picnic bench in a garden totally enjoying the party atmosphere"
];

const catSport = [
    "doing casual morning stretches leaning against a normal park bench in bright sunlight",
    "drinking from a plastic water bottle while walking down a suburban tree-lined sidewalk",
    "sitting exhausted but smiling on the steps outside a local paddle tennis club",
    "jogging lightly down a quiet residential street on a beautiful sunny morning",
    "tying a shoelace with one foot resting on a low concrete wall in a city park",
    "standing smiling with hands on hips after a run in a bright sunny town square",
    "walking casually chatting with a friend across a normal public sports field",
    "checking a fitness app on a smartphone while standing on a sunlit bike path",
    "leaning against a chainlink fence near a local soccer field on a weekend morning",
    "doing a light warmup walk through a typical neighbourhood park in the sun",
    "smiling while holding a tennis racket walking onto a local hard court",
    "sitting on the grass resting under a tree in a sunny city park",
    "walking energetically on a paved pedestrian trail during early morning hours",
    "stretching arms overhead while taking a deep breath of fresh air outdoors",
    "laughing casually with totally authentic sweat after a good outdoor workout",
    "standing near a set of public outdoor calisthenics bars in bright daylight",
    "wiping forehead with a towel while walking down a bright sunny street",
    "smiling and resting against the hood of a car parked near a local hiking trail",
    "walking casually out of a completely normal suburban gym building in daytime",
    "drinking a protein shake walking down a bright sunny sidewalk",
    "high-fiving a friend outdoors after completing a casual weekend run",
    "putting in wireless earbuds while standing in a perfectly normal neighborhood park",
    "sitting cross-legged on a yoga mat in a sunny local park looking completely relaxed",
    "walking casually along a sunny beach boardwalk early in the morning",
    "standing still looking at the view while on a morning walk in the local hills"
];

const catBambini = [
    "playing happily on a plastic slide in a perfectly normal suburban playground in the sun",
    "running carelessly across the green grass of a neighborhood park on a sunny afternoon",
    "walking while holding a parent's hand down a bright town center pedestrian street",
    "eating a big messy ice cream cone while standing in a sunny public square",
    "sitting on the edge of a sandbox playing with a toy in bright daylight",
    "laughing out loud while swinging on a playground swing in the afternoon sun",
    "running ahead of parents on a bright sunny paved park walking path",
    "standing looking at ducks near a small pond in a local suburban park",
    "smiling and waving holding a small fallen leaf on a bright autumn morning",
    "riding a small colorful scooter down a safe suburban sidewalk in the sun",
    "sitting on a park bench swinging legs happily on a completely normal weekend day",
    "laughing while chasing a pigeon in a sunny pedestrian town plaza",
    "walking carefully balancing on a low brick wall next to a sunny sidewalk",
    "standing looking curiously at a storefront window on a bright sunny day",
    "holding a small bright helium balloon walking through a completely normal city park",
    "playing tag with friends on a slightly uneven but green suburban lawn",
    "sitting in the grass looking for clovers on a beautifully sunny afternoon",
    "smiling innocently towards the smartphone camera held by a parent outdoors",
    "walking carrying a small backpack towards a typical elementary school gate in daylight",
    "jumping over a small crack in the pavement on a bright sunny afternoon",
    "laughing candidly at a funny joke completely relaxed in a sunny backyard",
    "standing near a small local fountain pointing at the water on a summer day",
    "running towards the camera laughing in a sunlit public recreation ground",
    "sitting on the grass eating a small fruit snack during a daytime picnic",
    "posing awkwardly and adorably for a parent taking a quick smartphone picture outside"
];

const catStreetwear = [
    "waiting casually at a normal local bus stop looking at the phone in bright morning sun",
    "walking down a standard city sidewalk carrying a paper coffee cup to go",
    "sitting relaxed on the concrete steps of a busy public plaza in full daylight",
    "standing casually with a backpack waiting on a normal train platform platform",
    "leaning against a brick wall on a completely typical urban street corner",
    "walking energetically across a sunny pedestrian crosswalk in a normal town",
    "checking text messages on a smartphone while walking past storefronts in the sun",
    "sitting on a low municipal wall hanging out with friends on a sunny afternoon",
    "standing casually listening to music with headphones on a bright suburban street",
    "walking out of a local convenience store carrying a small brown paper bag",
    "leaning against a lamppost looking completely relaxed on a sunny day",
    "laughing while talking to a friend on a completely normal residential sidewalk",
    "walking through a sunlit train station concourse acting totally naturally",
    "standing outside a local pizza slice shop casually killing time in the afternoon",
    "drinking a canned soda while walking through a bright neighborhood park",
    "sitting on a park bench casually watching people walk by on a sunny day",
    "waiting at a pedestrian red light looking naturally bored but relaxed",
    "walking past a series of normal parked cars on a sunny suburban road",
    "taking a casual selfie with a friend outside a normal local high school building",
    "standing near a row of public rental bikes on a sunny city sidewalk",
    "walking down a slightly worn but bright urban street holding a skateboard casually",
    "sitting on the outdoor steps of a public library looking relaxed in the sun",
    "waving to a friend across the street while bathed in bright morning sunlight",
    "walking casually past a colorful but ordinary graffiti wall on a sunny afternoon",
    "standing with hands in pockets completely relaxed near a local subway entrance"
];

const catBusiness = [
    "walking briskly out of a perfectly normal 4-story office building on a sunny afternoon",
    "carrying a modest laptop bag while walking to the car in a bright daylight parking lot",
    "ordering a morning espresso at the counter of a typical loud Italian local bar",
    "standing casually checking emails on a smartphone outside a mid-range corporate office",
    "walking across a sunlit town square during a standard lunch break",
    "sitting at a metal table outside a cafe having a professional but relaxed chat",
    "getting out of a completely normal mid-range sedan car on a sunny street",
    "walking down a paved business park sidewalk holding a simple paper folder",
    "standing in a brightly lit normal elevator lobby looking perfectly natural",
    "laughing at a joke with colleagues outside the office entrance in bright sunlight",
    "typing casually on a laptop sitting at a real and slightly messy cafe table",
    "walking with purpose down a standard urban street wearing smart casual clothes",
    "waiting in line at a normal local bakery or sandwich shop during lunch hour",
    "checking a wristwatch while standing near a zebra crossing in daytime",
    "sitting on a low wall near an office park eating a modest packed lunch",
    "walking past generic corporate flags on a sunlit suburban campus path",
    "standing confidently but naturally outside a medium-sized company headquarters",
    "holding a takeaway coffee cup walking towards a completely normal office door",
    "casually chatting on a hands-free phone while strolling in a local park on break",
    "sitting in a completely standard waiting room chair reading a generic brochure",
    "walking across an asphalt parking lot towards an office building entrance in the morning",
    "smiling friendly and extending a hand for a handshake in a bright hallway",
    "carrying a small paper notebook while walking outside in bright clear weather",
    "standing near a city taxi rank looking perfectly normal and approachable",
    "walking casually up the concrete steps of a generic public administration building"
];

export async function GET() {
    const catsAndScenes = [
        { name: "Cerimonia e festa", arr: catCerimonia },
        { name: "Sposi", arr: catSposi },
        { name: "Festa 18°", arr: cat18 },
        { name: "Sport", arr: catSport },
        { name: "Bambini", arr: catBambini },
        { name: "Streetwear", arr: catStreetwear },
        { name: "Business & tempo libero", arr: catBusiness }
    ];
    
    // Purge and rewrite
    for (const item of catsAndScenes) {
        const scenesJson = JSON.stringify(generateScenes(item.arr));
        
        const existing = await (prisma as any).promptTemplate.findFirst({ where: { name: item.name } });
        if (existing) {
             await (prisma as any).promptTemplate.update({
                 where: { id: existing.id },
                 data: { scenes: scenesJson }
             });
        } else {
             await (prisma as any).promptTemplate.create({
                 data: {
                     name: item.name,
                     base_prompt: "UGC relatable authentic smartphone realistic photography",
                     scenes: scenesJson,
                     is_active: true
                 }
             });
        }
    }
    
    return NextResponse.json({ ok: true, msg: "Tutte le 7 categorie riscritte in UGC puro. Zero Fashion." });
}
