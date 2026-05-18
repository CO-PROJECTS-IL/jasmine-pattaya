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
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      if (error) throw error

      return new Response(JSON.stringify({ categories }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'create') {
      const { name_he, name_en, name_th, sort_order } = data as {
        name_he: string
        name_en?: string
        name_th?: string
        sort_order?: number
      }

      if (!name_he) {
        return new Response(JSON.stringify({ error: 'name_he is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert({ name_he, name_en, name_th, sort_order: sort_order ?? 0 })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ category }), {
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

      const { data: category, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ category }), {
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

      const { error } = await supabase.from('categories').delete().eq('id', id)

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
