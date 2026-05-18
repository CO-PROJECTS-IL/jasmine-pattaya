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
        .select('*')
        .order('name')

      if (error) throw error

      return new Response(JSON.stringify({ menuItems }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'upsert-menu') {
      const { id, name, description, price, image_url, is_available } = data as {
        id?: string
        name: string
        description?: string
        price: number
        image_url?: string
        is_available?: boolean
      }

      if (!name || price === undefined) {
        return new Response(JSON.stringify({ error: 'name and price are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const record: Record<string, unknown> = {
        name,
        description,
        price,
        image_url,
        is_available: is_available ?? true,
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
      const { date, reason } = data as { date: string; reason?: string }

      if (!date) {
        return new Response(JSON.stringify({ error: 'date is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('friday_cancelled_dates')
        .upsert({ date, reason }, { onConflict: 'date' })

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'uncancel-date') {
      const { date } = data as { date: string }

      if (!date) {
        return new Response(JSON.stringify({ error: 'date is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('friday_cancelled_dates')
        .delete()
        .eq('date', date)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list-cancelled') {
      const { data: cancelledDates, error } = await supabase
        .from('friday_cancelled_dates')
        .select('*')
        .order('date')

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
