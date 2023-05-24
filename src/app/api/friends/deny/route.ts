import { authOptions } from "@/libraries/auth"
import { db } from "@/libraries/db"
import { Axios } from "axios"
import { getServerSession } from "next-auth"
import { z } from "zod"



export async function POST(req: Request){
    try{
        //first you need to get to the 'body'
        const body = await req.json()
        // here we are checking if I'm allowed to do it
        // If I dont have the session I'm not authorized
        const session =await getServerSession(authOptions)

        if(!session){
            return new Response('Unauthorized', {status:401})
        }

        const {id: idToDeny} = z.object({id: z.string()}).parse(body)

        // here I'm saying to the the db and remove loged-in users from icoming friends request 
        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

        return new Response('OK')

    } catch(error) {
        

        if(error instanceof z.ZodError){
            return new Response('Invalid request payload', {status: 422})
        }

        return new Response('Invalid request',{status:400})
    }
}