import { createFileRoute } from '@tanstack/react-router'
import StickHero from '@/components/unity/stick_hero'

export const Route = createFileRoute('/unity_game')({
  component: UnityGame
})

function UnityGame() {
  return <StickHero />
}
