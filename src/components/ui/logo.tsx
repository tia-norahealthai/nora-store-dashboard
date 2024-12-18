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
        alt="Nora"
        width={width}
        height={height}
        priority
        className="dark:invert"
      />
    </div>
  )
} 