import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductsTab from './tabs/ProductsTab'
import PortfolioTab from './tabs/PortfolioTab'
import ServicesTab from './tabs/ServicesTab'
import SettingsTab from './tabs/SettingsTab'
import EnquiriesTab from './tabs/EnquiriesTab'
import SubscribersTab from './tabs/SubscribersTab'
import AccountTab from './tabs/AccountTab'

type Tab = 'products' | 'portfolio' | 'services' | 'settings' | 'enquiries' | 'subscribers' | 'account'

const tabs: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'services', label: 'Services' },
  { id: 'settings', label: 'Site Settings' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'account', label: 'Account' },
]

export default function Dashboard() {
  const [active, setActive] = useState<Tab>('products')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted && !data.session) navigate('/admin/login')
    })()
    return () => { mounted = false }
  }, [navigate])

  return (
    <div className="min-h-screen p-6 bg-cream">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white border rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold mb-4">Admin</h3>
          <nav className="flex flex-col gap-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)} className={`text-left px-3 py-2 rounded-lg ${active === t.id ? 'bg-brown text-cream' : 'text-brown/70 hover:bg-blush/10'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3">
          {active === 'products' && <ProductsTab />}
          {active === 'portfolio' && <PortfolioTab />}
          {active === 'services' && <ServicesTab />}
          {active === 'settings' && <SettingsTab />}
          {active === 'enquiries' && <EnquiriesTab />}
          {active === 'subscribers' && <SubscribersTab />}
          {active === 'account' && <AccountTab />}
        </main>
      </div>
    </div>
  )
}