// tohle je function ktera nam pomaha s pouzivanim nasi databazi


const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN

type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(
    command: Command,
    ...args:(string | number)[] 
) {
    // tohle jak delame request do upStashREST API
    const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`

   const response = await fetch(commandUrl,{
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        cache: 'no-store',
    })

    if(!response.ok){
        throw new Error(`Error execution Redis command: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
    
}