import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { SectionHeader } from "../AdminCommon"

export default function FeedbacksTab() {
  const queryClient = useQueryClient()

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feedbacks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedbacks'] }),
  })

  const avgRating = feedbacks && feedbacks.length > 0
    ? (feedbacks.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : null

  const ratingColors: Record<number, string> = {
    1: 'text-red-400', 2: 'text-orange-400',
    3: 'text-yellow-500', 4: 'text-green-500', 5: 'text-green-600'
  }

  return (
    <div>
      <SectionHeader label="Client Voices" title="Feedbacks" />

      {/* Stats */}
      {feedbacks && feedbacks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-blush/40 rounded-2xl p-4 text-center shadow-sm">
            <p className="font-serif text-3xl font-black text-brown">{feedbacks.length}</p>
            <p className="text-xs font-bold text-taupe uppercase tracking-widest mt-1">Total Reviews</p>
          </div>
          <div className="bg-white border border-blush/40 rounded-2xl p-4 text-center shadow-sm">
            <p className="font-serif text-3xl font-black text-gold">{avgRating}</p>
            <p className="text-xs font-bold text-taupe uppercase tracking-widest mt-1">Avg Rating</p>
          </div>
          <div className="bg-white border border-blush/40 rounded-2xl p-4 text-center shadow-sm">
            <p className="font-serif text-3xl font-black text-brown">
              {feedbacks.filter((f: any) => f.rating >= 4).length}
            </p>
            <p className="text-xs font-bold text-taupe uppercase tracking-widest mt-1">Happy Clients</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-blush/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (!feedbacks || feedbacks.length === 0) && (
        <div className="text-center py-16 border border-blush/40 rounded-2xl bg-white">
          <p className="text-sm font-medium text-brown/50">No feedback yet.</p>
        </div>
      )}

      {!isLoading && feedbacks && feedbacks.length > 0 && (
        <div className="flex flex-col gap-3">
          {feedbacks.map((f: any) => (
            <div key={f.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {f.rating && (
                    <span className={`text-base font-black ${ratingColors[f.rating] ?? 'text-gold'}`}>
                      {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                    </span>
                  )}
                  {f.service_type && (
                    <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                      {f.service_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs font-medium text-brown/40">
                    {new Date(f.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => confirm('Delete this feedback?') && deleteMutation.mutate(f.id)}
                    className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-brown/70 leading-relaxed">
                "{f.feedback}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}