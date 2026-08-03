import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { input, label, SectionHeader } from "../AdminCommon"

export default function NewsletterTab() {
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sendMsg, setSendMsg] = useState('')
  const [sendError, setSendError] = useState('')
  const [confirmSend, setConfirmSend] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<any>(null)

  const { data: newsletters, isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { data: subscriberCount } = useQuery({
    queryKey: ['subscriber-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  const handleSaveDraft = async () => {
    if (!subject || !htmlContent) { setSaveMsg('Subject and content are required.'); return }
    setSaving(true); setSaveMsg('')
    const { error } = await supabase.from('newsletters').insert([{
      subject, html_content: htmlContent, status: 'draft'
    }])
    if (error) { setSaveMsg('Failed to save draft.'); setSaving(false); return }
    setSaving(false); setSaveMsg('Draft saved!')
    queryClient.invalidateQueries({ queryKey: ['newsletters'] })
  }

  const handleSend = async () => {
    if (!selectedNewsletter) return
    setSending(true); setSendMsg(''); setSendError(''); setConfirmSend(false)

    const { data, error } = await supabase.functions.invoke('send-newsletter', {
      body: { newsletter_id: selectedNewsletter.id },
    })

    if (error || !data?.success) {
      setSendError(error?.message ?? 'Send failed. Check function logs.')
      setSending(false); return
    }

    setSending(false)
    setSendMsg(`Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}!${data.failed > 0 ? ` (${data.failed} failed)` : ''}`)
    setSelectedNewsletter(null)
    queryClient.invalidateQueries({ queryKey: ['newsletters'] })
  }

  const loadDraft = (nl: any) => {
    setSubject(nl.subject)
    setHtmlContent(nl.html_content)
    setPreviewMode(false)
    setSaveMsg(''); setSendMsg(''); setSendError('')
  }

  return (
    <div>
      <SectionHeader label="Email Marketing" title="Newsletter" />

      {/* Subscriber count badge */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-brown text-cream text-xs font-black px-4 py-2 rounded-full">
          {subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''} on your list
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Compose Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPreviewMode(false)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${!previewMode ? 'bg-brown text-cream' : 'bg-cream border border-blush/40 text-taupe hover:text-brown'}`}
              >
                Compose
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${previewMode ? 'bg-brown text-cream' : 'bg-cream border border-blush/40 text-taupe hover:text-brown'}`}
              >
                Preview
              </button>
            </div>

            {!previewMode ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className={label}>Email Subject *</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. July Newsletter — Lammyde Beauty & Spa Lounge"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>HTML Content *</label>
                  <p className="text-xs font-medium text-brown/40 mb-2">
                    Paste your newsletter HTML here. Use the template from the newsletter file.
                  </p>
                  <textarea
                    value={htmlContent}
                    onChange={e => setHtmlContent(e.target.value)}
                    rows={16}
                    placeholder="Paste full HTML newsletter content here..."
                    className={`${input} resize-none font-mono text-xs`}
                  />
                </div>
                {saveMsg && <p className={`text-xs ${saveMsg.includes('Failed') ? 'text-red-400' : 'text-green-600'}`}>{saveMsg}</p>}
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-brown/40 mb-3 uppercase tracking-widest">Preview</p>
                {htmlContent ? (
                  <div
                    className="border border-blush/40 rounded-xl overflow-hidden"
                    style={{ maxHeight: '600px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                ) : (
                  <p className="text-sm font-medium text-brown/40 text-center py-10">
                    No content yet — go to Compose and paste your HTML.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Drafts + Send */}
        <div className="flex flex-col gap-4">

          {/* Send Panel */}
          <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-5">
            <h3 className="font-serif font-black text-brown text-base mb-1">Send Newsletter</h3>
            <p className="text-xs font-medium text-brown/50 mb-4">
              Select a saved draft below then send to all subscribers.
            </p>

            {selectedNewsletter ? (
              <div className="mb-4 bg-blush/20 border border-blush/40 rounded-xl p-3">
                <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Selected</p>
                <p className="text-sm font-black text-brown font-serif">{selectedNewsletter.subject}</p>
                <button onClick={() => setSelectedNewsletter(null)} className="text-xs text-taupe hover:text-brown mt-1">Clear</button>
              </div>
            ) : (
              <p className="text-xs font-medium text-brown/40 mb-4">No draft selected.</p>
            )}

            {sendMsg && <p className="text-xs text-green-600 mb-3">{sendMsg}</p>}
            {sendError && <p className="text-xs text-red-400 mb-3">{sendError}</p>}

            {!confirmSend ? (
              <button
                onClick={() => { if (selectedNewsletter) setConfirmSend(true) }}
                disabled={!selectedNewsletter || sending}
                className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : `Send to ${subscriberCount} Subscribers`}
              </button>
            ) : (
              <div>
                <p className="text-xs font-bold text-red-400 mb-3 text-center">
                  Are you sure? This will send to all {subscriberCount} subscribers immediately.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSend}
                    className="flex-1 bg-brown text-cream font-bold py-2.5 rounded-full hover:bg-brown/80 transition-colors text-xs"
                  >
                    Yes, Send Now
                  </button>
                  <button
                    onClick={() => setConfirmSend(false)}
                    className="flex-1 bg-cream border border-blush/40 text-taupe font-bold py-2.5 rounded-full text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drafts + History */}
          <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-5 flex-1">
            <h3 className="font-serif font-black text-brown text-base mb-4">Drafts & History</h3>
            {isLoading && <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
            {!isLoading && (!newsletters || newsletters.length === 0) && (
              <p className="text-sm font-medium text-brown/40">No newsletters yet.</p>
            )}
            {!isLoading && newsletters && newsletters.length > 0 && (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {newsletters.map((nl: any) => (
                  <div key={nl.id} className={`border rounded-xl p-3 cursor-pointer transition-all ${selectedNewsletter?.id === nl.id ? 'border-gold/60 bg-gold/5' : 'border-blush/40 hover:border-gold/30'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-black text-brown font-serif truncate flex-1">{nl.subject}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${nl.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-blush/40 text-taupe'}`}>
                        {nl.status}
                      </span>
                    </div>
                    {nl.status === 'sent' && (
                      <p className="text-xs font-medium text-brown/40 mb-2">
                        {nl.recipients_count} recipients · {new Date(nl.sent_at).toLocaleDateString()}
                      </p>
                    )}
                    {!nl.status || nl.status === 'draft' ? (
                      <p className="text-xs font-medium text-brown/40 mb-2">
                        {new Date(nl.created_at).toLocaleDateString()}
                      </p>
                    ) : null}
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadDraft(nl)}
                        className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold"
                      >
                        Edit
                      </button>
                      {nl.status === 'draft' && (
                        <button
                          onClick={() => setSelectedNewsletter(nl)}
                          className="text-xs bg-brown text-cream px-3 py-1 rounded-full font-semibold hover:bg-brown/80 transition-colors"
                        >
                          Select to Send
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}