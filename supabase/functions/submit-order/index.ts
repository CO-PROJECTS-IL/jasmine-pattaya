import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  dish_id: string
  quantity: number
  notes?: string
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
    const { table_number, items, notes, created_by } = body as {
      table_number: number
      items: OrderItem[]
      notes?: string
      created_by: 'customer' | 'employee'
    }

    if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'table_number and items are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate table_number against settings
    const { data: settings } = await supabase
      .from('settings')
      .select('table_count')
      .eq('id', 1)
      .single()

    if (settings && (table_number < 1 || table_number > settings.table_count)) {
      return new Response(
        JSON.stringify({ error: `table_number must be between 1 and ${settings.table_count}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch dish prices for all items
    const dishIds = items.map((i) => i.dish_id)
    const { data: dishes, error: dishError } = await supabase
      .from('dishes')
      .select('id, price, is_available')
      .in('id', dishIds)

    if (dishError) throw dishError

    const dishMap = new Map(dishes?.map((d) => [d.id, d]) || [])

    // Validate all dishes exist and are available
    for (const item of items) {
      const dish = dishMap.get(item.dish_id)
      if (!dish) {
        return new Response(JSON.stringify({ error: `Dish ${item.dish_id} not found` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!dish.is_available) {
        return new Response(
          JSON.stringify({ error: `Dish ${item.dish_id} is not available` }),
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
      const dish = dishMap.get(item.dish_id)
      total += dish!.price * item.quantity
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_number,
        total,
        notes: notes || '',
        created_by: created_by || 'customer',
        status: 'new',
      })
      .select('id')
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      dish_id: item.dish_id,
      quantity: item.quantity,
      price_at_order: dishMap.get(item.dish_id)!.price,
      notes: item.notes || null,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) throw itemsError

    return new Response(JSON.stringify({ order_id: order.id, total }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
