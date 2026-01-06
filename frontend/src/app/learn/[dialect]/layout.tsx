// Generate static params for static export
export async function generateStaticParams() {
  return [
    { dialect: 'kurmanji' },
    { dialect: 'sorani' },
  ]
}

export default function DialectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


