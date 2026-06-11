import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { SectionHeader } from '../AdminCommon'


export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribed_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false })
      .then(({ data }) => { if (data) setSubscribers(data); setLoading(false) })
  }, [])

  return (
    <div>
      <SectionHeader label="Email List" title="Newsletter Subscribers" />
      {loading && <div className="h-16 rounded-xl bg-blush/30 animate-pulse" />}
      {!loading && subscribers.length === 0 && <p className="text-sm font-medium text-brown/50">No subscribers yet.</p>}
      {!loading && subscribers.length > 0 && (
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm overflow-hidden max-w-xl">
          <div className="px-5 py-3 border-b border-blush/20">
            <p className="text-xs font-bold text-brown/50">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-blush/20 max-h-96 overflow-y-auto">
            {subscribers.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-semibold text-brown">{s.email}</p>
                <p className="text-xs font-medium text-brown/40">{new Date(s.subscribed_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}