with open('src/components/ShowcaseCategories.tsx', 'r') as f:
    content = f.read()

# 1. Add Image import
if "import Image from 'next/image'" not in content:
    content = content.replace("import React", "import React from 'react';\nimport Image from 'next/image';", 1)

# 2. Replace 'Coming Soon' with 'Available'
content = content.replace("? 'View AI Example ✨' : 'Coming Soon'", "? 'View AI Example ✨' : 'Available Mode'")

# 3. Fix the parent div for the FIRST BEFORE IMAGE
old_parent_1 = "minWidth: '280px', position: 'relative', borderRadius: '16px', overflow: 'hidden'"
new_parent_1 = "minWidth: '280px', minHeight: '400px', position: 'relative', borderRadius: '16px', overflow: 'hidden'"
content = content.replace(old_parent_1, new_parent_1)

# 4. Replace <img> tags with <Image>
# We have 4 types of img tags in this file.
img_1 = "<img src={exampleData.before[0]} alt=\"Original\" style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />"
next_img_1 = "<Image src={exampleData.before[0]} alt=\"Original\" fill sizes=\"(max-width: 768px) 100vw, 50vw\" style={{ objectFit: 'cover' }} priority />"
content = content.replace(img_1, next_img_1)

img_2 = "<img src={exampleData.afters[0]} alt=\"Result 1\" style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />"
next_img_2 = "<Image src={exampleData.afters[0]} alt=\"Result 1\" fill sizes=\"(max-width: 768px) 100vw, 50vw\" style={{ objectFit: 'cover' }} priority />"
content = content.replace(img_2, next_img_2)

img_3 = "<img src={bImg} alt={`Before ${i+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />"
next_img_3 = "<Image src={bImg} alt={`Before ${i+2}`} fill sizes=\"(max-width: 768px) 50vw, 33vw\" style={{ objectFit: 'cover', opacity: 0.8 }} />"
content = content.replace(img_3, next_img_3)

img_4 = "<img src={aImg} alt={`Result ${i+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />"
next_img_4 = "<Image src={aImg} alt={`Result ${i+2}`} fill sizes=\"(max-width: 768px) 50vw, 33vw\" style={{ objectFit: 'cover' }} />"
content = content.replace(img_4, next_img_4)

with open('src/components/ShowcaseCategories.tsx', 'w') as f:
    f.write(content)

