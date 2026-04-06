import * as Lucide from 'lucide-react';
const icons = ['Footprints', 'Shirt', 'Coffee', 'GlassWater', 'PartyPopper', 'Cake', 'Crown', 'Ghost', 'Gamepad2', 'Zap', 'Star', 'Gift'];
icons.forEach(i => {
  console.log(i + ": " + (typeof Lucide[i] !== 'undefined'));
});
process.exit(0);
