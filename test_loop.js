const strictPoses = [
    "[CLEAN CATALOG 1] Front",
    "[CLEAN CATALOG 2] Back",
    "[CLEAN CATALOG 3] Side"
];
let qty = 1;
let specificShotNumber = 2; // Simulated from payload

for (let i = 0; i < qty; i++) {
    let poseIndex = i;
    if (specificShotNumber) {
        poseIndex = specificShotNumber - 1;
    }
    const currentPose = strictPoses[poseIndex % strictPoses.length];
    let currentShotNumber = specificShotNumber ? specificShotNumber : (i + 1);

    console.log(`Shot Number: ${currentShotNumber}, Pose: ${currentPose}`);
}
