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
    const { employee_id, check_in, check_out } = body as {
      employee_id: string
      check_in: string
      check_out: string
    }

    if (!employee_id || !check_in || !check_out) {
      return new Response(
        JSON.stringify({ error: 'employee_id, check_in, and check_out are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid date format for check_in or check_out' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (checkOutDate <= checkInDate) {
      return new Response(JSON.stringify({ error: 'check_out must be after check_in' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error } = await supabase.from('attendance').insert({
      employee_id,
      check_in: checkInDate.toISOString(),
      check_out: checkOutDate.toISOString(),
      is_manual: true,
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
