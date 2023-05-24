'use client'

import { pusherClient } from '@/libraries/pusher'
import { cn, toPusherKey } from '@/libraries/utilities'
import { Message } from '@/libraries/validations/message'
import { format } from 'date-fns'
import Image from 'next/image'
import { FC, useEffect, useRef, useState } from 'react'

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatPartner: User
    chatId: string
}

const Messages: FC<MessagesProps> = ({ initialMessages, sessionId, chatPartner, sessionImg, chatId }) => {

    const [ourMessages, setOurMessages] = useState<Message[]>(initialMessages) // this state will allow us to directly show the user a new message when the chat is open instead of having to refresh the page 

    // --------------------
    // listening to realtime events - 6h26m
    useEffect(() => {
        // here we are telling pusher to listen and listen for anything that heppanes in the incoming friend requests 'file'
        pusherClient.subscribe(toPusherKey(`chat:${chatId}`))  // the only thing with pusher is that it doesnt allow : semicolons so we created a helper function in the utilities  called toPusherKey


        // now you have to say what needs to happen when there is a change in the incoming friend requests
        const messageHandler = (messageData: Message) => {
            // we just want to add + 1 request to hsow in the icon in real time
            setOurMessages((prev) => [messageData, ...prev])  //you want to add the message to the beggining of the array because we already implemented flex-col-reverse so everything is already turned upside down
        }

        // here are naming a function incoming-message , trigger a function messageHandler
        pusherClient.bind('incoming-message', messageHandler)

        // you have to clean up after yourself and if you subscribe to something you also have to unsubscribe and same for the bind - you have to unbind 
        return () => {
            pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
            pusherClient.unbind('incoming-message', messageHandler)
        }
    })


    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    // this package date-fns just helps us make the timestamp look nice, you can choose whatever, we choose something like 14:07
    const formatTimestamp = (timestamp: number) => {
        return format(timestamp, 'HH:mm')
    }

    // some of those are our custom classes defined in globals.css
    return <div id='messages' className='flex h-full flex-1 flex-col-reverse p-3 gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
        <div ref={scrollDownRef} />

        {ourMessages.map((oneMsg, index) => {
            // we first need to check who is sending the message, because we either want to display it on the rights side or on the left side.  
            // so we check if the id of the person sending the message is same as the id of the person ucrrently logged in
            const isCurrentUser = oneMsg.senderId === sessionId

            // so next we want ot show a little profile picture next to the messages sent, but if the user sents more messages, you want to show the picture only on the last message and not all of them
            // so we need to know if there is a next message from the same user 

            const hasNextMessageFromSameUser = ourMessages[index - 1]?.senderId === ourMessages[index].senderId
            // ourMessages[index - 1]?.senderId: This part accesses the senderId of the previous chat message (i.e., the chat message at the index one less than the current index). The ?. is the optional chaining operator, which ensures that if ourMessages[index - 1] is undefined, the expression returns undefined rather than causing an error.
            // ourMessages[index].senderId: This part accesses the senderId of the current chat message
            // hasNextMessageFromSameUser: This variable is a boolean that indicates whether the current chat message has a previous message from the same sender. It will be true if the senderId of the previous message is the same as the senderId of the current message, and false otherwise.

            return <div key={`${oneMsg.id}-${oneMsg.timestamp}`} className='chat-message'>
                {/* cn is our helper function for merging classes with tailwind, so only if isCurrentUser is true the 'justify-end' class will be added, otherwise be default it's 'justify-start' */}
                <div className={cn('flex items-end', { 'justify-end': isCurrentUser })}>
                    <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2',
                        {
                            'order-1 items-end': isCurrentUser,
                            'order-2 items-start': !isCurrentUser
                        })}>
                        <span className={cn('px-4 py-2 rounded-lg inline-block',
                            {
                                'bg-indigo-600 text-white': isCurrentUser,
                                'bg-gray-200 text-gray-900': !isCurrentUser,
                                'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                                'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser
                            })}>
                            {oneMsg.text}{' '}
                            <span className='ml-2 text-xs text-gray-400'>
                                {formatTimestamp(oneMsg.timestamp)}
                            </span>
                        </span>
                    </div>
                    <div className={cn('relative w-6 h-6',
                        {
                            'order-2': isCurrentUser,
                            'order-1': !isCurrentUser,
                            'invisible': hasNextMessageFromSameUser,
                        }
                    )}>
                        {/* so either it will be your own image or it will be image of your chat partner */}
                        <Image fill src={isCurrentUser ? (sessionImg as string) : chatPartner.image} alt='Profile picture' referrerPolicy='no-referrer' className='rounded-full' />

                    </div>
                </div>
            </div>
        })}

    </div >
}

export default Messages