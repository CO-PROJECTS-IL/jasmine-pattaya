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
    const { action, ...data } = body as {
      action:
        | 'list-menu'
        | 'upsert-menu'
        | 'delete-menu-item'
        | 'cancel-date'
        | 'uncancel-date'
        | 'list-cancelled'
      [key: string]: unknown
    }

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list-menu') {
      const { data: menuItems, error } = await supabase
        .from('friday_menu')
        .select(`
          *,
          dishes (
            id,
            name_he,
            name_en,
            name_th,
            image_url
          )
        `)
        .order('sort_order')

      if (error) throw error

      return new Response(JSON.stringify({ menuItems }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'upsert-menu') {
      const { id, dish_id, friday_price, sort_order, is_active } = data as {
        id?: string
        dish_id: string
        friday_price: number
        sort_order?: number
        is_active?: boolean
      }

      if (!dish_id || friday_price === undefined) {
        return new Response(JSON.stringify({ error: 'dish_id and friday_price are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const record: Record<string, unknown> = {
        dish_id,
        friday_price,
        sort_order: sort_order ?? 0,
        is_active: is_active ?? true,
      }

      if (id) record.id = id

      const { data: menuItem, error } = await supabase
        .from('friday_menu')
        .upsert(record)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ menuItem }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete-menu-item') {
      const { id } = data as { id: string }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('friday_menu').delete().eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'cancel-date') {
      const { friday_date, reason } = data as { friday_date: string; reason?: string }

      if (!friday_date) {
        return new Response(JSON.stringify({ error: 'friday_date is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('friday_cancelled_dates')
        .upsert({ friday_date, reason }, { onConflict: 'friday_date' })

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'uncancel-date') {
      const { friday_date } = data as { friday_date: string }

      if (!friday_date) {
        return new Response(JSON.stringify({ error: 'friday_date is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('friday_cancelled_dates')
        .delete()
        .eq('friday_date', friday_date)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list-cancelled') {
      const { data: cancelledDates, error } = await supabase
        .from('friday_cancelled_dates')
        .select('*')
        .order('friday_date')

      if (error) throw error

      return new Response(JSON.stringify({ cancelledDates }), {
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
