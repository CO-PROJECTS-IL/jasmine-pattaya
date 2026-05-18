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
    const { action, employee_id, start_date, end_date } = body as {
      action: 'list'
      employee_id?: string
      start_date?: string
      end_date?: string
    }

    if (action !== 'list') {
      return new Response(JSON.stringify({ error: 'Only "list" action is supported' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let query = supabase
      .from('attendance')
      .select(`
        *,
        employees (
          id,
          full_name
        )
      `)
      .order('check_in', { ascending: false })

    if (employee_id) {
      query = query.eq('employee_id', employee_id)
    }

    if (start_date) {
      query = query.gte('check_in', start_date)
    }

    if (end_date) {
      query = query.lte('check_in', end_date)
    }

    const { data: records, error } = await query

    if (error) throw error

    return new Response(JSON.stringify({ records }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
