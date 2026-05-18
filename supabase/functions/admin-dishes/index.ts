import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { action, ...data } = body as { action: 'list' | 'create' | 'update' | 'delete'; [key: string]: unknown }

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list') {
      const { data: dishes, error } = await supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name_he,
            name_en,
            name_th,
            sort_order
          )
        `)
        .order('sort_order')

      if (error) throw error

      // Sort by category sort_order then dish sort_order
      const sorted = (dishes || []).sort((a, b) => {
        const aOrder = a.categories?.sort_order ?? 999
        const bOrder = b.categories?.sort_order ?? 999
        if (aOrder !== bOrder) return aOrder - bOrder
        return (a.sort_order ?? 0) - (b.sort_order ?? 0)
      })

      return new Response(JSON.stringify({ dishes: sorted }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'create') {
      const { name_he, name_en, name_th, description_he, description_en, description_th, price, category_id, image_url, is_available, is_kosher, is_spicy, is_vegetarian, sort_order } = data as {
        name_he: string
        name_en?: string
        name_th?: string
        description_he?: string
        description_en?: string
        description_th?: string
        price: number
        category_id?: string
        image_url?: string
        is_available?: boolean
        is_kosher?: boolean
        is_spicy?: boolean
        is_vegetarian?: boolean
        sort_order?: number
      }

      if (!name_he || price === undefined) {
        return new Response(JSON.stringify({ error: 'name_he and price are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: dish, error } = await supabase
        .from('dishes')
        .insert({ name_he, name_en, name_th, description_he, description_en, description_th, price, category_id, image_url, is_available: is_available ?? true, is_kosher, is_spicy, is_vegetarian, sort_order })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ dish }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      const { id, ...updates } = data as { id: string; [key: string]: unknown }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: dish, error } = await supabase
        .from('dishes')
        .update({ ...updates })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ dish }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { id } = data as { id: string }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for delete' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('dishes').delete().eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
