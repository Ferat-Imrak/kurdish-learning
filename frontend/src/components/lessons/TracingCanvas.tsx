"use client"

import { useRef, useState, useEffect } from "react"

export default function TracingCanvas({ glyph, strokeColor = "#E31E24" }: { glyph: string; strokeColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "bold 200px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.globalAlpha = 0.15
    ctx.fillStyle = "#000"
    ctx.fillText(glyph, canvas.width / 2, canvas.height / 2 + 20)
    ctx.globalAlpha = 1
  }, [glyph])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : (e as any).clientX
    const clientY = "touches" in e ? e.touches[0].clientY : (e as any).clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const start = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const move = (e: any) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.lineTo(x, y)
    ctx.lineWidth = 14
    ctx.lineCap = "round"
    ctx.strokeStyle = strokeColor
    ctx.stroke()
  }

  const end = () => {
    setIsDrawing(false)
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-700">Trace the letter: <span className="text-kurdish-red font-bold text-2xl">{glyph}</span></div>
        <button onClick={clear} className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 border">Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full bg-white rounded-2xl shadow border"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
    </div>
  )
}


