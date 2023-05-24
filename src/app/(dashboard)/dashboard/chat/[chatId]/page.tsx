
import ChatInput from '@/components/ChatInput'
import Messages from '@/components/Messages'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/libraries/auth'
import { messageArrayValidator } from '@/libraries/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Message } from 'react-hook-form'

interface PageProps {
    params: {
        chatId: string
    }
}

const getChatMessages = async (chatId: string) => {
    try {
        const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)
        const dbMessages = results.map((message) => {
            return JSON.parse(message) as Message
        })

        const reversedDbMessages = dbMessages.reverse()
        const messages = messageArrayValidator.parse(reversedDbMessages)
        return messages
    } catch (error) {
        notFound()
    }
}

const page = async ({ params }: PageProps) => {

    const { chatId } = params
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const { user } = session

    const [userId1, userId2] = chatId.split('--') // to make sure the chat is the same for both users we connect them with chatId.split('--')

    // user should be always be able to view the chat if one of these ID's is theirs
    // if user.id is not neither userId1, userId2 , then they are not permited to view the chat
    if (user.id !== userId1 && user.id !== userId2) {
        notFound()
    }

    // to determinate who's Id's is whos we use this ternary operator
    const chatPartnerId = user.id === userId1 ? userId2 : userId1


    const parsedChatPartner = (await fetchRedis('get', `user:${chatPartnerId}`)) as string
    const chatPartner = JSON.parse(parsedChatPartner) as User


    // const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User
    const initialMessages = await getChatMessages(chatId)

    return <div className='flex-1 flex justify-between flex-col h-full max-h-[calc(100vh-6rem)]'>
        <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
            <div className='relative flex items-center space-x-4'>
                <div className='relative'>
                    <div className='relative w-8 sm:w-12 sm:h-12'>
                        <Image
                            fill referrerPolicy="no-referrer"
                            src={chatPartner.image}
                            alt={`${chatPartner.name}profile picture`}
                            className="rounded-full"
                        />
                    </div>
                </div>
                <div className='flex flex-col leading-tight'>
                    <div className='text-xl flex items-center'>
                        <span className='text-gray-700 mr-3 font-semibold'>{chatPartner.name}</span>
                    </div>
                    <span className='text-sm text-gray-600'>{chatPartner.email}</span>
                </div>
            </div>
        </div>
        <Messages chatPartner={chatPartner} sessionImg={session.user.image} chatId={chatId} initialMessages={initialMessages} sessionId={session.user.id} />
        <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
}

export default page