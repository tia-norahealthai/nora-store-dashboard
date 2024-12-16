import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 120, height = 40 }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/nora-logo.svg"
        alt="Nora Logo"
        width={width}
        height={height}
        priority
      />
    </div>
  )
} 