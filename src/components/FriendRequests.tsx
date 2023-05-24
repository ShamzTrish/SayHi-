"use client";

import { Check, X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Icons } from "./Icons";
import axios from "axios";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/libraries/pusher";
import { toPusherKey } from "@/libraries/utilities";

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[],
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({ incomingFriendRequests, sessionId }) => {
    const router = useRouter() // we use this to refresh the page
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests);

    // here we have to subscribe the client side to the pusher(realTime show of friendRequest)
    useEffect(() => {
        // here we are telling pusher to listen and listen for anything that happens in the incoming_friend_requests server database 'file'
        // the only thing with pusher is that it doesnt allow : semicolons so we created a helper function in the utilities  called toPusherKey
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

        // ?????????
        const friendRequestHandler = ({ senderId, senderEmail }: IncomingFriendRequest) => {
            setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
        }

        // with bind() we are saying that anytime when on pusherClient.subscribe event occourse 
        pusherClient.bind('incoming_friend_requests', friendRequestHandler)


        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])


    // here we make logic for accepting od deniing requests
    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', { id: senderId })
        // now we have to update how many requests we see, since we accepted one we have to change the number and remove the one that we accepted. setFriendRequests() is the state where we hold the number of requests 
        // passing the paramater(prev) in the state in the function represents the previous state - it knows it has to look at the previous state as we filter through them and look for id that isn't the one we accepted.
        // we are filltering out the only ID(request) that we accepted
        setFriendRequests((prev) => {
            return prev.filter((request) => {
                return request.senderId !== senderId
            })
        })

        //after we have to refresh the page
        router.refresh()
    }

    // function for denying a friend request - same as accepting because no matter if we accept or deny we want the person to be taken out of the friends requests
    const denyFriend = async (senderId: string) => {

        // this is where we send the request
        await axios.post('/api/friends/deny', { id: senderId })
        // now we have to update how many friendsrequest we see - since we accepted one we have to change the number obviously and remove the one we accepted.
        // setFriendRequests is the state where we hold the number of friends requests
        // passing a parameter, in our case 'prev' in the state in the function represents the previous state - it knows it needs to look on previous state (you can name it whatever)
        setFriendRequests((prev) => {
            return prev.filter((request) => {
                return request.senderId !== senderId
            })
        })

        router.refresh()
    }

    return <>
        {/* if there are no friends requests */}
        {friendRequests.length === 0 ? (
            <p className='text-sm text-zinc-500'>Nothing to show here...</p>
        ) : (
            //  since it's array we can map through and get back individual id and email
            // this is how our 'schema' looks, hence we use senderId and senderEmail - we didn;t make it up
            // interface IncomingFriendRequest {
            // senderId: string
            // senderEmail: string | null | undefined
            // }
            friendRequests.map((oneRequest) => {
                return <div key={oneRequest.senderId} className='flex gap-4 items-center'>
                    {/* here we select that we want to display UserPlus icon */}
                    <Icons.UserPlus className='text-black' />
                    {/* why senderEmail?  see note up */}
                    <p className='font-medium text-lg'>{oneRequest.senderEmail}</p>
                    <button onClick={() => acceptFriend(oneRequest.senderId)} className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md' aria-label='accept friend'>
                        {/* Check is lucide icon */}
                        <Check className='font-semibold text-white w-3/4 h-3/4' />
                    </button>

                    <button onClick={() => denyFriend(oneRequest.senderId)} className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md' aria-label='deny friend'>
                        {/* you have to pass the senderId because the function expects the id */}
                        <X className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
                </div>
            })
        )}
    </>
};

export default FriendRequests;

