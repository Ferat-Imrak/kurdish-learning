// Generate static params for static export
export async function generateStaticParams() {
  return [
    { lessonId: '1' },
    { lessonId: '2' },
    { lessonId: '3' },
    { lessonId: '4' },
    { lessonId: '5' },
    { lessonId: '6' },
    { lessonId: '7' },
    { lessonId: '8' },
    { lessonId: '9' },
    { lessonId: '10' },
  ]
}

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


