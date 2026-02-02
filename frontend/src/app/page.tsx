'use client'
// Dummy comment for deploy trigger

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Script from 'next/script'
import Image from 'next/image'
import { 
  Play, BookOpen, Gamepad2, Music, Star, Users, 
  Volume2, Sparkles, Heart, Globe, Award, Clock,
  ArrowRight, CheckCircle, Zap, Target, BookMarked
} from 'lucide-react'
export default function HomePage() {

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Peyvi Kurdish Learning',
    description: 'Interactive Kurdish language learning platform with lessons, games, and stories',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://kurdishlearning.app',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kurdishlearning.app'}/peyvi-logo.png`,
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: '/auth/register',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2500',
    },
  }

  const courseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Kurdish Language Learning Course',
    description: 'Comprehensive Kurdish language course with interactive lessons, games, and cultural content',
    provider: {
      '@type': 'Organization',
      name: 'Peyvi',
      sameAs: process.env.NEXT_PUBLIC_APP_URL || 'https://kurdishlearning.app',
    },
    courseCode: 'KURDISH-101',
    educationalLevel: 'Beginner to Advanced',
    teaches: [
      'Kurdish Alphabet',
      'Kurdish Grammar',
      'Kurdish Vocabulary',
      'Kurdish Pronunciation',
      'Kurdish Culture',
    ],
    inLanguage: ['ku', 'en'],
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Master Kurdish alphabet, grammar, and vocabulary with guided lessons',
      color: 'from-primaryBlue to-accentBlue',
      highlight: 'Audio included'
    },
    {
      icon: Volume2,
      title: 'Audio Pronunciation',
      description: 'Perfect your pronunciation with native speaker audio and voice recognition',
      color: 'from-supportLavender to-brand-purple',
      highlight: 'Native speakers'
    },
    {
      icon: Gamepad2,
      title: 'Fun Games',
      description: 'Learn through engaging games like memory cards and word puzzles',
      color: 'from-brand-green to-supportMint',
      highlight: 'Gamified learning'
    },
    {
      icon: BookMarked,
      title: 'Progress Tracking',
      description: 'Track your learning journey with achievements and personalized insights',
      color: 'from-accentCoral to-brand-orange',
      highlight: 'Smart analytics'
    },
  ]

  const learningMethods = [
    { icon: Target, title: 'Structured Learning', desc: 'Step-by-step curriculum' },
    { icon: Zap, title: 'Quick Sessions', desc: '5-15 minute lessons' },
    { icon: Globe, title: 'Real Context', desc: 'Practical everyday phrases' },
    { icon: Heart, title: 'Cultural Connection', desc: 'Learn about Kurdish culture' }
  ]

  const stats = [
    { icon: Users, label: 'Active Learners', value: '2,500+', color: 'text-primaryBlue' },
    { icon: Star, label: '5-Star Rating', value: '4.9/5', color: 'text-accentCoral' },
    { icon: BookOpen, label: 'Lessons Completed', value: '25,000+', color: 'text-brand-green' },
    { icon: Award, label: 'Success Rate', value: '94%', color: 'text-supportLavender' },
  ]

  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="course-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseStructuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
        {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-brand-green/10 to-supportMint/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/peyvi-logo.png" 
                alt="Peyvi - Kurdish Language Learning App Logo" 
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl md:text-2xl font-heading font-bold bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent tracking-wide">
                Peyvi
              </h1>
              <p className="text-xs md:text-sm text-gray-500 -mt-1 font-medium">Kurdish Learning App</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/auth/login" 
              className="px-4 py-3 min-h-[44px] flex items-center text-base text-primaryBlue font-medium hover:bg-primaryBlue/10 rounded-xl transition-colors whitespace-nowrap"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-3 min-h-[44px] flex items-center text-base bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-medium rounded-xl hover:shadow-md transition-all duration-200 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 pt-8 pb-4 md:pb-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 mb-6">
              <Sparkles className="w-4 h-4 text-accentCoral" />
              <span className="text-base font-medium text-gray-700 leading-[1.5] break-words">Trusted by 2,500+ learners worldwide</span>
            </div>

            <h1 className="text-xl md:text-2xl font-heading font-bold text-textNavy mb-4 leading-[1.5] break-words">
              Learn Kurdish <span className="bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent break-words">The Fun Way</span>
            </h1>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-base text-gray-500 leading-[1.5]"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primaryBlue to-supportLavender border-2 border-white"></div>
                ))}
              </div>
              <span>Join 2,500+ learners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-[420px] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 pt-4 pb-12">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl font-heading font-bold text-textNavy mb-4 leading-[1.5] break-words">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base text-gray-600 leading-[1.5] break-words">
              Choose the plan that works best for you. Start learning today.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full max-h-[70vh] overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl md:rounded-3xl py-2 px-3 md:p-8 border-2 border-gray-200 hover:border-primaryBlue/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex flex-col text-center space-y-2 md:space-y-4">
              <h3 className="text-lg font-heading font-bold text-textNavy leading-[1.5] break-words">Monthly Plan</h3>
              <div>
                <span className="text-2xl font-bold text-textNavy break-words">$4.99</span>
                <span className="text-gray-600 ml-2 text-base break-words">/month</span>
              </div>
              <ul className="space-y-2 md:space-y-4 text-left text-base leading-[1.5]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold break-words">7 days free trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">All interactive lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Access to all games</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Audio pronunciation guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Cancel anytime</span>
                </li>
              </ul>
              <Link
                href="/auth/register?plan=monthly"
                className="w-full px-4 py-3 min-h-[44px] flex items-center justify-center bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-bold text-base rounded-xl hover:shadow-xl transition-all duration-300 text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-h-[70vh] overflow-y-auto bg-gradient-to-br from-primaryBlue/5 to-supportLavender/5 rounded-xl md:rounded-3xl pt-6 pb-2 px-3 md:p-8 border-2 border-primaryBlue shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {/* Popular Badge */}
            <div className="absolute top-2 md:top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="px-2 md:px-3 py-0.5 bg-gradient-to-r from-accentCoral to-brand-orange text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                BEST VALUE
              </span>
            </div>
            <div className="flex flex-col text-center space-y-2 md:space-y-4 mt-4 md:mt-6">
              <h3 className="text-lg font-heading font-bold text-textNavy leading-[1.5] break-words">Yearly Plan</h3>
              <div>
                <span className="text-2xl font-bold text-textNavy break-words">$49.99</span>
                <span className="text-gray-600 ml-2 text-base break-words">/year</span>
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full break-words">
                  2 months free
                </span>
              </div>
              <ul className="space-y-2 md:space-y-4 text-left text-base leading-[1.5]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-semibold break-words">7 days free trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">All interactive lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Access to all games</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Audio pronunciation guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 break-words">Cancel anytime</span>
                </li>
              </ul>
              <Link
                href="/auth/register?plan=yearly"
                className="w-full px-4 py-3 min-h-[44px] flex items-center justify-center bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-bold text-base rounded-xl hover:shadow-xl transition-all duration-300 text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-base text-gray-600 mb-2 leading-[1.5] break-words">
            <CheckCircle className="w-5 h-5 text-brand-green inline mr-2" />
            Start with a free trial • Secure checkout
          </p>
          <p className="text-base text-gray-500 leading-[1.5] break-words">
            Questions? Email us at support@kurdishlearning.app
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 pt-4 pb-4 md:pt-8 md:pb-8">
        <div className="text-center mb-8 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl font-heading font-bold text-textNavy mb-4 leading-[1.5] break-words">
              Why Choose Peyvi?
            </h2>
            <p className="text-base text-gray-600 leading-[1.5] break-words">
              Experience Kurdish learning like never before
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative w-full max-h-[70vh] overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl md:rounded-3xl py-2 px-3 md:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-4">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                
                <div className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gradient-to-r from-accentCoral/10 to-brand-orange/10 text-accentCoral text-xs font-medium rounded-full">
                  {feature.highlight}
                </div>
                
                <h3 className="text-lg font-heading font-bold text-textNavy text-center leading-[1.5] break-words">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-gray-600 text-center leading-[1.5] break-words">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 pt-4 pb-12">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-center text-textNavy mb-8 leading-[1.5] break-words">Loved by learners and families</h2>
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
          {[{
            name: 'Morgan', role: 'Beginner Learner', quote: 'I learned everyday phrases in a week. The games make it stick.'
          },{
            name: 'Dilan', role: 'Parent', quote: 'Short, fun sessions my kids actually ask for.'
          },{
            name: 'Sara', role: 'Heritage Speaker', quote: 'Clear pronunciation and simple steps helped me build confidence.'
          }].map((t) => (
            <div key={t.name} className="w-full max-h-[70vh] overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl py-2 px-3 md:p-6 border border-gray-100">
              <div className="flex flex-col space-y-2 md:space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryBlue/20 text-primaryBlue font-bold flex items-center justify-center flex-shrink-0">{t.name.slice(0,1)}</div>
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-textNavy leading-[1.5] break-words">{t.name}</div>
                    <div className="text-base text-gray-500 leading-[1.5] break-words">{t.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400" aria-label={`${t.name} rating`}>
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-base text-gray-700 leading-[1.5] break-words">"{t.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[420px] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-center text-textNavy mb-8 leading-[1.5] break-words">Frequently asked questions</h2>
        <div className="space-y-4">
          {[{
            q: 'Do you offer a free trial?', a: 'Yes. Start with a free trial to explore all lessons and games. Choose a plan to continue learning and save your progress.'
          },{
            q: 'What content is available?', a: 'The app offers comprehensive Kurdish language lessons, games, and stories. More content is added regularly.'
          },{
            q: 'Does it work on phones and tablets?', a: 'Yes. It\'s a PWA and works on desktop, tablet, and mobile.'
          },{
            q: 'How much time should I spend daily?', a: '10–15 minutes a day is enough to make steady progress.'
          },{
            q: 'Do I need prior knowledge?', a: 'No. It\'s designed for complete beginners and heritage learners alike.'
          }].map((item) => (
            <div key={item.q} className="w-full max-h-[70vh] overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl py-2 px-3 md:p-5 border border-gray-100">
              <div className="flex flex-col space-y-2">
                <div className="text-lg font-semibold text-textNavy leading-[1.5] break-words">{item.q}</div>
                <div className="text-base text-gray-600 leading-[1.5] break-words">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="max-w-[420px] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 pb-16">
        <div className="w-full max-h-[70vh] overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl md:rounded-3xl py-2 px-3 md:p-8 border border-gray-100">
          <div className="flex flex-col text-center space-y-3 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-textNavy leading-[1.5] break-words">Start learning Kurdish today</h3>
            <p className="text-base text-gray-600 leading-[1.5] break-words">Choose your plan, explore lessons, and track your progress.</p>
            <div className="flex flex-col md:flex-row md:justify-center gap-3">
              <Link href="/auth/register" className="w-full md:w-auto md:px-6 px-4 py-3 min-h-[44px] flex items-center justify-center bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-bold text-base rounded-xl hover:shadow-xl transition-all duration-300 text-center">Get Started</Link>
              <Link href="/auth/login" className="w-full md:w-auto md:px-6 px-4 py-3 min-h-[44px] flex items-center justify-center border-2 border-primaryBlue text-primaryBlue font-semibold text-base rounded-xl hover:bg-primaryBlue/10 transition-all duration-300 text-center break-words">I already have an account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 bg-gradient-to-br from-primaryBlue/5 to-supportLavender/5 py-12 md:py-20">
        <div className="max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-xl md:text-2xl font-heading font-bold text-textNavy mb-4 leading-[1.5] break-words">
              Join Our Growing Community
            </h2>
            <p className="text-base text-gray-600 leading-[1.5] break-words">
              Real results from real learners
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-full max-h-[70vh] overflow-y-auto text-center bg-white/80 backdrop-blur-sm rounded-xl md:rounded-3xl py-2 px-3 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col items-center space-y-2 md:space-y-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 flex items-center justify-center">
                    <stat.icon className={`w-7 h-7 md:w-8 md:h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-xl font-heading font-bold ${stat.color} leading-[1.5] break-words`}>
                    {stat.value}
                  </div>
                  <div className="text-base text-gray-600 font-medium leading-[1.5] break-words">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-textNavy to-primaryBlue text-white py-12 md:py-16">
        <div className="max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden">
                <Image 
                  src="/peyvi-logo.png"
                  alt="Peyvi - Kurdish Language Learning App Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent tracking-wide break-words">
                Peyvi
              </h3>
            </div>
            <p className="text-base text-white/80 mb-8 leading-[1.5] break-words">
              Making Kurdish language learning fun, accessible, and effective for learners worldwide.
            </p>
            
            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row md:justify-center gap-3 mb-8"
            >
              <Link 
                href="/auth/register"
                className="group w-full md:w-auto md:px-8 px-4 py-3 min-h-[44px] flex items-center justify-center gap-2 bg-white text-textNavy font-bold text-base rounded-xl hover:bg-white/90 transition-all duration-300 shadow-xl"
              >
                <span className="break-words">Start Learning Today</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
              <Link 
                href="/auth/login"
                className="w-full md:w-auto md:px-8 px-4 py-3 min-h-[44px] flex items-center justify-center border-2 border-white/30 text-white font-semibold text-base rounded-xl hover:bg-white/10 transition-all duration-300 break-words"
              >
                Already have an account?
              </Link>
            </motion.div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="text-white/70 text-base leading-[1.5] break-words">
                © 2024 Peyvi. All rights reserved.
              </div>
              <div className="flex justify-center gap-6">
                <Link href="/privacy" className="text-white/70 hover:text-white transition-colors text-base leading-[1.5] break-words">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-white/70 hover:text-white transition-colors text-base leading-[1.5] break-words">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

