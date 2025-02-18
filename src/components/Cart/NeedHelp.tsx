import React from 'react'

const NeedHelp: React.FC = () => {
  return (
    <div className="mt-6 flex w-full flex-col justify-center rounded-lg bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex w-full gap-2 py-1">
        <div className="flex min-h-[16px] items-center justify-center self-start overflow-hidden">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e489028c2e73abcd60a016d3e378fbbe2b0a64db00e016a2b97329fb6598f583?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
            alt=""
            className="my-auto aspect-square w-4 self-stretch object-contain"
          />
        </div>
        <div className="w-[357px] flex-auto text-xs leading-none text-black">
          <span className="text-base text-gray-600">Need Help?</span>
          <a href="#" className="text-base text-rose-300">
            {' '}
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default NeedHelp
