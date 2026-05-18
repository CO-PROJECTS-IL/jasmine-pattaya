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
    const { employee_id } = body as { employee_id: string }

    if (!employee_id) {
      return new Response(JSON.stringify({ error: 'employee_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch employee pay info
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('pay_type, pay_rate')
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get first day of current month
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Fetch attendance records for current month
    const { data: records, error: attError } = await supabase
      .from('attendance')
      .select('check_in, check_out')
      .eq('employee_id', employee_id)
      .gte('check_in', firstOfMonth)
      .not('check_out', 'is', null)

    if (attError) throw attError

    let hours_worked = 0
    const uniqueDays = new Set<string>()

    for (const record of records || []) {
      const checkIn = new Date(record.check_in)
      const checkOut = new Date(record.check_out)
      const diffMs = checkOut.getTime() - checkIn.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      hours_worked += diffHours

      // Track unique days for daily pay calculation
      const dayKey = checkIn.toISOString().split('T')[0]
      uniqueDays.add(dayKey)
    }

    const days_worked = uniqueDays.size

    let salary = 0
    if (employee.pay_type === 'hourly') {
      salary = hours_worked * employee.pay_rate
    } else if (employee.pay_type === 'daily') {
      salary = days_worked * employee.pay_rate
    }

    return new Response(
      JSON.stringify({
        salary: Math.round(salary * 100) / 100,
        days_worked,
        hours_worked: Math.round(hours_worked * 100) / 100,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
