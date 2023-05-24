'use client'

import { pusherClient } from '@/libraries/pusher'
import { chatHrefConstructor, toPusherKey } from '@/libraries/utilities'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatlistProps {
    friends: User[]
    sessionId: string
}

//since we want to implement real time functionality for showing notification when user recieves a message ,we are passing message itself and sender name and image into a function for pusher - chatHandler
// and because it is kinda 'extended message' of the image and name we have to create a typescript type for it
interface ExtendedMessage extends Message {
    senderImg: string
    senderName: string
}

const SidebarChatlist: FC<SidebarChatlistProps> = ({ friends, sessionId }) => {
    // we wanna show a little number icon (same as when you add a friend) to see how many unseen messages you have with the friend. to do that we first need to find out how many unseen messages we actually have from that person

    const router = useRouter() //we need this to find out if the user has already seen the messages. how we find out? we check using useRouter if the user nas already navigated to the specific chat url - since every chat has different id we are able to determin what chas he has seen
    const pathname = usePathname()  //this also comes from next/navigation and it will be a relative path ('/dashboard/add' etc aand not the whole localhost3000:)

    //these are only unseen messsages what you recieve while you are online, not since you are offline, for that you would need to implement different functionality
    // it will be initilized as an empty array so we can push any unseen messages coming during the period while the user is active on the page 
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    //to better handle refreshing the page we will keep users in a state
    const [activeChats, setActiveChats] = useState<User[]>(friends)


    // to find out if the path - the url - has been checked we will run useEffect 
    // we will run this useEffect everytime the pathname changes - that's why it's in the dependecies 
    useEffect(() => {
        // so we check if the url includes 'chat' then we execute the rest 
        if (pathname?.includes('chat')) {
            // here you want to take the messages that the user has already seen out of the state
            // so first you need to get access to the messages whatever they were previously and then you're going to return the filtered versiou of that
            setUnseenMessages((prev) => {
                return prev.filter((oneMsg) => {
                    return !pathname.includes(oneMsg.senderId)
                    // ?? this is the way we figure out if the user has seen the messages or not. if they are on the corresponding chat then we will take them out of the state because they have seen the messages
                })
            })
        }
    }, [pathname])

    // --------------------------------
    // adding real time notification for when a user recieves a message
    useEffect(() => {
        // you're listening in the chats that the user has  
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))

        // we will also subscribe to all of the person's friends
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = (newFriend: User) => {
            router.refresh()  //this doesnt work properly
            setActiveChats((prev) => [...prev, newFriend])
        }

        // when this function is called , I'm getting notified that there is a new message and that we want to add a count +1 to the unseenMessages
        const chatHandler = (messageData: ExtendedMessage) => {
            // first we need to check if the user should even be notified - meaning if the chat page is open you do not need to notify the user
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, messageData.senderId)}`

            if (!shouldNotify) return

            // if you should be notified:
            toast.custom((t) => (
                <UnseenChatToast t={t} sessionId={sessionId} senderId={messageData.senderId} senderImg={messageData.senderImg} senderMessage={messageData.text} senderName={messageData.senderName} />
            ))

            setUnseenMessages((prev) => [...prev, messageData])
        }

        // no we will be binding an event to a certain function
        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)


        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
            pusherClient.unbind('new_message', chatHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }
    }, [pathname, sessionId, router])

    return <ul role='list' className='max-h-[25rem] overflow-y-auto space-y-1 -mx-2'>

        {/* friends is a props that we pass from layout */}
        {activeChats.sort().map((oneFriend) => {
            // first we wanna know how many unseen messages there are for this particular friend
            const unseenMessagesCount = unseenMessages.filter((oneUnseenMsg) => {
                // you only want to display unseen messaged for this particular friend. in the unseenMessages state you have ALL unseen messages no matter with what friend, like this you specify you want to see unseen messages for THIS particular person
                return oneUnseenMsg.senderId === oneFriend.id
            }).length  //.lenght becayse you just need the number of how many

            return <li key={oneFriend.id}>
                {/* we do a tag instead of Link because what we actually want is a hard refresh to get the latest messages this friend has sent everytime you visit th e page */}
                {/* a tag compare to Link tag forces the hard refresh that we want  */}
                <a href={`/dashboard/chat/${chatHrefConstructor(sessionId, oneFriend.id)}`} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-start gap-x-3 rounded-medium p-2 text-sm leading-6 font-semibold'>{oneFriend.name} {unseenMessagesCount > 0 ? (
                    <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                        {unseenMessagesCount}
                    </div>
                ) : null}
                </a>
                {/* chatHrefConstructor is a helper function that seperates the two ids with - -   */}
            </li>
        })}
    </ul>
}

export default SidebarChatlist

