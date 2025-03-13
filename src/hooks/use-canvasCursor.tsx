import { useEffect } from 'react'

const useCanvasCursor = (enabled = true) => {
  useEffect(() => {
    // If not enabled, don't initialize the cursor effect
    if (!enabled) return

    // Canvas and context variables
    let ctx: CanvasRenderingContext2D | null = null
    let isRunning = true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let frame = 1
    const pos = { x: 0, y: 0 }
    let lines: Line[] = []

    // Configuration
    const config = {
      friction: 0.5,
      trails: 15, // Reduced for a more subtle effect
      size: 40, // Slightly smaller size
      dampening: 0.25,
      tension: 0.98
    }

    // Wave function for color animation
    class Wave {
      phase: number
      offset: number
      frequency: number
      amplitude: number
      value: number

      constructor(options: {
        phase?: number
        offset?: number
        frequency?: number
        amplitude?: number
      }) {
        this.phase = options.phase || 0
        this.offset = options.offset || 0
        this.frequency = options.frequency || 0.001
        this.amplitude = options.amplitude || 1
        this.value = 0
      }

      update() {
        this.phase += this.frequency
        this.value = this.offset + Math.sin(this.phase) * this.amplitude
        return this.value
      }
    }

    // Node class for trail points
    class Node {
      x: number = 0
      y: number = 0
      vx: number = 0
      vy: number = 0
    }

    // Line class for cursor trails
    class Line {
      spring: number
      friction: number
      nodes: Node[]

      constructor(options: { spring?: number } = {}) {
        this.spring = (options.spring || 0.45) + 0.1 * Math.random() - 0.02
        this.friction = config.friction + 0.01 * Math.random() - 0.002
        this.nodes = []

        for (let i = 0; i < config.size; i++) {
          const node = new Node()
          node.x = pos.x
          node.y = pos.y
          this.nodes.push(node)
        }
      }

      update() {
        let spring = this.spring
        const firstNode = this.nodes[0]

        firstNode.vx += (pos.x - firstNode.x) * spring
        firstNode.vy += (pos.y - firstNode.y) * spring

        for (let i = 0; i < this.nodes.length; i++) {
          const node = this.nodes[i]

          if (i > 0) {
            const prevNode = this.nodes[i - 1]
            node.vx += (prevNode.x - node.x) * spring
            node.vy += (prevNode.y - node.y) * spring
            node.vx += prevNode.vx * config.dampening
            node.vy += prevNode.vy * config.dampening
          }

          node.vx *= this.friction
          node.vy *= this.friction
          node.x += node.vx
          node.y += node.vy

          spring *= config.tension
        }
      }

      draw() {
        if (!ctx) return

        const x = this.nodes[0].x
        const y = this.nodes[0].y

        ctx.beginPath()
        ctx.moveTo(x, y)

        for (let i = 1; i < this.nodes.length - 2; i++) {
          const node = this.nodes[i]
          const nextNode = this.nodes[i + 1]

          const xc = (node.x + nextNode.x) * 0.5
          const yc = (node.y + nextNode.y) * 0.5

          ctx.quadraticCurveTo(node.x, node.y, xc, yc)
        }

        const i = this.nodes.length - 2
        const lastNode = this.nodes[i]
        const finalNode = this.nodes[i + 1]

        ctx.quadraticCurveTo(lastNode.x, lastNode.y, finalNode.x, finalNode.y)
        ctx.stroke()
        ctx.closePath()
      }
    }

    // Initialize lines
    function initLines() {
      lines = []
      for (let i = 0; i < config.trails; i++) {
        lines.push(new Line({ spring: 0.4 + (i / config.trails) * 0.025 }))
      }
    }

    // Handle mouse/touch movement
    function handleMouseMove(e: MouseEvent | TouchEvent) {
      if ('touches' in e) {
        pos.x = e.touches[0].clientX
        pos.y = e.touches[0].clientY
      } else {
        pos.x = e.clientX
        pos.y = e.clientY
      }
      e.preventDefault()
    }

    // Handle touch start
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        pos.x = e.touches[0].clientX
        pos.y = e.touches[0].clientY
      }
    }

    // Resize canvas to match window size
    function resizeCanvas() {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    // Animation render loop
    function render() {
      if (!isRunning || !ctx) return

      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.globalCompositeOperation = 'lighter'

      // Get the color value from the wave
      const hue = colorWave.update()

      // Create a soft, earthy green color that matches the site's theme
      // Using the olive/sage green from your site's color scheme
      const baseHue = 100 // Green base
      const mappedHue = baseHue + (hue % 20) // Small variation around the green

      // Soft, earthy green with low opacity
      ctx.strokeStyle = `hsla(${mappedHue}, 40%, 40%, 0.2)`
      ctx.lineWidth = 1.2

      for (let i = 0; i < config.trails; i++) {
        const line = lines[i]
        line.update()
        line.draw()
      }

      frame++
      window.requestAnimationFrame(render)
    }

    // Initialize canvas and start animation
    function initCanvas() {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement
      if (!canvas) return

      ctx = canvas.getContext('2d')
      if (!ctx) return

      isRunning = true
      frame = 1

      resizeCanvas()
      initLines()
      render()
    }

    // Create color wave with parameters that match your site's color scheme
    const colorWave = new Wave({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 10, // Small amplitude for subtle color changes
      frequency: 0.001, // Slower frequency for more gradual changes
      offset: 100 // Center around green hues
    })

    // Set up event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleMouseMove, { passive: false })
    document.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('resize', resizeCanvas)

    // Handle visibility changes
    window.addEventListener('focus', () => {
      isRunning = true
      render()
    })

    window.addEventListener('blur', () => {
      isRunning = false
    })

    // Initialize
    initCanvas()

    // Cleanup on unmount
    return () => {
      isRunning = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('focus', () => {
        isRunning = true
        render()
      })
      window.removeEventListener('blur', () => {
        isRunning = false
      })
    }
  }, [enabled])

  return null
}

export default useCanvasCursor
