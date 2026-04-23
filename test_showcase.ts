import { getShowcaseData } from './src/lib/getShowcaseData.ts';

async function test() {
  const data = await getShowcaseData();
  const swimwear = data.find(d => d.id === 'swimwear-e-commerce-clean');
  console.log(JSON.stringify(swimwear, null, 2));
}

test();
