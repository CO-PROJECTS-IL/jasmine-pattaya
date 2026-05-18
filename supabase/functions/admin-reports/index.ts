import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getDaysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
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
    const { start_date, end_date } = body as { start_date: string; end_date: string }

    if (!start_date || !end_date) {
      return new Response(JSON.stringify({ error: 'start_date and end_date are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const rangeDays = getDaysBetween(startDate, endDate)

    // 1. Revenue from paid orders
    const { data: paidOrders, error: ordersError } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('status', 'paid')
      .gte('created_at', `${start_date}T00:00:00.000Z`)
      .lte('created_at', `${end_date}T23:59:59.999Z`)

    if (ordersError) throw ordersError

    const revenue = (paidOrders || []).reduce((sum, o) => sum + o.total, 0)

    // Build daily revenue map
    const dailyRevenueMap = new Map<string, number>()
    for (const order of paidOrders || []) {
      const day = order.created_at.split('T')[0]
      dailyRevenueMap.set(day, (dailyRevenueMap.get(day) || 0) + order.total)
    }

    // 2. Employee costs from attendance in range
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, pay_type, pay_rate')

    if (empError) throw empError

    const { data: attendanceRecords, error: attError } = await supabase
      .from('attendance')
      .select('employee_id, check_in, check_out')
      .gte('check_in', `${start_date}T00:00:00.000Z`)
      .lte('check_in', `${end_date}T23:59:59.999Z`)
      .not('check_out', 'is', null)

    if (attError) throw attError

    const empMap = new Map(employees?.map((e) => [e.id, e]) || [])
    let employeeCosts = 0

    // Group attendance by employee
    const empAttendance = new Map<string, { hours: number; days: Set<string> }>()
    for (const record of attendanceRecords || []) {
      if (!empAttendance.has(record.employee_id)) {
        empAttendance.set(record.employee_id, { hours: 0, days: new Set() })
      }
      const entry = empAttendance.get(record.employee_id)!
      const checkIn = new Date(record.check_in)
      const checkOut = new Date(record.check_out)
      const diffHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      entry.hours += diffHours
      entry.days.add(checkIn.toISOString().split('T')[0])
    }

    for (const [empId, att] of empAttendance) {
      const emp = empMap.get(empId)
      if (!emp) continue
      if (emp.pay_type === 'hourly') {
        employeeCosts += att.hours * emp.pay_rate
      } else if (emp.pay_type === 'daily') {
        employeeCosts += att.days.size * emp.pay_rate
      }
    }

    // 3. Recurring expenses (prorated by days in range / 30)
    const { data: recurringExpenses, error: recurringError } = await supabase
      .from('expenses_recurring')
      .select('amount')

    if (recurringError) throw recurringError

    const totalRecurringMonthly = (recurringExpenses || []).reduce((sum, e) => sum + e.amount, 0)
    const recurringCost = (totalRecurringMonthly / 30) * rangeDays

    // 4. One-time expenses in range
    const { data: onetimeExpenses, error: onetimeError } = await supabase
      .from('expenses_onetime')
      .select('amount, date')
      .gte('date', start_date)
      .lte('date', end_date)

    if (onetimeError) throw onetimeError

    const onetimeCost = (onetimeExpenses || []).reduce((sum, e) => sum + e.amount, 0)

    // Build daily arrays
    const dailyRevenue: { date: string; amount: number }[] = []
    const dailyProfit: { date: string; amount: number }[] = []

    const current = new Date(startDate)
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayRevenue = dailyRevenueMap.get(dateStr) || 0
      const dayExpenses = (employeeCosts + recurringCost + onetimeCost) / rangeDays
      dailyRevenue.push({ date: dateStr, amount: Math.round(dayRevenue * 100) / 100 })
      dailyProfit.push({
        date: dateStr,
        amount: Math.round((dayRevenue - dayExpenses) * 100) / 100,
      })
      current.setDate(current.getDate() + 1)
    }

    const totalExpenses = employeeCosts + recurringCost + onetimeCost

    return new Response(
      JSON.stringify({
        revenue: Math.round(revenue * 100) / 100,
        expenses: {
          employees: Math.round(employeeCosts * 100) / 100,
          recurring: Math.round(recurringCost * 100) / 100,
          onetime: Math.round(onetimeCost * 100) / 100,
          total: Math.round(totalExpenses * 100) / 100,
        },
        profit: Math.round((revenue - totalExpenses) * 100) / 100,
        dailyRevenue,
        dailyProfit,
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
