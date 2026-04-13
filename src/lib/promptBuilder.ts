export function buildCreatorPrompt(
  inspectorData: any,
  categoryName: string,
  modifiers: { gender?: string, bottomType?: string | null, customBrand?: string | null, cameraAngle?: string, pose?: string, lighting?: string },
  dbMasterPrompt: string,
  dbSceneText: string,
  dbNegativeRules: string,
  brandRule: string,
  negativeBrandRule: string
) {
  const blocks: string[] = [];

  // 1. MASTER PROMPT
  blocks.push(dbMasterPrompt || "You are a world-class professional commercial photographer. Create a hyper-realistic, 8k resolution, ultra-detailed fashion editorial photo.");

  // 1.1 PHOTOGRAPHIC EQUIPMENT DIRECTIVE
  blocks.push("PHOTOGRAPHY DIRECTIVE: This must look exactly like a genuine high-end professional commercial photoshoot. Emulate professional full-frame camera aesthetics (e.g., Hasselblad, Sony A7R IV, Canon EOS R5) paired with premium lenses tailored to the shot type (e.g., 85mm f/1.4 for portraits/fashion, 50mm f/1.2 for lifestyle, 100mm macro for extreme footwear details). Perfectly execute depth of field, crisp focus, hyper-realistic textures, and flawless studio or cinematic outdoor lighting setups.");

  // 1.2 COMMERCIAL SALES DIRECTIVE
  blocks.push("COMMERCIAL E-COMMERCE DIRECTIVE: The primary goal of this image is TO SELL THE PRODUCT. The absolute maximum focus, extreme crispness, and photographic emphasis MUST be placed on the exact details, shape, color, and textile quality of the main garment. Do not let backgrounds or accessories steal the focus. Flawless presentation of the product is your ultimate priority.");

  // 2. SCENARIO / ENVIRONMENT PROMPT
  blocks.push(`ENVIRONMENT & SCENE:\n${dbSceneText}`);
  if (modifiers.cameraAngle) blocks.push(`CAMERA ANGLE: ${modifiers.cameraAngle}`);

  // 3. PRESERVATION RULES (Il Cuore)
  let preservation = "STRICT GARMENT PRESERVATION RULES (1:1 CLONE):\nYou must IDENTICALLY CLONE the garment/item from the reference image, preserving exact shape, seams, cut, proportions and details.\n";
  const cons = inspectorData?.preservation_constraints || {};
  const cdetails = cons.critical_details || inspectorData?.legacy_creator_data?.short_description || "Follow original item closely";
  const mcolor = cons.main_color || inspectorData?.legacy_creator_data?.color;
  
  preservation += `- Critical Blueprint: ${cdetails}\n`;
  if (mcolor) preservation += `- Main Color: ${mcolor}\n`;
  if (cons.fabric) preservation += `- Fabric/Material: ${cons.fabric}\n`;
  if (cons.fit) preservation += `- Fit: ${cons.fit}\n`;
  if (cons.neckline) preservation += `- Neckline: ${cons.neckline}\n`;
  if (cons.closure_type) preservation += `- Closure: ${cons.closure_type}\n`;
  if (cons.lapel_style) preservation += `- Collar/Lapel Style: ${cons.lapel_style}\n`;
  if (cons.pattern) preservation += `- Pattern: ${cons.pattern}\n`;
  blocks.push(preservation);

  // 4. STYLE / CATEGORY FOCUS
  blocks.push(`CATEGORY FOCUS: ${categoryName}`);

  // 5. MODIFIERS (Humans & Details)
  const isShoes = categoryName.toLowerCase().includes("scarpe") || categoryName.toLowerCase().includes("calzature");
  
  let mods = "SPECIFIC MODIFIERS:\n";
  if (isShoes) {
     mods += `- STRICT NEGATIVE: No humans, no legs, no feet unless naturally implied by the composition. If lifestyle, keep extremely minimal.\n`;
  } else {
     mods += `- Model Description: An attractive ${modifiers.gender || 'model'} ${modifiers.pose ? modifiers.pose : 'posing naturally'}.\n`;
  }
  if (modifiers.bottomType) mods += `- Paired Bottom: ${modifiers.bottomType} (keep it matching, elegant and neutral, do not let it steal focus from the main garment)\n`;
  
  if (modifiers.lighting) {
     mods += `- Lighting & Atmosphere: ${modifiers.lighting}\n`;
  }
  
  blocks.push(mods);

  // 6. BRAND RULES
  if (brandRule) blocks.push(brandRule);

  // 7. NEGATIVE RULES
  blocks.push(`AVOID: ${dbNegativeRules} ${negativeBrandRule}`);

  return blocks.filter(b => b.trim() !== "").join("\n\n---\n\n");
}
