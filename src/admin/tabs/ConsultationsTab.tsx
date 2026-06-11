import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

const fetchConsultations = async () => {
  const { data, error } = await supabase.from('consultations').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function ConsultationsTab({ onDelete }: { onDelete: (id: string) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['consultations'], queryFn: fetchConsultations })
  return (
    <div>
      <h3 className="font-serif font-black text-brown text-base mb-4">Pre-Consultations</h3>
      {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
      {!isLoading && (!data || data.length === 0) && <p className="text-sm font-medium text-brown/50">No consultations yet.</p>}
      {!isLoading && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((c: any) => (
            <div key={c.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-black text-brown font-serif">{c.full_name}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs font-medium text-brown/40">{new Date(c.created_at).toLocaleDateString()}</p>
                  <button onClick={() => onDelete(c.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors">Delete</button>
                </div>
              </div>
              <p className="text-xs font-semibold text-gold mb-1">{c.service_interest}</p>
              <p className="text-xs font-medium text-brown/60">{c.email} · {c.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
