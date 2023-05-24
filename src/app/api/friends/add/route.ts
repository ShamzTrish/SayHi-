import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/libraries/auth"
import { db } from "@/libraries/db"
import { pusherServer } from "@/libraries/pusher"
import {toPusherKey} from "@/libraries/utilities"
import { addFriendValidator } from "@/libraries/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

// you can choose what req. u wanna handle (POST,GET,PUT...)
//req:Request je uz build in react same as Error
// this is how you get access to the body content of the POST request
export async function POST(req: Request) {
    try{
        // this is the way how to get access to the body content in the POST request   
        const body = await req.json()
        
        // now you can destructure the email from the body and name it as you want, like emailToAdd and you should revalidate AGAIN using addFriendValidator, incase the client managed to put something that is not a valid email address  - never trust CLIENT INPUT
        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        // now we need to reach out to our database and get back the user id. This is the url under which their email address is stored and that's how we can get their id
        // this is the email of the user that we want to add and we want to figure out their id
        const RESTresponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,{
            // upstash needs to know you are authorized to get these information and enter the database , and for that we have the token. headers: jsou dodatecne informace ktere musime poskytnout aby jsme mohli upravovat databazi. uz je to build in.
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN }`
            },
            // we never want to store the data and we always want to deliver fresh data, so we need to be specific with next js
            cache: 'no-store'
        })

        // tady zjistujeme jestli ma ID nebo je null
        // result string | null, protoze kdyz si das console.log(data) tak to je format ve kterym ty vlastne dostanes to userID - bud dostanes to id coz bude string a nebo null pokud tam zadne id neni
        const data = await RESTresponse.json() as {result: string | null}
        const idToAdd = data.result
        
        // if the id doesnt exist, then you can show message that the user doest not exist
        if(!idToAdd){
            return new Response("This person does not exist", {status:400 })
        }
        // now we need to find out who is making the request from the server side, not the client side
        const session = await getServerSession(authOptions)

        // if there is no session, means you're not allowed to do this and you would need to login
        if(!session){
            return new Response("Unauthorized!", {status:401 })
        }

        //now  we need to chcek just in case, if the ID is equal to the ID of the user that is currently logged in - it wouldn't make sense to add yourself a friend request
        if(idToAdd === session.user.id){
            return new Response("You cannot add yourself as a friend!",  {status:400})
        } 
        
        // now we can check if the user is already added - so you cannot add a friend that has already been added
        // `user:${idToAdd}:incoming_friend_requests`  this is the structure what you find in your database - this is how it looks in Upstash and this is where we will store all friends requests, so this is how you can check if it already exists in this 'folder of friends requests'
        // session.user.id is how you get the current logged in user
        // as 0 | 1 znamena ze either the user IS a member of the 'folder of friends requests' or NOT
        const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1

        if(isAlreadyAdded) {
            return new Response('Already added this user', { status: 400})
        }
        
        // here we are checking in the friendsList of the current user, that is logged in If the id already exists
        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd) as 0 | 1

        
        if(isAlreadyFriends) {
            return new Response('Already friends with this user', { status: 400})
        }
        // ????????????????
        pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
            {
                senderId: session.user.id,
                senderEmail: session.user.email,
            }
        )

        // YOUTUBE 2h 12minutes
        // SO AFTER YOU MEET ALL THE VALIDATIONS, we can finally send a friend request
        //db.sadd = add to databaze
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
        
    } catch(error) {
        if(error instanceof z.ZodError)
        return new Response('Invalid request payload', {status:422})
    }
    return new Response('Invalid Request', {status: 400})
}