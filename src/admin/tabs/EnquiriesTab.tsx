import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader } from '../AdminCommon'
import ConsultationsTab from './ConsultationsTab'

const fetchEnquiries = async () => {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  if (error) throw error; return data
}

export default function EnquiriesTab() {
  const queryClient = useQueryClient()
  const { data: enquiries, isLoading } = useQuery({ queryKey: ['enquiries'], queryFn: fetchEnquiries })

  const deleteEnquiry = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return
    await supabase.from('enquiries').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['enquiries'] })
  }

  const deleteConsultation = async (id: string) => {
    if (!confirm('Delete this consultation?')) return
    await supabase.from('pre_consultations').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['consultations'] })
  }

  return (
    <div>
      <SectionHeader label="Inbox" title="Enquiries & Consultations" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h3 className="font-serif font-black text-brown text-base mb-4">Contact Form</h3>
          {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!isLoading && (!enquiries || enquiries.length === 0) && <p className="text-sm font-medium text-brown/50">No enquiries yet.</p>}
          {!isLoading && enquiries && enquiries.length > 0 && (
            <div className="flex flex-col gap-3">
              {enquiries.map((e: any) => (
                <div key={e.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-black text-brown font-serif">{e.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs font-medium text-brown/40">{new Date(e.created_at).toLocaleDateString()}</p>
                      <button onClick={() => deleteEnquiry(e.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors">Delete</button>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gold mb-1">{e.subject}</p>
                  <p className="text-xs font-medium text-brown/60 leading-relaxed">{e.message}</p>
                  <p className="text-xs font-semibold text-brown/40 mt-2">{e.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <ConsultationsTab onDelete={deleteConsultation} />
      </div>
    </div>
  )
}