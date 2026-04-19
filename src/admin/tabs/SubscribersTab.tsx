import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader } from '../AdminCommon'

const fetchSubscribers = async () => {
  const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function SubscribersTab() {
  const { data: subs, isLoading } = useQuery({ queryKey: ['subscribers'], queryFn: fetchSubscribers })

  return (
    <div>
      <SectionHeader label="Mailing" title="Subscribers" />
      {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
      {!isLoading && (!subs || subs.length === 0) && <p className="text-sm text-brown/50">No subscribers yet.</p>}
      {!isLoading && subs && subs.length > 0 && (
        <div className="flex flex-col gap-3">
          {subs.map(s => (
            <div key={s.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-brown">{s.email}</p>
                <p className="text-xs text-brown/50">{s.name}</p>
              </div>
              <div className="text-xs text-brown/40">{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
