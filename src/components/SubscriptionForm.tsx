import React, { useState } from 'react'

interface SubscriptionFormProps {}

const SubscriptionForm: React.FC<SubscriptionFormProps> = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Submitted email:', email)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-12 flex flex-wrap gap-4 bg-transparent text-base max-md:mt-10 max-md:max-w-full"
    >
      <div className="grow">
        <label htmlFor="email" className="sr-only">
          Enter your email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-full bg-white px-6 py-4 text-gray-400 max-md:max-w-full max-md:px-5 max-sm:py-2 max-sm:pr-20"
          required
        />
      </div>
      <button
        type="submit"
        className="my-2 whitespace-nowrap rounded-full bg-zinc-800 px-8 py-2.5 text-center text-white max-md:px-5 max-sm:ml-16 max-sm:px-6 max-sm:py-2"
      >
        Subscribe
      </button>
    </form>
  )
}

export default SubscriptionForm
