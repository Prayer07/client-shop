// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'
// // import ProductsTab from './tabs/ProductsTab'
// import PortfolioTab from './tabs/PortfolioTab'
// import ServicesTab from './tabs/ServicesTab'
// import SettingsTab from './tabs/SettingsTab'
// import EnquiriesTab from './tabs/EnquiriesTab'
// import SubscribersTab from './tabs/SubscribersTab'
// import AccountTab from './tabs/AccountTab'

// type Tab = 'products' | 'portfolio' | 'services' | 'settings' | 'enquiries' | 'subscribers' | 'account'

// const tabs: { id: Tab; label: string }[] = [
//   // { id: 'products', label: 'Products' },
//   { id: 'portfolio', label: 'Portfolio' },
//   // { id: 'services', label: 'Services' },
//   { id: 'settings', label: 'Site Settings' },
//   { id: 'enquiries', label: 'Enquiries' },
//   { id: 'subscribers', label: 'Subscribers' },
//   { id: 'account', label: 'Account' },
// ]

// export default function Dashboard() {
//   const [active, setActive] = useState<Tab>('portfolio')
//   const navigate = useNavigate()

//   useEffect(() => {
//     let mounted = true
//     ;(async () => {
//       const { data } = await supabase.auth.getSession()
//       if (mounted && !data.session) navigate('/admin/login')
//     })()
//     return () => { mounted = false }
//   }, [navigate])

//   return (
//     <div className="min-h-screen p-6 bg-cream">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
//         <aside className="md:col-span-1 bg-white border rounded-2xl p-4 shadow-sm">
//           <h3 className="font-bold mb-4">Admin</h3>
//           <nav className="flex flex-col gap-2">
//             {tabs.map(t => (
//               <button key={t.id} onClick={() => setActive(t.id)} className={`text-left px-3 py-2 rounded-lg ${active === t.id ? 'bg-brown text-cream' : 'text-brown/70 hover:bg-blush/10'}`}>
//                 {t.label}
//               </button>
//             ))}
//           </nav>
//         </aside>
//         <main className="md:col-span-3">
//           {/* {active === 'products' && <ProductsTab />} */}
//           {active === 'portfolio' && <PortfolioTab />}
//           {active === 'services' && <ServicesTab />}
//           {active === 'settings' && <SettingsTab />}
//           {active === 'enquiries' && <EnquiriesTab />}
//           {active === 'subscribers' && <SubscribersTab />}
//           {active === 'account' && <AccountTab />}
//         </main>
//       </div>
//     </div>
//   )
// }





import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ServiceCategoryTab from './tabs/ServiceCategoryTab'
import ServicesTab from './tabs/ServiceTab'
import SpaPackageTab from './tabs/SpaPackageTab'
import SettingsTab from './tabs/SettingsTab'
import EnquiriesTab from './tabs/EnquiriesTab'
import SubscribersTab from './tabs/SubscribersTab'
import AccountTab from './tabs/AccountTab'
import NewsletterTab from './tabs/NewsletterTab'
import GiftCardsTab from './tabs/GiftCardsTab'

// ─── TAB TYPE ─────────────────────────────────────────────────────────────────
type Tab = 'portfolio_cats' | 'portfolio_services' | 'spa_packages' | 'services' | 'settings' | 'enquiries' | 'subscribers' | 'account' | 'newsletter' | 'gift_cards'

const tabs: { id: Tab; label: string }[] = [
  // { id: 'products', emoji: '🛍️', label: 'Products' },
  { id: 'portfolio_cats', label: 'Service Categories' },
  { id: 'portfolio_services', label: 'Services' },
  { id: 'spa_packages', label: 'Spa Packages' },
  // { id: 'services', label: 'Services' },
  { id: 'settings', label: 'Site Settings' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'account', label: 'Account' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'gift_cards', label: 'Gift Cards' }
]

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('portfolio_cats')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin')
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-brown border-b border-cream/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-black text-cream">Admin Dashboard</h1>
            <p className="text-cream/50 text-xs font-medium mt-0.5">Manage your entire website from here</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/admin') }}
            className="text-xs font-bold text-blush hover:text-cream transition-colors border border-blush/30 px-4 py-2 rounded-full hover:border-blush/60"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-2 flex-wrap mb-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-brown text-cream border-brown shadow-md'
                  : 'bg-white text-taupe border-blush/40 hover:border-gold/40 hover:text-brown'
              }`}
            >
              {/* <span>{tab.emoji}</span> */}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* {activeTab === 'products' && <ProductsTab />} */}
        {activeTab === 'portfolio_cats' && <ServiceCategoryTab />}
        {activeTab === 'portfolio_services' && <ServicesTab />}
        {activeTab === 'spa_packages' && <SpaPackageTab />}
        {/* {activeTab === 'services' && <ServicesTab />} */}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'enquiries' && <EnquiriesTab />}
        {activeTab === 'subscribers' && <SubscribersTab />}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'newsletter' && <NewsletterTab />}
        {activeTab === 'gift_cards' && <GiftCardsTab />}
      </div>
    </div>
  )
}