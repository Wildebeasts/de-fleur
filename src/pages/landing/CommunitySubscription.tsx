import React from 'react'
import SubscriptionForm from '../../components/SubscriptionForm'
import FeatureList from '../../components/FeatureList'

interface CommunitySubscriptionProps {}

const CommunitySubscription: React.FC<CommunitySubscriptionProps> = () => {
  return (
    <div className="flex flex-col justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-8 py-24 max-md:px-4">
      <div className="flex flex-col items-center px-8 max-md:max-w-full max-md:px-4">
        <div className="flex w-full max-w-3xl flex-col py-1">
          {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
          <h1 className="animate-fade-in z-10 self-center text-center text-6xl font-bold leading-tight text-zinc-800">
            Join Our Community
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xl leading-relaxed text-zinc-600">
            Subscribe to receive skincare tips, exclusive offers, and early
            access to new products.
          </p>
          <div className="mt-4 transition-all duration-300 hover:scale-105">
            <SubscriptionForm />
          </div>
          <div className="mt-8 transition-all duration-300 hover:scale-105">
            <FeatureList />
          </div>
          <p className="mt-8 self-center text-center text-sm leading-relaxed text-gray-500">
            By subscribing, you agree to our
            <a
              href="/privacy-policy"
              className="ml-1 text-zinc-800 underline transition-colors hover:text-zinc-600"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CommunitySubscription
