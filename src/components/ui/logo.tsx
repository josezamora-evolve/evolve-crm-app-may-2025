'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 160, height = 46 }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-blue-600 text-white font-bold rounded ${className}`}>
        <span style={{ width, height }} className="flex items-center justify-center text-lg">
          CRM IA
        </span>
      </div>
    )
  }

  return (
    <Image
      src="/logo.png"
      alt="CRM IA"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
      onError={() => setImageError(true)}
      unoptimized
    />
  )
}
