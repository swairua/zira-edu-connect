import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthResult {
  parentId: string;
  institutionId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let authResult: AuthResult | null = null;

    // Try Supabase Auth JWT first
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (!userError && userData?.user) {
        const { data: parent } = await supabase
          .from('parents')
          .select('id, institution_id')
          .eq('user_id', userData.user.id)
          .single();
        if (parent) {
          authResult = { parentId: parent.id, institutionId: parent.institution_id };
        }
      }
    } catch (_e) { /* Not a JWT */ }

    // Try OTP session if Supabase auth failed
    if (!authResult) {
      const tokenHash = await hashToken(token);
    const { data: session } = await supabase
      .from('parent_sessions')
      .select('parent_id, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

      if (session && new Date(session.expires_at) > new Date()) {
        const { data: parent } = await supabase
          .from('parents')
          .select('id, institution_id')
          .eq('id', session.parent_id)
          .single();
        if (parent) {
          authResult = { parentId: parent.id, institutionId: parent.institution_id };
        }
      }
    }

    if (!authResult) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { parentId, institutionId } = authResult;
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    if (action === 'list') {
      const { data: threads, error } = await supabase
        .from('message_threads')
        .select(`id, subject, last_message_at, created_at, staff:staff_id (id, first_name, last_name, designation)`)
        .eq('parent_id', parentId)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const threadIds = threads?.map(t => t.id) || [];
      const unreadCounts: Record<string, number> = {};
      if (threadIds.length > 0) {
        const { data: unreadData } = await supabase.from('thread_messages').select('thread_id').in('thread_id', threadIds).eq('is_read', false).eq('sender_type', 'staff');
        unreadData?.forEach(msg => { unreadCounts[msg.thread_id] = (unreadCounts[msg.thread_id] || 0) + 1; });
      }

      return new Response(JSON.stringify({ threads: threads?.map(t => ({ ...t, unread_count: unreadCounts[t.id] || 0 })) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'thread') {
      const threadId = url.searchParams.get('thread_id');
      if (!threadId) return new Response(JSON.stringify({ error: 'Thread ID required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { data: thread } = await supabase.from('message_threads').select(`id, subject, staff:staff_id (id, first_name, last_name, designation)`).eq('id', threadId).eq('parent_id', parentId).single();
      if (!thread) return new Response(JSON.stringify({ error: 'Thread not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { data: messages } = await supabase.from('thread_messages').select('id, sender_type, sender_id, content, is_read, created_at').eq('thread_id', threadId).order('created_at', { ascending: true });
      await supabase.from('thread_messages').update({ is_read: true }).eq('thread_id', threadId).eq('sender_type', 'staff').eq('is_read', false);

      return new Response(JSON.stringify({ thread, messages }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'send' && req.method === 'POST') {
      const { thread_id, content } = await req.json();
      if (!thread_id || !content) return new Response(JSON.stringify({ error: 'Thread ID and content required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { data: thread } = await supabase.from('message_threads').select('id, staff_id, institution_id').eq('id', thread_id).eq('parent_id', parentId).single();
      if (!thread) return new Response(JSON.stringify({ error: 'Thread not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { data: message, error } = await supabase.from('thread_messages').insert({ thread_id, sender_type: 'parent', sender_id: parentId, content }).select().single();
      if (error) throw error;

      const { data: parent } = await supabase.from('parents').select('first_name, last_name').eq('id', parentId).single();
      const { data: staff } = await supabase.from('staff').select('user_id').eq('id', thread.staff_id).single();
      if (staff?.user_id) {
        await supabase.from('in_app_notifications').insert({ institution_id: thread.institution_id, user_id: staff.user_id, user_type: 'staff', type: 'info', title: 'New Message from Parent', message: `${parent?.first_name} ${parent?.last_name}: ${content.substring(0, 100)}`, reference_type: 'thread_message', reference_id: message.id });
      }
      await supabase.from('message_threads').update({ last_message_at: new Date().toISOString() }).eq('id', thread_id);

      return new Response(JSON.stringify({ message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'notifications') {
      const { data } = await supabase.from('in_app_notifications').select('*').eq('parent_id', parentId).order('created_at', { ascending: false }).limit(20);
      return new Response(JSON.stringify({ notifications: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'mark_read' && req.method === 'POST') {
      const { notification_id } = await req.json();
      if (notification_id) await supabase.from('in_app_notifications').update({ is_read: true }).eq('id', notification_id).eq('parent_id', parentId);
      else await supabase.from('in_app_notifications').update({ is_read: true }).eq('parent_id', parentId).eq('is_read', false);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Parent messages error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
