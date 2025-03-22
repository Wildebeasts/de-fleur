import React from 'react'

interface SocialIconsProps {
  icons: string[]
}

const SocialIcons: React.FC<SocialIconsProps> = ({ icons = [] }) => {
  return (
    <div className="mt-9 flex w-full gap-4 bg-transparent pr-14 max-md:pr-5">
      {icons.map((icon, index) => (
        <div
          key={index}
          className="flex min-h-[16px] items-center justify-center overflow-hidden"
        >
          <img
            loading="lazy"
            src={icon}
            className="my-auto aspect-square w-4 self-stretch object-contain"
            alt={`Social media icon ${index + 1}`}
          />
        </div>
      ))}
    </div>
  )
}

export default SocialIcons
