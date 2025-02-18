import React from 'react'

interface NextStep {
  icon: string
  title: string
  description: string
  buttonText: string
  buttonClass: string
}

const nextSteps: NextStep[] = [
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/c8a4e95fc9026ff1d73f2ddee2e383146d20732afd552bca1a5b2e905c38a5e0?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Create Account',
    description: 'Save your results and track progress',
    buttonText: 'Sign Up',
    buttonClass: 'bg-rose-300'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/4d19914477da726364842d6c8201f9f1d16de8d0459c0d18e087f106fea444b7?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Consultation',
    description: 'Book a free skincare consultation',
    buttonText: 'Schedule',
    buttonClass: 'border-stone-300'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/7297c0a84b0357c13751a66337a6475b6b21284cd2168611fc3e0164e367e755?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
    title: 'Explore More',
    description: 'Browse alternative products',
    buttonText: 'Browse',
    buttonClass: 'border-zinc-800'
  }
]

export const NextSteps: React.FC = () => {
  return (
    <div className="mt-12 flex w-full flex-col rounded-xl bg-white p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.1)] max-md:mt-10 max-md:max-w-full max-md:px-5">
      <h2 className="pb-2 pt-px text-2xl text-black max-md:max-w-full max-md:pr-5">
        Next Steps
      </h2>
      <div className="mt-6 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          {nextSteps.map((step, index) => (
            <div
              key={index}
              className="flex w-[33%] flex-col max-md:ml-0 max-md:w-full"
            >
              <div className="mx-auto flex w-full flex-col items-center rounded-lg border border-solid p-6 max-md:mt-6 max-md:px-5">
                <div className="flex min-h-[30px] w-[38px] items-center justify-center overflow-hidden">
                  <img
                    loading="lazy"
                    src={step.icon}
                    className="my-auto aspect-square w-[30px] self-stretch object-contain"
                    alt=""
                  />
                </div>
                <h3 className="text-center text-lg leading-none text-black">
                  {step.title}
                </h3>
                <p className="mt-5 text-center text-sm leading-none text-black">
                  {step.description}
                </p>
                <button
                  className={`mt-6 self-stretch whitespace-nowrap rounded-lg border border-solid px-16 pb-5 pt-3 text-center text-base text-black ${step.buttonClass} max-md:px-5`}
                >
                  {step.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
