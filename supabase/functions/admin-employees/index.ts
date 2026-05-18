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
      action: 'list' | 'get' | 'create' | 'update' | 'delete'
      [key: string]: unknown
    }

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list') {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name')

      if (error) throw error

      return new Response(JSON.stringify({ employees }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'get') {
      const { id } = data as { id: string }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for get' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ employee }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'create') {
      const { full_name, phone, role, pay_type, pay_rate, is_active } = data as {
        full_name: string
        phone?: string
        role?: string
        pay_type: 'hourly' | 'daily'
        pay_rate: number
        is_active?: boolean
      }

      if (!full_name || !pay_type || pay_rate === undefined) {
        return new Response(
          JSON.stringify({ error: 'full_name, pay_type, and pay_rate are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { data: employee, error } = await supabase
        .from('employees')
        .insert({ full_name, phone, role, pay_type, pay_rate, is_active: is_active ?? true })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ employee }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      const { id, ...updates } = data as { id: string; [key: string]: unknown }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: employee, error } = await supabase
        .from('employees')
        .update({ ...updates })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ employee }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { id } = data as { id: string }

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for delete' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('employees').delete().eq('id', id)

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
