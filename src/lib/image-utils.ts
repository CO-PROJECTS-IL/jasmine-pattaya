const CLOUD_NAME = 'drfbiuokx'

export function enhanceDishImage(url: string, width = 600): string {
  if (!url) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_${width},c_fill,q_auto,f_auto,e_improve,e_vibrance:25,e_sharpen:60/${encodeURIComponent(url)}`
}

export function categoryThumbnail(url: string): string {
  if (!url) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_120,h_120,c_fill,g_center,q_auto,f_auto,e_improve,e_vibrance:30/${encodeURIComponent(url)}`
}

const CATEGORY_IMAGES: Record<string, string> = {
  'עיקריות': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&auto=format&fit=crop',
  'ארוחת ילדים': 'https://images.unsplash.com/photo-1530554764233-e79e16171571?w=400&auto=format&fit=crop',
  'סט סלטים': 'https://images.unsplash.com/photo-1505714197102-6ae95091ed70?w=400&auto=format&fit=crop',
  'סלטים': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
  'שישי שבת שמח': 'https://images.unsplash.com/photo-1608932586266-c627cb9e5e9d?w=400&auto=format&fit=crop',
  'ארוחת בוקר': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop',
  'ארוחת צוהריים': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop',
  'חומוס הבית': 'https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?w=400&auto=format&fit=crop',
  'אוכל תמני': 'https://images.unsplash.com/photo-1514843319620-4f042827c481?w=400&auto=format&fit=crop',
  'מגולגל בלאפה': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&auto=format&fit=crop',
  'סלט': 'https://images.unsplash.com/photo-1594470603337-2e8778fda2be?w=400&auto=format&fit=crop',
  'באגטים': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&auto=format&fit=crop',
  'תוספות': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop',
  'שתיה': 'https://images.unsplash.com/photo-1500630967344-3b1f546423ce?w=400&auto=format&fit=crop',
  'שייקים': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&auto=format&fit=crop',
}

export function getCategoryImage(nameHe: string): string {
  const url = CATEGORY_IMAGES[nameHe]
  if (!url) return ''
  return categoryThumbnail(url)
}
