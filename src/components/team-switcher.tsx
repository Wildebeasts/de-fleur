import logo from '@/assets/logos/applogo.png'

export function TeamSwitcher() {
  return (
    <div className="flex items-center gap-2 p-2">
      {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
      <div className="bg-sidebar-muted flex size-8 items-center justify-center rounded-lg">
        <img
          src={logo}
          alt="De Fleur Logo"
          className="size-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">Cursus</span>
        <span className="text-xs text-muted-foreground">Enterprise</span>
      </div>
    </div>
  )
}
