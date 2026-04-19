import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader } from '../AdminCommon'

const fetchEnquiries = async () => {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function EnquiriesTab() {
  const { data: enquiries, isLoading } = useQuery({ queryKey: ['enquiries'], queryFn: fetchEnquiries })

  return (
    <div>
      <SectionHeader label="Messages" title="Client Enquiries" />
      {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
      {!isLoading && (!enquiries || enquiries.length === 0) && <p className="text-sm text-brown/50">No enquiries yet.</p>}
      {!isLoading && enquiries && enquiries.length > 0 && (
        <div className="flex flex-col gap-3">
          {enquiries.map(q => (
            <div key={q.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-brown truncate">{q.name} — <span className="font-normal text-brown/50">{q.email}</span></p>
                  <p className="mt-2 text-xs text-brown/60">{q.message}</p>
                </div>
                <div className="text-xs text-brown/40">{new Date(q.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
