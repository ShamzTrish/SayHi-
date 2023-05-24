import AddFriendButton from '@/components/AddFriendButton'
import { FC } from 'react'

interface pageProps {
  
}

const page: FC<pageProps> = ({}) => {
  return <section className='pt-8'>
    <h1 className='font-bold text-5xl mb-8'>Add your Friend!</h1>
    <AddFriendButton/>
  </section>
}

export default page