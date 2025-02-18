import React from 'react'

interface ContributorProps {
  name: string
  role: string
  imageSrc: string
}

const ContributorCard: React.FC<ContributorProps> = ({
  name,
  role,
  imageSrc
}) => {
  return (
    <div className="flex w-3/12 flex-col max-md:ml-0 max-md:w-full">
      <div className="flex w-full grow flex-col max-md:mt-6">
        <img
          loading="lazy"
          src={imageSrc}
          className="aspect-square w-24 self-center rounded-full object-contain"
          alt={name}
        />
        <div className="mt-4 flex flex-col items-center px-14 py-1 text-center leading-none max-md:px-5">
          <div className="text-base font-semibold text-black">{name}</div>
          <div className="mt-3 text-sm text-black">{role}</div>
        </div>
        Continuing from where we left off:
        <div className="mt-4 flex w-full flex-col items-center px-16 max-md:px-5">
          <div className="flex w-[46px] gap-4">
            <a href="#" aria-label={`${name}'s LinkedIn profile`}>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6023beb7f699830c36faac6f5d9146f78c24e386652d2086d7ce577bf7690166?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                className="aspect-square w-4 shrink-0 object-contain"
                alt=""
              />
            </a>
            <a href="#" aria-label={`${name}'s Twitter profile`}>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/bae1b862d7f908d3ebee79e447c021f857602b14dc875aa4c0e914640a0ed25a?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                className="aspect-[0.87] w-3.5 shrink-0 object-contain"
                alt=""
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const contributors: ContributorProps[] = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Dermatologist',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/2e65b0dcdc3b8ca5ea7a4aa83f08fad10da90952eaec0f5779b08f40e8512dbd?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e'
  },
  {
    name: 'Emma White',
    role: 'Cosmetic Chemist',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/4fb6cca1f661064fcc6733871622f79f8497c9beb9c8180adb4e8b7d7a8dbab5?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e'
  },
  {
    name: 'Dr. James Lee',
    role: 'Research Scientist',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/b97caf94367fdfde569b5baad4c02c5cb564754f847c94547d80bcd3fe2bf34f?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e'
  },
  {
    name: 'Maria Garcia',
    role: 'Esthetician',
    imageSrc:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/fb65db71178dd78a44df8c7702450acdf11ac81f98e2019da6ca600ea3187688?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e'
  }
]

const ExpertContributors: React.FC = () => {
  return (
    <div className="flex w-full max-w-screen-xl flex-col px-4 py-12 max-md:max-w-full">
      <h2 className="self-start text-2xl font-semibold leading-none text-black">
        Meet Our Expert Contributors
      </h2>
      <div className="mt-10 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          {contributors.map((contributor, index) => (
            <ContributorCard key={index} {...contributor} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExpertContributors
