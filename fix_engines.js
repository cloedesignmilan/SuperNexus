const fs = require('fs');
const path = require('path');

const enginesDir = path.join(__dirname, 'src', 'lib', 'ai', 'engines');
const generateTsPath = path.join(__dirname, 'src', 'lib', 'ai', 'generate.ts');

const engineFiles = fs.readdirSync(enginesDir).filter(f => f.endsWith('.ts')).map(f => path.join(enginesDir, f));
engineFiles.push(generateTsPath);

engineFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Fix 1: Strict Reference Clone Block
    // Find: currentShotNumber = i + 1; (inside Strict Reference Clone)
    // Replace with: currentShotNumber = specificShotNumber ? specificShotNumber : (i + 1);
    content = content.replace(/currentShotName\s*=\s*"Strict Reference Clone";\s*currentShotNumber\s*=\s*i\s*\+\s*1;/g, 
        `currentShotName = "Strict Reference Clone";\n            currentShotNumber = specificShotNumber ? specificShotNumber : (i + 1);`);

    content = content.replace(/STRICT REFERENCE CLONE MODE ACTIVATED: Generazione nr\. \$\{i\+1\}/g, 
        `STRICT REFERENCE CLONE MODE ACTIVATED: Generazione nr. \${currentShotNumber}`);

    // Fix 2: Dynamic Scene Fallback Block
    // Find: currentShotName = "Dynamic Scene"; currentShotNumber = i + 1;
    // Replace with: currentShotName = "Dynamic Scene"; currentShotNumber = specificShotNumber ? specificShotNumber : (i + 1);
    content = content.replace(/currentShotName\s*=\s*"Dynamic Scene";\s*currentShotNumber\s*=\s*i\s*\+\s*1;/g, 
        `currentShotName = "Dynamic Scene";\n            currentShotNumber = specificShotNumber ? specificShotNumber : (i + 1);`);

    // Fix 3: Pose Index in Fallback Block
    // Find: const currentPose = strictPoses[i % strictPoses.length];
    // Replace with: let poseIndex = i; if (specificShotNumber) poseIndex = specificShotNumber - 1; const currentPose = strictPoses[poseIndex % strictPoses.length];
    content = content.replace(/const currentPose\s*=\s*strictPoses\[i\s*%\s*strictPoses\.length\];/g, 
        `let poseIndex = i;\n            if (specificShotNumber) poseIndex = specificShotNumber - 1;\n            const currentPose = strictPoses[poseIndex % strictPoses.length];`);

    // Fix 4: Seed text uses currentShotNumber instead of i+1
    content = content.replace(/SEED\/VARIANTE: Generazione nr\. \$\{i\+1\}/g, 
        `SEED/VARIANTE: Generazione nr. \${currentShotNumber}`);

    fs.writeFileSync(file, content);
    console.log(`Updated ${path.basename(file)}`);
});
