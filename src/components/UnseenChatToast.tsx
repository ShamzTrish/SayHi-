import { chatHrefConstructor, cn } from '@/libraries/utilities'
import Image from 'next/image'
import { FC } from 'react'
import { toast, type Toast } from 'react-hot-toast'

interface UnseenChatToastNotificationProps {
    t: Toast  // in SidebarChatlist you have a chatHandler function where you display your toast notification and there you are sending the 't' here
    sessionId: string
    senderId: string
    senderImg: string
    senderName: string
    senderMessage: string
}

const UnseenChatToastNotification: FC<UnseenChatToastNotificationProps> = ({ t, sessionId, senderId, senderImg, senderName, senderMessage }) => {
    return <div className={cn('max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5', {
        'animate-enter': t.visible,
        'animate-leave': !t.visible
    })}>
        {/* you want to be able to click and be redirected to the chat you got the message from */}
        <a href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`} onClick={() => toast.dismiss(t.id)} className='flex-1 w-0 p-4'>
            <div className='flex items-start'>
                <div className='flex-shrink-0 pt-0.5'>
                    <div className='relative h-10 w-10'>
                        {/* here we will render the profile picture of the person that sent us the message */}
                        <Image fill referrerPolicy='no-referrer' className='rounded-full' src={senderImg} alt={`${senderName} profile picture`} />
                    </div>
                </div>

                {/*  here we display sender name and the message */}
                <div className='ml-3 flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{senderName}</p>
                    <p className='mt-1 text-sm text-gray-500'>{senderMessage}</p>
                </div>
            </div>
        </a>

        <div className='flex border-l border-gray-200'>
            <button onClick={() => toast.dismiss(t.id)} className='w-full border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-start text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                Close
            </button>
        </div>
    </div>
}

export default UnseenChatToastNotification