// here we handle all the sending logic via post request

import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/libraries/auth"
import { db } from "@/libraries/db"
import { pusherServer } from "@/libraries/pusher"
import { toPusherKey } from "@/libraries/utilities"
import { Message, messageValidator } from "@/libraries/validations/message"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"


export async function POST(req:Request) {
    
    try { 
        // first we desctructure whatever we are sending in the request - we are sending this: { text: input, chatId }
        // : {text: string, chatId: string}  it typescript validation
        const {text, chatId} : {text: string, chatId: string} = await req.json()
        // because we require a User to be logged-in to send a message - we have to get his session
        const session = await getServerSession(authOptions)

        if(!session){
           return new Response('Unauthorized', {status: 401})
        }
        // here we have to get access to the userId and chatId to verify that the User who is trying to send a message is one of those Id's
        //since we know the two ids in the url are seperated by -- we can call split and split them at that point
        const [userId1, userId2] = chatId.split('--') 

        //
        if(session.user.id !== userId1 && session.user.id !== userId2){     // if the logge-in users id doesnt mach to user1 or user2 from the chat , this person is not to see it.
            return new Response('Unauthorized', {status: 401})
        }

        // we have to find you what id is mine and what id is chatPartners
        // const friendId = session.user.id === userId1 ? userId2 : userId1

        let friendId: string;
        if(session.user.id === userId1){
            friendId = userId2
        } else {
            friendId = userId1
        }

        // now we do another validation to find out if the friendId is in my friend-list , to be able to send me a message
        const friendList = (await fetchRedis('smembers',`user:${session.user.id}:friends`)) as string[]
        const isFriend = friendList.includes(friendId)

        if(!isFriend){
            return new Response('Unauthorized', {status: 401})
        }

        // if you get here, then everything is ok , and you CAN send a message.
        
        // now we have to set up a popMessage notification via toast which will be shown if someone sent us a message
        // now we have to get the details of the person sending the message 
        
        const rawSender = await fetchRedis('get',`user:${session.user.id}`) as string
        const parsedSender = JSON.parse(rawSender) as User

        const timestamp = Date.now()
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
        }
        
        // now we have to pass our validation using zod
        const message = messageValidator.parse(messageData)
        
        // now I'm implementing real-time functionality using pusher
        // notify all conected chat room clients
        pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message) // 'incoming-message' must mach with what is writen on the client side - Messages.tsx  

        // now on every message I send for the coresponding chats  for the user we are emiting a new message event
        // and that event is triggred on the client side where client recieve the message 
        pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: parsedSender.image,
            senderName: parsedSender.name
        })
        
        await db.zadd(`chat:${chatId}:messages`,{
            score: timestamp,
            member: JSON.stringify(message)
        })
        return new Response('OK')
        
    } catch (error) {
        if(error instanceof Error){
           return new Response(error.message, {status:500})
        }

        return new Response('Interval server Error', {status:500})
        
    }   
}       