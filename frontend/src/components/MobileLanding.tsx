'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Volume2, Gamepad2, BookMarked, 
  ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react'

export default function MobileLanding() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const testimonials = [
    {
      name: 'Morgan',
      role: 'Beginner Learner',
      quote: 'I learned everyday phrases in a week. The games make it stick.',
    },
    {
      name: 'Dilan',
      role: 'Parent',
      quote: 'Short, fun sessions my kids actually ask for.',
    },
    {
      name: 'Sara',
      role: 'Heritage Speaker',
      quote: 'Clear pronunciation and simple steps helped me build confidence.',
    },
  ]

  const features = [
    {
      icon: Volume2,
      title: 'Audio Pronunciation',
      description: 'Perfect your pronunciation with native speaker audio',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Gamepad2,
      title: 'Fun Games',
      description: 'Learn through engaging games and word puzzles',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BookMarked,
      title: 'Progress Tracking',
      description: 'Track your learning journey with achievements',
      color: 'from-blue-500 to-cyan-500',
    },
  ]

  const faqs = [
    {
      q: 'Do you offer a free trial?',
      a: 'Yes. Start with a free trial to explore all lessons and games. Choose a plan to continue learning and save your progress.',
    },
    {
      q: 'Which dialects are covered?',
      a: 'The app currently focuses on Kurdish (Kurmanji). More content will be added over time.',
    },
    {
      q: 'How much time should I spend daily?',
      a: '10–15 minutes a day is enough to make steady progress.',
    },
    {
      q: 'Do I need prior knowledge?',
      a: 'No. It\'s designed for complete beginners and heritage learners alike.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="px-5 pt-8 pb-6">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              Learn Kurdish the Fun Way
            </h1>
            <p className="text-base text-gray-600 mb-4">
              Interactive lessons, games, and stories for all levels
            </p>
            
            {/* Rating */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-base font-semibold text-gray-900">4.9</span>
            </div>

            {/* CTA Button */}
            <Link
              href="/auth/register"
              className="block w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center active:scale-[0.98] transition-all duration-200"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-5 py-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-5">
          Simple Pricing
        </h2>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedPlan === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Pricing Card */}
        <motion.div
          key={selectedPlan}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 border border-gray-200/50 relative"
        >
          {selectedPlan === 'yearly' && (
            <div className="absolute top-4 right-4">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Best Value
              </span>
            </div>
          )}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {selectedPlan === 'monthly' ? '$4.99' : '$49.99'}
            </div>
            <div className="text-gray-600">
              {selectedPlan === 'monthly' ? 'per month' : 'per year'}
            </div>
            {selectedPlan === 'yearly' && (
              <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                2 months free
              </div>
            )}
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">7 days free trial</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">All interactive lessons</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">Access to all games</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">Audio pronunciation guides</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">Progress tracking</span>
            </li>
          </ul>

          <Link
            href={`/auth/register?plan=${selectedPlan}`}
            className="block w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center active:scale-[0.98] transition-all duration-200"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-5 py-6">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          Why Choose Peyvi?
        </h2>

        <div className="space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200/40 border border-gray-200/50"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0 shadow-md shadow-gray-400/20`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-5 py-6">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          Loved by Learners
        </h2>

        <div className="relative">
          <motion.div
            key={testimonialIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-6 shadow-sm shadow-gray-200/40 border border-gray-200/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                {testimonials[testimonialIndex].name[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {testimonials[testimonialIndex].name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonials[testimonialIndex].role}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed">
              "{testimonials[testimonialIndex].quote}"
            </p>
          </motion.div>

          {/* Swipe Indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setTestimonialIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === testimonialIndex
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-5 py-6">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200/50 shadow-sm shadow-gray-200/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.q}
                </span>
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-8 pb-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center shadow-lg shadow-blue-500/30">
          <h3 className="text-xl font-bold text-white mb-3">
            Start learning Kurdish today
          </h3>
          <Link
            href="/auth/register"
            className="inline-block w-full h-14 bg-white text-blue-600 font-bold text-lg rounded-2xl shadow-md shadow-gray-400/20 flex items-center justify-center active:scale-[0.98] transition-all duration-200 mt-4"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}

