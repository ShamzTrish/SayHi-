import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import GoogleProvider from 'next-auth/providers/google'
import { fetchRedis } from "@/helpers/redis";

// Tady si nastavujeme Error pokud neco nevyjde pri log-in
// tohle je funkce ktera nam kontroluje zpravne prihlaseni pomoci google account a v pripade chuybejicich prihlasovacich udaju tak throwneme Error
const getGoogleCredencial = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if(!clientId || clientId.length === 0 ) {
        throw new Error ('Missing GOOGLE_CLIENT_ID')
    }

    if(!clientSecret || clientSecret.length === 0 ) {
        throw new Error ('Missing GOOGLE_CLIENT_SECRET')
    }
    
    return { 
        clientId,
        clientSecret
    }
}

export const authOptions: NextAuthOptions = {
    //import { UpstashRedisAdapter } tohle vezme vsechny data o User co se log-in a posle to za nas vsechny jeho data do databaze
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages:{
        signIn: '/login'
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredencial().clientId,
            clientSecret: getGoogleCredencial().clientSecret
        }),
    ],
    // callbacks jsou zpusteny v pripade az se neco nami nastaveneho stane. 
    //Callback are action that are taken when certain things happen
    callbacks: {
        async jwt ({ token, user }) {
            // const dbUser = ( await db.get(`user:${token.id}`)) as User | null
            const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as string | null

            if(!dbUserResult){
                token.id = user!.id
                return token

            }
            

            const dbUser = JSON.parse(dbUserResult) as User
            
                return {
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    picture: dbUser.image
                }

        },
        async session ({session, token}) {
            if(token) {
                session.user.id = token.id
                session.user.email = token.email
                session.user.name = token.name
                session.user.image = token.picture
            }
            return session
        },
        // az se User seccesfully log-in, tak chceme redirectnout ho na /dashboard
        redirect(){
            return "/dashboard"
        }
    },
}