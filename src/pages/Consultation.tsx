import { useState } from 'react'
import { RiScalesLine } from 'react-icons/ri'
import { FaLock } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'

type Tab = 'preconsult'

const tabs: { id: Tab; label: string; desc: string }[] = [
  { id: 'preconsult', label: 'Pre-Consultation', desc: 'Tell us about yourself & your visit' },
  // { id: 'beauty', label: 'Client Beauty History', desc: 'Your skin & beauty profile' },
]

const input = 'w-full border border-blush rounded-lg px-4 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/40'
const label = 'block text-xs font-semibold text-taupe uppercase tracking-widest mb-1.5'
const fieldErr = 'text-xs text-red-400 mt-1'

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-8 h-px bg-gold/40" />
      <span className="text-gold text-xs uppercase tracking-widest font-semibold">{text}</span>
    </div>
  )
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
        <RiScalesLine className="text-4xl text-brown" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-brown mb-3">Thank You!</h2>
      <p className="text-taupe text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Your form has been submitted. We'll review your information and
        reach out shortly to confirm your appointment.
      </p>
      <button
        onClick={onReset}
        className="bg-brown text-cream text-sm font-medium px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
      >
        Submit Another
      </button>
    </div>
  )
}

// ─── PRE-CONSULTATION ─────────────────────────────────────────────────────────
const preSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Phone number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  service_interest: z.string().min(1, 'Please select a service'),
  visit_reason: z.string().min(5, 'Please tell us why you are visiting'),
  preferred_date: z.string().optional(),
  how_did_you_hear: z.string().optional(),
  special_requests: z.string().optional(),
})
type PreForm = z.infer<typeof preSchema>

function PreConsultationForm() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<PreForm>({ resolver: zodResolver(preSchema) })

  const onSubmit = async (data: PreForm) => {
    const { error } = await supabase.from('pre_consultations').insert([data])
    if (error) { console.error(error); return }
    setSubmitted(true)
  }

  if (submitted) return <SuccessScreen onReset={() => { reset(); setSubmitted(false) }} />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <SectionTitle text="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Full Name *</label>
            <input {...register('full_name')} placeholder="Jane Doe" className={input} />
            {errors.full_name && <p className={fieldErr}>{errors.full_name.message}</p>}
          </div>
          <div>
            <label className={label}>Date of Birth *</label>
            <input type="date" {...register('date_of_birth')} className={input} />
            {errors.date_of_birth && <p className={fieldErr}>{errors.date_of_birth.message}</p>}
          </div>
          <div>
            <label className={label}>Email Address *</label>
            <input {...register('email')} placeholder="jane@example.com" className={input} />
            {errors.email && <p className={fieldErr}>{errors.email.message}</p>}
          </div>
          <div>
            <label className={label}>Phone Number *</label>
            <input {...register('phone')} placeholder="+1 (555) 000-0000" className={input} />
            {errors.phone && <p className={fieldErr}>{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle text="Your Visit" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Service of Interest *</label>
            <select {...register('service_interest')} className={input}>
              <option value="">Select a service...</option>
              <option>Massage Therapy</option>
              <option>Facial Treatment</option>
              <option>Body Wrap</option>
              <option>Scrub & Exfoliation</option>
              <option>Lash & Brow</option>
              <option>Waxing</option>
              <option>Manicure / Pedicure</option>
              <option>Spa Package</option>
              <option>Other</option>
            </select>
            {errors.service_interest && <p className={fieldErr}>{errors.service_interest.message}</p>}
          </div>
          <div>
            <label className={label}>Preferred Appointment Date</label>
            <input type="date" {...register('preferred_date')} className={input} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Why are you visiting today? *</label>
            <textarea
              {...register('visit_reason')}
              rows={3}
              placeholder="e.g. Relaxation, skin concerns, special occasion, first-time visit..."
              className={`${input} resize-none`}
            />
            {errors.visit_reason && <p className={fieldErr}>{errors.visit_reason.message}</p>}
          </div>
          <div>
            <label className={label}>How did you hear about us?</label>
            <select {...register('how_did_you_hear')} className={input}>
              <option value="">Select an option...</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>TikTok</option>
              <option>Google Search</option>
              <option>Friend / Family Referral</option>
              <option>Walk-In</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={label}>Special Requests</label>
            <textarea
              {...register('special_requests')}
              rows={3}
              placeholder="Any preferences, accessibility needs, or things we should know..."
              className={`${input} resize-none`}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brown text-cream font-medium py-3.5 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Pre-Consultation'}
      </button>
    </form>
  )
}


// ─── BEAUTY HISTORY ───────────────────────────────────────────────────────────
// const beautySchema = z.object({
//   full_name: z.string().min(2, 'Full name is required'),
//   email: z.string().email('Enter a valid email'),
//   phone: z.string().min(7, 'Phone number is required'),
//   skin_type: z.string().min(1, 'Please select your skin type'),
//   skin_concerns: z.array(z.string()).optional(),
//   current_products: z.string().optional(),
//   known_sensitivities: z.string().optional(),
//   previous_treatments: z.string().optional(),
//   skincare_goals: z.string().optional(),
//   is_pregnant_or_nursing: z.boolean().optional(),
//   had_recent_surgery: z.boolean().optional(),
//   additional_notes: z.string().optional(),
//   agreed: z.literal(true, { message: 'You must agree to continue' }),
// })
// type BeautyForm = z.infer<typeof beautySchema>

// const skinConcerns = [
//   'Acne / Breakouts', 'Dryness', 'Oiliness', 'Sensitivity / Redness',
//   'Dark Spots / Pigmentation', 'Fine Lines / Wrinkles', 'Dullness',
//   'Enlarged Pores', 'Uneven Skin Tone', 'Scarring', 'Rosacea', 'None',
// ]

// function BeautyHistoryForm() {
//   const [submitted, setSubmitted] = useState(false)
//   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
//     useForm<BeautyForm>({ resolver: zodResolver(beautySchema) })

//   const onSubmit = async () => {
//     await new Promise(r => setTimeout(r, 800))
//     setSubmitted(true)
//   }

//   if (submitted) return <SuccessScreen onReset={() => { reset(); setSubmitted(false) }} />

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//       <div>
//         <SectionTitle text="Personal Information" />
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className={label}>Full Name *</label>
//             <input {...register('full_name')} placeholder="Jane Doe" className={input} />
//             {errors.full_name && <p className={fieldErr}>{errors.full_name.message}</p>}
//           </div>
//           <div>
//             <label className={label}>Email Address *</label>
//             <input {...register('email')} placeholder="jane@example.com" className={input} />
//             {errors.email && <p className={fieldErr}>{errors.email.message}</p>}
//           </div>
//           <div>
//             <label className={label}>Phone Number *</label>
//             <input {...register('phone')} placeholder="+1 (555) 000-0000" className={input} />
//             {errors.phone && <p className={fieldErr}>{errors.phone.message}</p>}
//           </div>
//         </div>
//       </div>

//       <div>
//         <SectionTitle text="Your Skin" />
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className={label}>Skin Type *</label>
//             <select {...register('skin_type')} className={input}>
//               <option value="">Select your skin type...</option>
//               <option>Normal</option>
//               <option>Dry</option>
//               <option>Oily</option>
//               <option>Combination</option>
//               <option>Sensitive</option>
//               <option>Mature</option>
//               <option>Not Sure</option>
//             </select>
//             {errors.skin_type && <p className={fieldErr}>{errors.skin_type.message}</p>}
//           </div>
//           <div>
//             <label className={label}>Known Product Sensitivities</label>
//             <input
//               {...register('known_sensitivities')}
//               placeholder="e.g. fragrance, essential oils, nuts..."
//               className={input}
//             />
//           </div>
//         </div>

//         <div className="mt-4">
//           <label className={label}>Skin Concerns (check all that apply)</label>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blush/10 border border-blush/30 rounded-xl p-5 mt-1.5">
//             {skinConcerns.map(concern => (
//               <label key={concern} className="flex gap-2.5 items-center cursor-pointer group">
//                 <input
//                   type="checkbox"
//                   value={concern}
//                   {...register('skin_concerns')}
//                   className="w-4 h-4 accent-brown cursor-pointer shrink-0"
//                 />
//                 <span className="text-xs text-taupe group-hover:text-brown transition-colors">
//                   {concern}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div>
//         <SectionTitle text="Beauty Routine & History" />
//         <div className="grid grid-cols-1 gap-4">
//           <div>
//             <label className={label}>Current Skincare Products</label>
//             <textarea
//               {...register('current_products')}
//               rows={3}
//               placeholder="Cleanser, moisturiser, SPF, serums you currently use..."
//               className={`${input} resize-none`}
//             />
//           </div>
//           <div>
//             <label className={label}>Previous Professional Treatments</label>
//             <textarea
//               {...register('previous_treatments')}
//               rows={3}
//               placeholder="e.g. facials, waxing, lash extensions, massage — and when your last session was..."
//               className={`${input} resize-none`}
//             />
//           </div>
//           <div>
//             <label className={label}>What are your main beauty goals?</label>
//             <textarea
//               {...register('skincare_goals')}
//               rows={3}
//               placeholder="What results are you hoping to achieve from your treatments?"
//               className={`${input} resize-none`}
//             />
//           </div>
//         </div>
//       </div>

//       <div>
//         <SectionTitle text="Health Notes" />
//         <div className="bg-blush/10 border border-blush/30 rounded-xl p-5 space-y-4">
//           <p className="text-xs text-taupe">
//             A couple of quick health questions to help us provide the safest treatment for you:
//           </p>
//           {[
//             { key: 'is_pregnant_or_nursing', text: 'I am currently pregnant or nursing' },
//             { key: 'had_recent_surgery', text: 'I have had surgery or a medical procedure in the last 6 months' },
//           ].map(item => (
//             <label key={item.key} className="flex gap-3 items-center cursor-pointer group">
//               <input
//                 type="checkbox"
//                 {...register(item.key as keyof BeautyForm)}
//                 className="w-4 h-4 accent-brown cursor-pointer shrink-0"
//               />
//               <span className="text-sm text-taupe group-hover:text-brown transition-colors">
//                 {item.text}
//               </span>
//             </label>
//           ))}
//           <div className="pt-1">
//             <label className={label}>Anything else we should know?</label>
//             <textarea
//               {...register('additional_notes')}
//               rows={2}
//               placeholder="Any other health or beauty notes..."
//               className={`${input} resize-none`}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="border border-blush/40 rounded-xl p-5 bg-blush/10">
//         <p className="text-xs text-taupe leading-relaxed mb-4">
//           I confirm that the information provided is accurate. I understand this helps
//           our team provide the safest and most effective treatments tailored to my needs.
//         </p>
//         <label className="flex gap-3 items-start cursor-pointer">
//           <input
//             type="checkbox"
//             {...register('agreed')}
//             className="mt-0.5 w-4 h-4 accent-brown cursor-pointer shrink-0"
//           />
//           <span className="text-sm font-medium text-brown">
//             I confirm the above information is accurate and agree to the terms.
//           </span>
//         </label>
//         {errors.agreed && <p className={`${fieldErr} mt-2`}>{errors.agreed.message}</p>}
//       </div>

//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="w-full bg-brown text-cream font-medium py-3.5 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {isSubmitting ? 'Submitting...' : 'Submit Beauty History'}
//       </button>
//     </form>
//   )
// }

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Consultation() {
  const [activeTab, setActiveTab] = useState<Tab>('preconsult')

  return (
    <section className="min-h-screen bg-cream">
      <div className="relative overflow-hidden bg-blush/30 border-b border-blush/40">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-60 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center fade-up">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">Client Forms</span>
          <h1 className="font-serif text-4xl font-bold text-brown mt-2">Consultation & Consent</h1>
          <p className="text-taupe text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Please fill out the relevant form before your appointment.
            All information is kept strictly confidential.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 fade-up">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-5 rounded-xl border text-center transition-all ${
                activeTab === tab.id
                  ? 'bg-brown border-brown text-cream shadow-md'
                  : 'bg-white border-blush/40 text-taupe hover:border-gold/40 hover:text-brown'
              }`}
            >
              {/* <span className={`text-xs font-bold tracking-widest ${activeTab === tab.id ? 'text-gold' : 'text-blush'}`}>
                {tab.short}
              </span> */}
              <span className="text-xs font-semibold leading-tight">{tab.label}</span>
              <span className={`text-xs leading-tight ${activeTab === tab.id ? 'text-cream/60' : 'text-taupe/60'}`}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-7 md:p-10 fade-up">
          {activeTab === 'preconsult' && <PreConsultationForm />}
          {/* {activeTab === 'beauty' && <BeautyHistoryForm />} */}
        </div>

        <p className="text-center text-xs text-taupe/50 mt-6">
            <FaLock className="inline mr-1" /> Your information is confidential and never shared with third parties.
          </p>
      </div>
    </section>
  )
}