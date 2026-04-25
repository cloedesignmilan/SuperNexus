'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSnippet(formData: FormData) {
  try {
    const data = {
      snippet_type: formData.get('snippet_type') as string,
      label: formData.get('label') as string,
      description: formData.get('description') as string || null,
      icon: formData.get('icon') as string || null,
      visual_style: formData.get('visual_style') as string || null,
      prompt_fragment: formData.get('prompt_fragment') as string || null,
      negative_fragment: formData.get('negative_fragment') as string || null,
      priority_order: parseInt(formData.get('priority_order') as string || '0', 10),
      sort_group: formData.get('sort_group') as string || 'Recommended',
      intensity_level: formData.get('intensity_level') as string || 'medium',
      is_recommended: formData.get('is_recommended') === 'true',
      is_active: true,
      admin_notes: formData.get('admin_notes') as string || null,
    }

    await prisma.promptSnippet.create({ data })
    revalidatePath('/admin/snippets')
    return { success: true }
  } catch (error: any) {
    console.error("Create Snippet Error:", error)
    return { error: error.message }
  }
}

export async function updateSnippet(id: string, formData: FormData) {
  try {
    const data = {
      snippet_type: formData.get('snippet_type') as string,
      label: formData.get('label') as string,
      description: formData.get('description') as string || null,
      icon: formData.get('icon') as string || null,
      visual_style: formData.get('visual_style') as string || null,
      prompt_fragment: formData.get('prompt_fragment') as string || null,
      negative_fragment: formData.get('negative_fragment') as string || null,
      priority_order: parseInt(formData.get('priority_order') as string || '0', 10),
      sort_group: formData.get('sort_group') as string || 'Recommended',
      intensity_level: formData.get('intensity_level') as string || 'medium',
      is_recommended: formData.get('is_recommended') === 'true',
      admin_notes: formData.get('admin_notes') as string || null,
    }

    await prisma.promptSnippet.update({ where: { id }, data })
    revalidatePath('/admin/snippets')
    return { success: true }
  } catch (error: any) {
    console.error("Update Snippet Error:", error)
    return { error: error.message }
  }
}

export async function toggleSnippetStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.promptSnippet.update({
      where: { id },
      data: { is_active: !currentStatus }
    })
    revalidatePath('/admin/snippets')
  } catch (error) {
    console.error("Toggle Status Error:", error)
  }
}

export async function deleteSnippet(id: string) {
  try {
    await prisma.promptSnippet.delete({ where: { id } })
    revalidatePath('/admin/snippets')
  } catch (error) {
    console.error("Delete Snippet Error:", error)
  }
}
