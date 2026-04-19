import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const Home = lazy(() => import('./pages/Home'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Shop = lazy(() => import('./pages/Shop'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./admin/Login'))
const Dashboard = lazy(() => import('./admin/Dashboard'))
const Consultation = lazy(() => import('./pages/Consultation'))
const Services = lazy(() => import('./pages/Services'))

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-10">
              <div className="skeleton h-8 w-48 rounded-full mb-4" />
              <div className="skeleton h-20 md:h-28 w-full rounded-lg mb-3" />
              <div className="skeleton h-6 w-3/4 rounded-md" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl skeleton aspect-square shadow-sm" />
              ))}
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/services" element={<Services />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}