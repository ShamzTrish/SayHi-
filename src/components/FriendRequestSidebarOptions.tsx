'use client'

import { pusherClient } from '@/libraries/pusher'
import { toPusherKey } from '@/libraries/utilities'
import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface FriendRequestSidebarOptionsProps {
  sessionId: string,
  initialUnseenRequestCount: number
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({ initialUnseenRequestCount, sessionId }) => {

  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    // initialUnseenRequestCount we will have to pass it from the parent. We have to fetch the data from the parent (server)component 
    initialUnseenRequestCount
  )

  useEffect(() => {
    // here we are telling pusher to listen and listen for anything that happens in the incoming_friend_requests server database 'file'
    // the only thing with pusher is that it doesnt allow : semicolons so we created a helper function in the utilities  called toPusherKey
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))


    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1)
    }
    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1)
    }

    // with bind() we are saying that anytime when on pusherClient.subscribe event occourse 
    pusherClient.bind('incoming_friend_requests', friendRequestHandler)
    pusherClient.bind('new_friend', addedFriendHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
      pusherClient.unbind('new_friend', addedFriendHandler)
    }
  }, [sessionId])

  return <Link href='/dashboard/requests' className='text-grey-700 hover:text-indigo-600 hover:bg-gray50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
    <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
      <User className='h-4 w-4' />
    </div>
    <p className='truncate'>Friend requests</p>

    {unseenRequestCount > 0 ? (
      <div className='rounded-full h-5 w-5 text-xs flex justify-center items-center text-white bg-indigo-600'>
        {unseenRequestCount}
      </div>
    ) : null}

  </Link>
}
export default FriendRequestSidebarOptions