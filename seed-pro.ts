import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedData = {
  "categories": [
    {
      "id": "cat_women",
      "name": "Women",
      "slug": "women",
      "description": "Female fashion image generation categories.",
      "cover_image": "/seed/categories/women-cover.jpg",
      "active": true,
      "sort_order": 1
    },
    {
      "id": "cat_men",
      "name": "Men",
      "slug": "men",
      "description": "Male fashion image generation categories.",
      "cover_image": "/seed/categories/men-cover.jpg",
      "active": true,
      "sort_order": 2
    },
    {
      "id": "cat_product",
      "name": "Product / Generic",
      "slug": "product-generic",
      "description": "Generic product image generation categories without model focus.",
      "cover_image": "/seed/categories/product-cover.jpg",
      "active": true,
      "sort_order": 3
    }
  ],
  "business_modes": [
    {
      "id": "bm_tshirt_brand",
      "category_id": "cat_product",
      "name": "T-Shirt Brand",
      "slug": "tshirt-brand",
      "description": "For ecommerce and social-first t-shirt brands.",
      "cover_image": "/seed/business-modes/tshirt-brand.jpg",
      "default_image_count": 6,
      "active": true,
      "sort_order": 1
    },
    {
      "id": "bm_boutique_women",
      "category_id": "cat_women",
      "name": "Boutique Women",
      "slug": "boutique-women",
      "description": "For women’s boutiques and fashion stores.",
      "cover_image": "/seed/business-modes/boutique-women.jpg",
      "default_image_count": 6,
      "active": true,
      "sort_order": 2
    },
    {
      "id": "bm_ceremony_women",
      "category_id": "cat_women",
      "name": "Ceremony / Elegant Women",
      "slug": "ceremony-elegant-women",
      "description": "Elegant and ceremony-oriented women’s looks.",
      "cover_image": "/seed/business-modes/ceremony-women.jpg",
      "default_image_count": 5,
      "active": true,
      "sort_order": 3
    },
    {
      "id": "bm_footwear_store",
      "category_id": "cat_product",
      "name": "Footwear Store",
      "slug": "footwear-store",
      "description": "For shoe stores and footwear brands.",
      "cover_image": "/seed/business-modes/footwear-store.jpg",
      "default_image_count": 6,
      "active": true,
      "sort_order": 4
    },
    {
      "id": "bm_generic_store",
      "category_id": "cat_product",
      "name": "Generic Store",
      "slug": "generic-store",
      "description": "For mixed physical and online stores.",
      "cover_image": "/seed/business-modes/generic-store.jpg",
      "default_image_count": 6,
      "active": true,
      "sort_order": 5
    },
    {
      "id": "bm_kids_teen",
      "category_id": "cat_women",
      "name": "Kids / Teen Store",
      "slug": "kids-teen-store",
      "description": "For children and teen fashion stores.",
      "cover_image": "/seed/business-modes/kids-teen.jpg",
      "default_image_count": 5,
      "active": true,
      "sort_order": 6
    },
    {
      "id": "bm_ceremony_men",
      "category_id": "cat_men",
      "name": "Ceremony / Elegant Men",
      "slug": "ceremony-elegant-men",
      "description": "For men’s ceremony suits and elegant looks.",
      "cover_image": "/seed/business-modes/ceremony-men.jpg",
      "default_image_count": 5,
      "active": true,
      "sort_order": 7
    }
  ],
  "subcategories": [
    {
      "id": "sub_tshirt_ecommerce_clean",
      "business_mode_id": "bm_tshirt_brand",
      "name": "Ecommerce Clean",
      "slug": "ecommerce-clean",
      "description": "Minimal clean product presentations for online stores.",
      "preview_image": "/seed/subcategories/tshirt-ecommerce-clean.jpg",
      "max_images_allowed": 10,
      "style_type": "clean",
      "output_goal": "ecommerce",
      "business_context": "t-shirt-brand",
      "visual_priority": 1,
      "internal_notes": "Focus on clean product visibility and consistency.",
      "active": true,
      "sort_order": 1
    },
    {
      "id": "sub_tshirt_flat_lay",
      "business_mode_id": "bm_tshirt_brand",
      "name": "Flat Lay",
      "slug": "flat-lay",
      "description": "Top-down product layout for apparel brands.",
      "preview_image": "/seed/subcategories/tshirt-flat-lay.jpg",
      "max_images_allowed": 10,
      "style_type": "flat",
      "output_goal": "catalog",
      "business_context": "t-shirt-brand",
      "visual_priority": 2,
      "internal_notes": "Use clean compositions and table surfaces.",
      "active": true,
      "sort_order": 2
    },
    {
      "id": "sub_tshirt_creator_ugc",
      "business_mode_id": "bm_tshirt_brand",
      "name": "Creator / UGC Style",
      "slug": "creator-ugc-style",
      "description": "Real-life creator content, bedroom, phone, messy aesthetic.",
      "preview_image": "/seed/subcategories/tshirt-ugc.jpg",
      "max_images_allowed": 10,
      "style_type": "ugc",
      "output_goal": "social",
      "business_context": "t-shirt-brand",
      "visual_priority": 3,
      "internal_notes": "Use believable creator-style setups.",
      "active": true,
      "sort_order": 3
    },
    {
      "id": "sub_tshirt_print_detail",
      "business_mode_id": "bm_tshirt_brand",
      "name": "Print Detail",
      "slug": "print-detail",
      "description": "Close-up focus on graphic or print details.",
      "preview_image": "/seed/subcategories/tshirt-print-detail.jpg",
      "max_images_allowed": 10,
      "style_type": "detail",
      "output_goal": "product-detail",
      "business_context": "t-shirt-brand",
      "visual_priority": 4,
      "internal_notes": "Important for design-heavy shirts.",
      "active": true,
      "sort_order": 4
    },
    {
      "id": "sub_boutique_mannequin_display",
      "business_mode_id": "bm_boutique_women",
      "name": "Mannequin Display",
      "slug": "mannequin-display",
      "description": "Women outfits displayed on mannequins inside store.",
      "preview_image": "/seed/subcategories/boutique-mannequin.jpg",
      "max_images_allowed": 10,
      "style_type": "retail",
      "output_goal": "store-display",
      "business_context": "boutique-women",
      "visual_priority": 1,
      "internal_notes": "Useful for physical store presentation.",
      "active": true,
      "sort_order": 1
    },
    {
      "id": "sub_boutique_store_interior",
      "business_mode_id": "bm_boutique_women",
      "name": "Store Interior",
      "slug": "store-interior",
      "description": "Interior boutique shots with curated fashion layout.",
      "preview_image": "/seed/subcategories/boutique-store-interior.jpg",
      "max_images_allowed": 10,
      "style_type": "retail",
      "output_goal": "brand-atmosphere",
      "business_context": "boutique-women",
      "visual_priority": 2,
      "internal_notes": "Must communicate boutique identity.",
      "active": true,
      "sort_order": 2
    },
    {
      "id": "sub_boutique_outfit_coordination",
      "business_mode_id": "bm_boutique_women",
      "name": "Outfit Coordination",
      "slug": "outfit-coordination",
      "description": "Coordinated full looks and styling combinations.",
      "preview_image": "/seed/subcategories/boutique-outfit-coordination.jpg",
      "max_images_allowed": 10,
      "style_type": "styling",
      "output_goal": "inspiration",
      "business_context": "boutique-women",
      "visual_priority": 3,
      "internal_notes": "Full look combinations matter.",
      "active": true,
      "sort_order": 3
    },
    {
      "id": "sub_boutique_rack_presentation",
      "business_mode_id": "bm_boutique_women",
      "name": "Rack Presentation",
      "slug": "rack-presentation",
      "description": "Curated clothing racks and in-store display arrangements.",
      "preview_image": "/seed/subcategories/boutique-rack.jpg",
      "max_images_allowed": 10,
      "style_type": "retail",
      "output_goal": "store-display",
      "business_context": "boutique-women",
      "visual_priority": 4,
      "internal_notes": "Organized visual merchandising.",
      "active": true,
      "sort_order": 4
    },
    {
      "id": "sub_boutique_hero_product",
      "business_mode_id": "bm_boutique_women",
      "name": "Hero Product In Store",
      "slug": "hero-product-in-store",
      "description": "A main product highlighted prominently inside boutique context.",
      "preview_image": "/seed/subcategories/boutique-hero-product.jpg",
      "max_images_allowed": 10,
      "style_type": "hero",
      "output_goal": "featured-product",
      "business_context": "boutique-women",
      "visual_priority": 5,
      "internal_notes": "Highlight the main product in premium store context.",
      "active": true,
      "sort_order": 5
    },
    {
      "id": "sub_ceremony_women_luxury_display",
      "business_mode_id": "bm_ceremony_women",
      "name": "Luxury Display",
      "slug": "luxury-display",
      "description": "Luxury ceremony garments presented in refined contexts.",
      "preview_image": "/seed/subcategories/ceremony-luxury-display.jpg",
      "max_images_allowed": 10,
      "style_type": "luxury",
      "output_goal": "premium-display",
      "business_context": "ceremony-women",
      "visual_priority": 1,
      "internal_notes": "Premium mood and elevated styling required.",
      "active": true,
      "sort_order": 1
    },
    {
      "id": "sub_ceremony_women_dress_spotlight",
      "business_mode_id": "bm_ceremony_women",
      "name": "Dress Spotlight",
      "slug": "dress-spotlight",
      "description": "Single dress highlighted like a hero ceremonial piece.",
      "preview_image": "/seed/subcategories/ceremony-dress-spotlight.jpg",
      "max_images_allowed": 10,
      "style_type": "spotlight",
      "output_goal": "hero-display",
      "business_context": "ceremony-women",
      "visual_priority": 2,
      "internal_notes": "Centered, premium, elegant light.",
      "active": true,
      "sort_order": 2
    },
    {
      "id": "sub_ceremony_women_evening_gown",
      "business_mode_id": "bm_ceremony_women",
      "name": "Evening Gown",
      "slug": "evening-gown",
      "description": "Long formal gowns and premium eveningwear.",
      "preview_image": "/seed/subcategories/ceremony-evening-gown.jpg",
      "max_images_allowed": 10,
      "style_type": "formal",
      "output_goal": "ceremony",
      "business_context": "ceremony-women",
      "visual_priority": 3,
      "internal_notes": "Elegant silhouettes and luxury environments.",
      "active": true,
      "sort_order": 3
    },
    {
      "id": "sub_ceremony_women_detail_fabric",
      "business_mode_id": "bm_ceremony_women",
      "name": "Detail Fabric",
      "slug": "detail-fabric",
      "description": "Close-up detail shots of luxury fabrics and embellishments.",
      "preview_image": "/seed/subcategories/ceremony-detail-fabric.jpg",
      "max_images_allowed": 10,
      "style_type": "detail",
      "output_goal": "material-showcase",
      "business_context": "ceremony-women",
      "visual_priority": 4,
      "internal_notes": "Useful for perceived value and craftsmanship.",
      "active": true,
      "sort_order": 4
    },
    {
      "id": "sub_ceremony_men_suit_hanging",
      "business_mode_id": "bm_ceremony_men",
      "name": "Suit Hanging Display",
      "slug": "suit-hanging-display",
      "description": "Elegant men’s suits displayed hanging in premium wardrobe setups.",
      "preview_image": "/seed/subcategories/men-suit-hanging.jpg",
      "max_images_allowed": 10,
      "style_type": "retail-luxury",
      "output_goal": "product-display",
      "business_context": "ceremony-men",
      "visual_priority": 1,
      "internal_notes": "High-end tailoring store atmosphere.",
      "active": true,
      "sort_order": 1
    },
    {
      "id": "sub_ceremony_men_wardrobe_presentation",
      "business_mode_id": "bm_ceremony_men",
      "name": "Wardrobe Presentation",
      "slug": "wardrobe-presentation",
      "description": "Full suit arrangement inside elegant wardrobe or tailoring displays.",
      "preview_image": "/seed/subcategories/men-wardrobe-presentation.jpg",
      "max_images_allowed": 10,
      "style_type": "luxury",
      "output_goal": "full-look-display",
      "business_context": "ceremony-men",
      "visual_priority": 2,
      "internal_notes": "Should feel premium and highly organized.",
      "active": true,
      "sort_order": 2
    },
    {
      "id": "sub_footwear_clean_product",
      "business_mode_id": "bm_footwear_store",
      "name": "Product Clean",
      "slug": "product-clean",
      "description": "Clean product images for shoes and footwear.",
      "preview_image": "/seed/subcategories/footwear-product-clean.jpg",
      "max_images_allowed": 10,
      "style_type": "clean",
      "output_goal": "ecommerce",
      "business_context": "footwear-store",
      "visual_priority": 1,
      "internal_notes": "Prioritize product visibility and shape.",
      "active": true,
      "sort_order": 1
    },
    {
      "id": "sub_footwear_on_feet",
      "business_mode_id": "bm_footwear_store",
      "name": "On Feet",
      "slug": "on-feet",
      "description": "Shoes worn in real-life or studio-like conditions.",
      "preview_image": "/seed/subcategories/footwear-on-feet.jpg",
      "max_images_allowed": 10,
      "style_type": "lifestyle",
      "output_goal": "fit-visualization",
      "business_context": "footwear-store",
      "visual_priority": 2,
      "internal_notes": "Important to show scale and wearability.",
      "active": true,
      "sort_order": 2
    },
    {
      "id": "sub_generic_flat_lay",
      "business_mode_id": "bm_generic_store",
      "name": "Flat Lay Product",
      "slug": "flat-lay-product",
      "description": "Generic product arranged in top-down layout.",
      "preview_image": "/seed/subcategories/generic-flat-lay.jpg",
      "max_images_allowed": 10,
      "style_type": "flat",
      "output_goal": "catalog",
      "business_context": "generic-store",
      "visual_priority": 1,
      "internal_notes": "Works for mixed apparel products.",
      "active": true,
      "sort_order": 1
    }
  ],
  "reference_images": [
    {
      "id": "ref_boutique_mannequin_1",
      "subcategory_id": "sub_boutique_mannequin_display",
      "image_url": "/seed/references/boutique-mannequin-1.jpg",
      "title": "Boutique mannequin display front view",
      "caption": "Elegant outfit displayed on mannequin inside boutique.",
      "sort_order": 1,
      "active": true
    },
    {
      "id": "ref_boutique_store_1",
      "subcategory_id": "sub_boutique_store_interior",
      "image_url": "/seed/references/boutique-store-1.jpg",
      "title": "Boutique store interior",
      "caption": "Warm store environment with curated clothing presentation.",
      "sort_order": 1,
      "active": true
    },
    {
      "id": "ref_ceremony_women_1",
      "subcategory_id": "sub_ceremony_women_dress_spotlight",
      "image_url": "/seed/references/ceremony-dress-spotlight-1.jpg",
      "title": "Dress spotlight display",
      "caption": "Single ceremonial dress highlighted in premium boutique setting.",
      "sort_order": 1,
      "active": true
    },
    {
      "id": "ref_ceremony_men_1",
      "subcategory_id": "sub_ceremony_men_suit_hanging",
      "image_url": "/seed/references/men-suit-hanging-1.jpg",
      "title": "Men suit hanging display",
      "caption": "Formal men’s suit hanging in luxury wardrobe.",
      "sort_order": 1,
      "active": true
    },
    {
      "id": "ref_tshirt_ugc_1",
      "subcategory_id": "sub_tshirt_creator_ugc",
      "image_url": "/seed/references/tshirt-ugc-1.jpg",
      "title": "UGC bedroom creator shot",
      "caption": "Realistic creator-style t-shirt content in bedroom environment.",
      "sort_order": 1,
      "active": true
    },
    {
      "id": "ref_tshirt_flatlay_1",
      "subcategory_id": "sub_tshirt_flat_lay",
      "image_url": "/seed/references/tshirt-flatlay-1.jpg",
      "title": "Flat lay wooden table",
      "caption": "T-shirt laid out on rustic table surface.",
      "sort_order": 1,
      "active": true
    }
  ],
  "expected_output_checks": [
    {
      "id": "check_001",
      "subcategory_id": "sub_boutique_mannequin_display",
      "reference_image_id": "ref_boutique_mannequin_1",
      "generated_sample_image": "/seed/generated-checks/boutique-mannequin-generated-1.jpg",
      "comparison_status": "match",
      "review_notes": "Output is visually consistent with expected mannequin boutique display.",
      "last_checked_at": "2026-04-14T07:00:00Z"
    },
    {
      "id": "check_002",
      "subcategory_id": "sub_tshirt_creator_ugc",
      "reference_image_id": "ref_tshirt_ugc_1",
      "generated_sample_image": "/seed/generated-checks/tshirt-ugc-generated-1.jpg",
      "comparison_status": "partial",
      "review_notes": "Good room context, but needs more authentic handheld composition.",
      "last_checked_at": "2026-04-14T07:00:00Z"
    },
    {
      "id": "check_003",
      "subcategory_id": "sub_ceremony_men_suit_hanging",
      "reference_image_id": "ref_ceremony_men_1",
      "generated_sample_image": "/seed/generated-checks/men-suit-generated-1.jpg",
      "comparison_status": "incorrect",
      "review_notes": "Suit display is too generic and lacks premium wardrobe styling.",
      "last_checked_at": "2026-04-14T07:00:00Z"
    }
  ]
};

async function seed() {
  const adminId = "admin-user-id";
  
  // Assicuriamo l'utente
  let user = await prisma.user.findUnique({ where: { id: adminId } });
  if (!user) {
    user = await prisma.user.create({ data: { id: adminId, email: "admin@local.test", role: "admin" } });
  }

  // Categorie
  for (const cat of seedData.categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      create: { 
          id: cat.id, 
          user_id: adminId, 
          name: cat.name, 
          slug: cat.slug, 
          description: cat.description, 
          cover_image: cat.cover_image, 
          is_active: cat.active, 
          sort_order: cat.sort_order 
      },
      update: {}
    });
  }

  // Business Modes
  for (const bm of seedData.business_modes) {
    await prisma.businessMode.upsert({
      where: { id: bm.id },
      create: { 
          id: bm.id, 
          category_id: bm.category_id, 
          name: bm.name, 
          slug: bm.slug, 
          description: bm.description, 
          cover_image: bm.cover_image, 
          default_image_count: bm.default_image_count, 
          is_active: bm.active, 
          sort_order: bm.sort_order 
      },
      update: {}
    });
  }

  // Subcategories
  for (const sub of seedData.subcategories) {
    await prisma.subcategory.upsert({
      where: { id: sub.id },
      create: {
        id: sub.id,
        business_mode_id: sub.business_mode_id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        preview_image: sub.preview_image,
        max_images_allowed: sub.max_images_allowed,
        style_type: sub.style_type,
        output_goal: sub.output_goal,
        business_context: sub.business_context,
        visual_priority: sub.visual_priority,
        internal_notes: sub.internal_notes,
        is_active: sub.active,
        sort_order: sub.sort_order
      },
      update: {}
    });
  }

  // Reference Images
  for (const ref of seedData.reference_images) {
    await prisma.subcategoryReferenceImage.upsert({
      where: { id: ref.id },
      create: {
        id: ref.id,
        subcategory_id: ref.subcategory_id,
        image_url: ref.image_url,
        title: ref.title,
        caption: ref.caption,
        image_order: ref.sort_order,
        is_active: ref.active
      },
      update: {}
    });
  }

  // Checks
  for (const check of seedData.expected_output_checks) {
    // Troviamo l'URL originale
    const refImg = seedData.reference_images.find(r => r.id === check.reference_image_id);
    await prisma.outputValidationCheck.upsert({
      where: { id: check.id },
      create: {
        id: check.id,
        subcategory_id: check.subcategory_id,
        reference_image_url: refImg ? refImg.image_url : '',
        generated_sample_image: check.generated_sample_image,
        comparison_status: check.comparison_status,
        review_notes: check.review_notes,
        last_checked_at: new Date(check.last_checked_at)
      },
      update: {}
    });
  }

  console.log("Database ripopolato con successo con i Dati di Test PRO.");
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
