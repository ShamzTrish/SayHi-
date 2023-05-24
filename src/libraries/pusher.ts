// pusher is a service we can use for real time comunication
// you need two - one for server side - pusher and one for client side pusher-js


import PusherServer from 'pusher'
import PusherClient from 'pusher-js'


export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,   //by putting exclamation at the end ! we are telling typescript the we know that this value is set, otherwise this could be undefined and it would give us error
    secret: process.env.PUSHER_APP_SECRET!,
    cluster: 'eu',
    useTLS: true  // tls means encrypted data traffic 

})

export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    {
        cluster: 'eu'
    }
)



// so this is all set up now 
// all the values are from the Pusher and this is how you set it up - you can check the docs