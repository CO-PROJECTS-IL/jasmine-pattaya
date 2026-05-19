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
    const { action, ...data } = body as { action: string; [key: string]: unknown }

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // List all special menus with item count
    if (action === 'list') {
      const { data: menus, error } = await supabase
        .from('special_menus')
        .select('*, items:special_menu_items(count)')
        .order('sort_order')

      if (error) throw error

      return new Response(JSON.stringify({ menus }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a special menu
    if (action === 'create') {
      const { name_he, name_en, name_th, schedule_type, day_of_week, specific_date, switch_time, max_guests } = data as {
        name_he: string
        name_en?: string
        name_th?: string
        schedule_type: 'recurring' | 'specific_date'
        day_of_week?: number
        specific_date?: string
        switch_time?: string
        max_guests?: number
      }

      if (!name_he || !schedule_type) {
        return new Response(JSON.stringify({ error: 'name_he and schedule_type are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const record: Record<string, unknown> = {
        name_he,
        name_en: name_en || '',
        name_th: name_th || '',
        schedule_type,
        switch_time: switch_time || '14:00',
      }

      if (schedule_type === 'recurring' && day_of_week !== undefined) {
        record.day_of_week = day_of_week
      }
      if (schedule_type === 'specific_date' && specific_date) {
        record.specific_date = specific_date
      }
      if (max_guests !== undefined) record.max_guests = max_guests

      const { data: menu, error } = await supabase
        .from('special_menus')
        .insert(record)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ menu }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update a special menu
    if (action === 'update') {
      const { id, ...updates } = data as { id: string; [key: string]: unknown }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const allowed = ['name_he', 'name_en', 'name_th', 'schedule_type', 'day_of_week', 'specific_date', 'switch_time', 'max_guests', 'is_enabled', 'sort_order']
      const record: Record<string, unknown> = {}
      for (const key of allowed) {
        if (updates[key] !== undefined) record[key] = updates[key]
      }

      const { data: menu, error } = await supabase
        .from('special_menus')
        .update(record)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ menu }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete a special menu
    if (action === 'delete') {
      const { id } = data as { id: string }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('special_menus').delete().eq('id', id)
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // List items for a specific menu
    if (action === 'list-items') {
      const { special_menu_id } = data as { special_menu_id: string }

      if (!special_menu_id) {
        return new Response(JSON.stringify({ error: 'special_menu_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: items, error } = await supabase
        .from('special_menu_items')
        .select('*, dish:dishes(*)')
        .eq('special_menu_id', special_menu_id)
        .order('sort_order')

      if (error) throw error

      return new Response(JSON.stringify({ items }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Add/update item in a special menu
    if (action === 'upsert-item') {
      const { id, special_menu_id, dish_id, override_price, sort_order, is_active } = data as {
        id?: string
        special_menu_id: string
        dish_id: string
        override_price?: number
        sort_order?: number
        is_active?: boolean
      }

      if (!special_menu_id || !dish_id) {
        return new Response(JSON.stringify({ error: 'special_menu_id and dish_id are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const record: Record<string, unknown> = {
        special_menu_id,
        dish_id,
        sort_order: sort_order ?? 0,
        is_active: is_active ?? true,
      }

      if (override_price !== undefined && override_price !== null) {
        record.override_price = override_price
      }

      if (id) record.id = id

      const { data: item, error } = await supabase
        .from('special_menu_items')
        .upsert(record, { onConflict: 'special_menu_id,dish_id' })
        .select('*, dish:dishes(*)')
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ item }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Remove item from a special menu
    if (action === 'delete-item') {
      const { id } = data as { id: string }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('special_menu_items').delete().eq('id', id)
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cancel a date for a recurring menu
    if (action === 'cancel-date') {
      const { special_menu_id, cancelled_date, reason } = data as {
        special_menu_id: string
        cancelled_date: string
        reason?: string
      }

      if (!special_menu_id || !cancelled_date) {
        return new Response(JSON.stringify({ error: 'special_menu_id and cancelled_date are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('special_menu_cancelled_dates')
        .upsert({ special_menu_id, cancelled_date, reason: reason || '' }, { onConflict: 'special_menu_id,cancelled_date' })

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Uncancel a date
    if (action === 'uncancel-date') {
      const { special_menu_id, cancelled_date } = data as { special_menu_id: string; cancelled_date: string }

      if (!special_menu_id || !cancelled_date) {
        return new Response(JSON.stringify({ error: 'special_menu_id and cancelled_date are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('special_menu_cancelled_dates')
        .delete()
        .eq('special_menu_id', special_menu_id)
        .eq('cancelled_date', cancelled_date)

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
