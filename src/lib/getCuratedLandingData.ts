import fs from 'fs';
import path from 'path';

export async function getCuratedLandingData(categorySlug: string) {
    const grouped: Record<string, Record<string, string[]>> = {};
    const baseDir = path.join(process.cwd(), 'public', 'vetrina-landing', categorySlug.toLowerCase());

    if (!fs.existsSync(baseDir)) {
        return grouped;
    }

    try {
        const modes = fs.readdirSync(baseDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

        for (const mode of modes) {
            // Restore special characters for the UI (e.g. "Ads - Scroll Stopper" -> "Ads / Scroll Stopper")
            let uiMode = mode.name;
            if (uiMode.includes(' - ')) {
                uiMode = uiMode.replace(' - ', ' / ');
            }

            if (!grouped[uiMode]) grouped[uiMode] = {};

            const modeDir = path.join(baseDir, mode.name);
            const subs = fs.readdirSync(modeDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

            for (const sub of subs) {
                let uiSub = sub.name;
                if (uiSub.includes(' - ')) {
                    uiSub = uiSub.replace(' - ', ' / ');
                }

                if (!grouped[uiMode][uiSub]) grouped[uiMode][uiSub] = [];

                const subDir = path.join(modeDir, sub.name);
                const items = fs.readdirSync(subDir, { withFileTypes: true });

                for (const item of items) {
                    if (item.name.startsWith('.')) continue;

                    if (item.isDirectory()) {
                        const deepDir = path.join(subDir, item.name);
                        const deepFiles = fs.readdirSync(deepDir);
                        for (const file of deepFiles) {
                            if (!file.match(/\.(jpg|jpeg|png|webp)$/i) || file.startsWith('.')) continue;
                            grouped[uiMode][uiSub].push(`/vetrina-landing/${categorySlug.toLowerCase()}/${mode.name}/${sub.name}/${item.name}/${file}`);
                        }
                    } else if (item.isFile() && item.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        grouped[uiMode][uiSub].push(`/vetrina-landing/${categorySlug.toLowerCase()}/${mode.name}/${sub.name}/${item.name}`);
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error reading landing folders:", e);
    }

    return grouped;
}
