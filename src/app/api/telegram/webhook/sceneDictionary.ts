export const SCENE_DICTIONARY = {
    wedding: [
        ", standing gracefully inside an ancient gothic church with stained glass windows illuminating the dress",
        ", sitting elegantly in the leather backseat of a vintage luxury car, candid aesthetic",
        ", laughing naturally with guests at a luxury wedding reception garden party, soft golden hour lighting",
        ", walking out of a floral decorated beautiful stone archway, sunrays illuminating the veil, candid movement",
        ", standing on a luxurious marble balcony overlooking a romantic italian lake, cinematic lighting",
        ", adjusting her dress in a bridal suite with massive floor-to-ceiling windows, natural soft daylight"
    ],
    streetwear: [
        ", walking confidently down a neon-lit Tokyo street at night, cyberpunk aesthetic lighting, candid street photography",
        ", leaning against a graffiti wall in Brooklyn, overcast cloudy natural light, casual unstructured pose",
        ", waiting at a metropolitan subway station, motion blur of a passing train in the background, cinematic 35mm photography",
        ", crossing a busy New York intersection holding a coffee to-go, golden hour sunlight reflecting off skyscrapers, hyperrealistic",
        ", sitting on the trunk of a sports car in a neon lit parking lot at night, flash photography style"
    ],
    evening: [
        ", standing on a massive rooftop terrace overlooking a glowing city skyline at midnight, elegant gala lighting",
        ", walking down a red carpet bordered by velvet ropes, paparazzi flash lighting mimicking a celebrity event",
        ", sipping champagne at an exclusive high-end luxury cocktail bar, warm amber lighting, cinematic depth of field",
        ", descending an opulent grand staircase in a classical European palace, elegant warm chandelier lighting"
    ],
    casual: [
        ", sitting at a minimal outdoor Parisian cafe table with an espresso, soft morning sunlight, candid relaxed pose",
        ", walking through a sunlit lush green city park, trees casting natural leaf shadows on the clothing, 35mm film aesthetic",
        ", browsing a vintage record store, warm indoor tungsten lighting, looking away from camera, highly realistic",
        ", standing in an airy modern minimalist loft apartment, massive windows casting soft natural daylight"
    ],
    swimwear: [
        ", walking out of the crystal clear turquoise water of a Maldives beach, bright tropical sunlight, hyperrealistic skin texture",
        ", laying elegantly on a luxury wooden yacht deck sailing in the Mediterranean, golden hour sunset lighting",
        ", standing next to a stunning infinity pool overlooking a tropical jungle, soft morning light",
        ", walking barefoot on white sand dunes, cinematic lens flare from the setting sun"
    ],
    default: [
        ", shot in a minimalist high-end professional photography studio, soft cinematic rim lighting, grey neutral background perfectly illuminating the fabric",
        ", walking down a minimal modern hallway with concrete walls, harsh sunlight casting geometric shadows, editorial fashion photography",
        ", candid editorial portrait, natural unstructured pose, sharp focus, 85mm lens, hyperrealistic human skin"
    ]
};

// Helper per identificare la categoria giusta in base al nome o slug
export function getRandomSceneForSubcategory(slugOrName: string): string {
    const text = slugOrName.toLowerCase();
    
    let categoryKey: keyof typeof SCENE_DICTIONARY = 'default';

    if (text.includes('sposa') || text.includes('matrimonio') || text.includes('wedding') || text.includes('cerimonia')) {
        categoryKey = 'wedding';
    } else if (text.includes('street') || text.includes('urban') || text.includes('hip')) {
        categoryKey = 'streetwear';
    } else if (text.includes('sera') || text.includes('gala') || text.includes('elegant') || text.includes('evening')) {
        categoryKey = 'evening';
    } else if (text.includes('casual') || text.includes('giorno') || text.includes('day') || text.includes('jeans')) {
        categoryKey = 'casual';
    } else if (text.includes('mare') || text.includes('bagno') || text.includes('swim') || text.includes('bikini')) {
        categoryKey = 'swimwear';
    }

    const scenes = SCENE_DICTIONARY[categoryKey];
    const randomIndex = Math.floor(Math.random() * scenes.length);
    return scenes[randomIndex];
}
