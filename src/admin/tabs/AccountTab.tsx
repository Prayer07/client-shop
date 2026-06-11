import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SectionHeader, input, label } from '../AdminCommon'


export default function AccountTab() {
  const [email, setEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passError, setPassError] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMsg(''); setEmailError('')
    if (!email) { setEmailError('Enter a new email address.'); return }
    setEmailLoading(true)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) { setEmailError(error.message); setEmailLoading(false); return }
    setEmailLoading(false); setEmail('')
    setEmailMsg('Confirmation sent to your new email. Check your inbox to confirm.')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(''); setPassError('')
    if (!currentPassword || !newPassword || !confirmPassword) { setPassError('Fill in all fields.'); return }
    if (newPassword.length < 6) { setPassError('Password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { setPassError('Passwords do not match.'); return }
    setPassLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: currentPassword })
    if (verifyError) { setPassError('Current password is incorrect.'); setPassLoading(false); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPassError(error.message); setPassLoading(false); return }
    setPassLoading(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    setPassMsg('Password updated successfully!')
  }

  return (
    <div className="max-w-md">
      <SectionHeader label="Security" title="Account Settings" />
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-serif font-black text-brown text-base mb-1">Change Email</h3>
        <p className="text-xs font-medium text-brown/50 mb-5">A confirmation link will be sent to your new email.</p>
        <form onSubmit={handleEmailChange} className="flex flex-col gap-4">
          <div><label className={label}>New Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="newemail@example.com" className={input} /></div>
          {emailError && <p className="text-xs text-red-400">{emailError}</p>}
          {emailMsg && <p className="text-xs text-green-600">{emailMsg}</p>}
          <button type="submit" disabled={emailLoading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{emailLoading ? 'Sending...' : 'Update Email'}</button>
        </form>
      </div>
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <h3 className="font-serif font-black text-brown text-base mb-1">Change Password</h3>
        <p className="text-xs font-medium text-brown/50 mb-5">At least 6 characters required.</p>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <div><label className={label}>Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className={input} /></div>
          <div><label className={label}>New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className={input} /></div>
          <div><label className={label}>Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className={input} /></div>
          {passError && <p className="text-xs text-red-400">{passError}</p>}
          {passMsg && <p className="text-xs text-green-600">{passMsg}</p>}
          <button type="submit" disabled={passLoading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{passLoading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  )
}