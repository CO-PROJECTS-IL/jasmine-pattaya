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
      action: 'list' | 'upsert' | 'copy-week'
      [key: string]: unknown
    }

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list') {
      const { week_start } = data as { week_start?: string }

      let query = supabase
        .from('shifts')
        .select(`
          *,
          employees (
            id,
            full_name
          )
        `)
        .order('date')
        .order('shift_type')

      if (week_start) {
        // Calculate week end (7 days from week_start)
        const startDate = new Date(week_start)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)

        query = query
          .gte('date', week_start)
          .lte('date', endDate.toISOString().split('T')[0])
      }

      const { data: shifts, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ shifts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'upsert') {
      const { employee_id, date, shift_type } = data as {
        employee_id: string
        date: string
        shift_type: string
      }

      if (!employee_id || !date || !shift_type) {
        return new Response(
          JSON.stringify({ error: 'employee_id, date, and shift_type are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { data: shift, error } = await supabase
        .from('shifts')
        .upsert({ employee_id, date, shift_type }, { onConflict: 'employee_id,date' })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ shift }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'copy-week') {
      const { source_week, target_week } = data as {
        source_week: string
        target_week: string
      }

      if (!source_week || !target_week) {
        return new Response(
          JSON.stringify({ error: 'source_week and target_week are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Calculate week end dates
      const sourceStart = new Date(source_week)
      const sourceEnd = new Date(sourceStart)
      sourceEnd.setDate(sourceEnd.getDate() + 6)

      const targetStart = new Date(target_week)
      const dayDiff = targetStart.getTime() - sourceStart.getTime()

      // Fetch source week shifts
      const { data: sourceShifts, error: fetchError } = await supabase
        .from('shifts')
        .select('employee_id, date, shift_type')
        .gte('date', source_week)
        .lte('date', sourceEnd.toISOString().split('T')[0])

      if (fetchError) throw fetchError

      if (!sourceShifts || sourceShifts.length === 0) {
        return new Response(JSON.stringify({ success: true, copied: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Map to target week dates
      const targetShifts = sourceShifts.map((shift) => {
        const srcDate = new Date(shift.date)
        const tgtDate = new Date(srcDate.getTime() + dayDiff)
        return {
          employee_id: shift.employee_id,
          date: tgtDate.toISOString().split('T')[0],
          shift_type: shift.shift_type,
        }
      })

      const { error: insertError } = await supabase
        .from('shifts')
        .upsert(targetShifts, { onConflict: 'employee_id,date' })

      if (insertError) throw insertError

      return new Response(JSON.stringify({ success: true, copied: targetShifts.length }), {
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
