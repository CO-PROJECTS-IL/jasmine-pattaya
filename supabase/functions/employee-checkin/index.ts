import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
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
    const { employee_id, action, lat, lng } = body as {
      employee_id: string
      action: 'in' | 'out'
      lat: number
      lng: number
    }

    if (!employee_id || !action || lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: 'employee_id, action, lat, and lng are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch restaurant location settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('restaurant_lat, restaurant_lng, radius_meters')
      .eq('id', 1)
      .single()

    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: 'Settings not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const distance = haversineDistance(
      lat,
      lng,
      settings.restaurant_lat,
      settings.restaurant_lng
    )

    if (distance > settings.radius_meters) {
      return new Response(
        JSON.stringify({
          error: `Too far from restaurant. Distance: ${Math.round(distance)}m, allowed: ${settings.radius_meters}m`,
          distance: Math.round(distance),
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'in') {
      const { error } = await supabase.from('attendance').insert({
        employee_id,
        check_in: new Date().toISOString(),
        lat,
        lng,
        is_manual: false,
      })
      if (error) throw error
    } else if (action === 'out') {
      // Find most recent open attendance record
      const { data: record, error: findError } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employee_id)
        .is('check_out', null)
        .order('check_in', { ascending: false })
        .limit(1)
        .single()

      if (findError || !record) {
        return new Response(
          JSON.stringify({ error: 'No open check-in found for this employee' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { error: updateError } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', record.id)

      if (updateError) throw updateError
    } else {
      return new Response(JSON.stringify({ error: 'action must be "in" or "out"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, distance: Math.round(distance) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
