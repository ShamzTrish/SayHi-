'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FC } from 'react'

interface pageProps {

}

const Page: FC<pageProps> = ({ }) => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return null
}

export default Page