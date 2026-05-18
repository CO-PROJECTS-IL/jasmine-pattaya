import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingItem {
  friday_menu_id: string
  quantity: number
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
    const { guest_name, phone, num_guests, notes, items } = body as {
      guest_name: string
      phone: string
      num_guests: number
      notes?: string
      items: BookingItem[]
    }

    if (!guest_name || !phone || !num_guests || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'guest_name, phone, num_guests, and items are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch menu item prices
    const menuIds = items.map((i) => i.friday_menu_id)
    const { data: menuItems, error: menuError } = await supabase
      .from('friday_menu')
      .select('id, price, is_available')
      .in('id', menuIds)

    if (menuError) throw menuError

    const menuMap = new Map(menuItems?.map((m) => [m.id, m]) || [])

    // Validate all menu items exist and are available
    for (const item of items) {
      const menuItem = menuMap.get(item.friday_menu_id)
      if (!menuItem) {
        return new Response(
          JSON.stringify({ error: `Menu item ${item.friday_menu_id} not found` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      if (!menuItem.is_available) {
        return new Response(
          JSON.stringify({ error: `Menu item ${item.friday_menu_id} is not available` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Calculate total
    let total = 0
    for (const item of items) {
      const menuItem = menuMap.get(item.friday_menu_id)
      total += menuItem!.price * item.quantity
    }

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('friday_bookings')
      .insert({
        guest_name,
        phone,
        num_guests,
        notes: notes || null,
        total,
        status: 'pending',
      })
      .select('id')
      .single()

    if (bookingError) throw bookingError

    // Insert booking items
    const bookingItems = items.map((item) => ({
      booking_id: booking.id,
      friday_menu_id: item.friday_menu_id,
      quantity: item.quantity,
      unit_price: menuMap.get(item.friday_menu_id)!.price,
    }))

    const { error: itemsError } = await supabase
      .from('friday_booking_items')
      .insert(bookingItems)

    if (itemsError) throw itemsError

    return new Response(JSON.stringify({ booking_id: booking.id, total }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
