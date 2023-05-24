// v tehle file si nastavime jak bude User vypadat co bude obsahovat 

interface User {
    name: string,
    email: string,
    image: string,
    id: string,
}

interface Chat {
    id: string,
    message: Message[]
}

interface Message {
    id: string, 
    senderId: string,  
    recieverId: string,
    text: string,
    timestamp: number, 
}

interface FriendRequest {
    id: string,
    senderId: string,
    recieverId: string
}
