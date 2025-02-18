import React from 'react'

const SecurityInfo: React.FC = () => {
  return (
    <div className="mb-0 flex w-full flex-col justify-center bg-white px-20 py-px max-md:mb-2.5 max-md:max-w-full max-md:px-5">
      <div className="flex w-full flex-col justify-center px-4 py-6 max-md:max-w-full">
        <div className="flex w-full flex-wrap justify-between gap-5 max-md:max-w-full">
          <div className="flex gap-4 py-0.5">
            <div className="flex min-h-[16px] items-center justify-center self-start overflow-hidden">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/badb64e878243873698f64e2a2321e362a6d5be456aa846cc2cee59f8a61d6e8?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                alt=""
                className="my-auto aspect-square w-4 self-stretch object-contain"
              />
            </div>
            <div className="basis-auto text-sm leading-none text-black">
              Secure Shopping
            </div>
          </div>
          <div className="flex gap-4 py-0.5">
            <div className="flex min-h-[16px] items-center justify-center self-start overflow-hidden">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/9576163263ed85d8dd769d045e28d416eb9653657cd6d82df756c04b5f0b1af4?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                alt=""
                className="my-auto aspect-[1.12] w-[18px] self-stretch object-contain"
              />
            </div>
            <div className="basis-auto text-sm leading-none text-black">
              256-bit SSL Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityInfo
