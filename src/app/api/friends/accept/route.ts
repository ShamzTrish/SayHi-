// YOUTUBE 3h 35min
import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/libraries/auth"
import { db } from "@/libraries/db"
import { pusherServer } from "@/libraries/pusher"
import { toPusherKey } from "@/libraries/utilities"
import { getServerSession } from "next-auth"
import { z } from "zod"


// you can choose what request you wanna handle (POST, GET, PUT, DELETE... )
// req: Request is already in React, same as if you would be using Error
export async function POST(req: Request) {

    try {
        // this is how you get access to the body content of the POST request
        const body = await req.json()

        const { id: idToAdd } = z.object({ id: z.string() }).parse(body) //if successfull you will get id as a string

        // first oyu need to check who is sending the request
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // verify both users are not already friends

        const isAlreadyfriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd) // so we are looking into the 'friends' folder and checking if the user we wanna add - that is currently under the const 'idToAdd' if he already is in this folder or not. If he is, it means we are friends already and zou cannot add him 
        // we pass the idToAdd as third argument because we want to know if that id is member of the friends folder

        if (isAlreadyfriends) {
            return new Response('You are friends aldeady!', { status: 400 })
        }

        //  we check so that you can only accept friend request from people who actually sent you one
        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)
        // we pass the idToAdd as third argument because we want to know if that id is member of the incoming_friend_requests folder

        if (!hasFriendRequest) {
            return new Response('You do not have a friend request from this person.', { status: 400 })
        }

        // first wewant to fetch all the information about thep erson we are adding
        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis('get', `user:${session.user.id}`),
            fetchRedis('get', `user:${idToAdd}`),
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User


        // notifying added user
        // this will refresh a page for a user that sent the freind request to see his friends request has been accepted 
        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', user),
            pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`), 'new_friend', friend),

            // if everything is alright then you can move to this line and actually add a friend to your list and accept the request
            //you want to add that person to our database using database.sadd()
            db.sadd(`user:${session.user.id}:friends`, idToAdd),  //first is where you want to add the person - to which 'folder', we want to add the person to the friends folder (other folders you have are like incoming_friend_requests etc) and second argument is WHO you want to add to that folder, and we want the add the idToAdd person

            //and now you have to do it the other way around as well, because if I am your friend you are my friend - because both people are adding each other as a friend
            db.sadd(`user:${idToAdd}:friends`, session.user.id),

            // THEN we want to clean up the freinds request - since you accepted it you have to remove it from the friends requests so you cannot accept the same friends request more than once 
            //srem for removing from the database 
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
            db.srem(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        ])

        return new Response('OK')


    } catch (error) {

        if (error instanceof z.ZodError) {
            return new Response('Invalid zod request payload.', { status: 422 })
        }

        return new Response('Invalid request.', { status: 400 })

    }

}