require('dotenv').config();
const { generateSwimwearImages } = require('./src/lib/ai/engines/swimwearEngine');

async function test() {
    const aiParams = {
        qty: 1,
        subcat: {
            business_mode: {
                category: { slug: 'swimwear' },
                slug: 'clean-catalog'
            },
            slug: 'no-model'
        },
        publicUrls: ["https://picsum.photos/200"], // dummy image
        userClarification: "Aspect Ratio: 3:4",
        isOutfit: false,
        varianceEnabled: false,
        generationModel: "gemini-1.5-pro", // use a model that definitely works to test if it's the prompt
        taxonomyCat: "swimwear",
        taxonomyMode: "clean-catalog",
        taxonomySubcat: "no-model",
        specificShotNumber: null,
        clientGender: "WOMAN",
        detectedProductType: "swimwear",
        aspectRatio: "3:4",
        printLocation: undefined,
        imageBackUrl: undefined,
        productColors: []
    };

    try {
        console.log("Calling generateSwimwearImages...");
        const result = await generateSwimwearImages(aiParams);
        console.log("Success!", result.generatedBase64s.length);
        if (result.errorMessages.length > 0) {
            console.log("Errors:", result.errorMessages);
        }
    } catch(e) {
        console.log("Crash:", e.message);
    }
}
test();
