import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader, input, label } from '../AdminCommon'

const fetchAccount = async () => {
  const { data, error } = await supabase.from('accounts').select('*').single()
  if (error) throw error
  return data
}

export default function AccountTab() {
  const { data: account, isLoading } = useQuery({ queryKey: ['account'], queryFn: fetchAccount })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const handleSave = async () => {
    setErr('')
    setMsg('')
    try {
      const payload: Record<string, unknown> = {}
      if (email.trim()) payload.email = email.trim()
      if (password) payload.password = password

      if (Object.keys(payload).length === 0) {
        setMsg('No changes to save')
        return
      }

      if (account && account.id) {
        const { error } = await supabase.from('accounts').update(payload).eq('id', account.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('accounts').insert(payload)
        if (error) throw error
      }

      setMsg('Saved successfully')
      // clear local inputs
      setPassword('')
    } catch (e: any) {
      setErr(e?.message ?? 'Save failed')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <SectionHeader label="Account" title="Admin Account" />
        <div className="flex flex-col gap-4">
          <div><label className={label}>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder={account?.email ?? ''} className={input} /></div>
          <div><label className={label}>New Password</label><input value={password} onChange={e => setPassword(e.target.value)} type="password" className={input} /></div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          {msg && <p className="text-xs text-green-600">{msg}</p>}
          <button
            onClick={() => void handleSave()}
            disabled={isLoading}
            className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm"
          >
            Save
          </button>
        </div>
      </div>

      <div>
        <SectionHeader label="Session" title="Active Sessions" />
        <div className="bg-cream border border-blush/20 rounded-xl p-6">
          <p className="text-sm text-brown/70">No active sessions found.</p>
        </div>
      </div>
    </div>
  )
}
