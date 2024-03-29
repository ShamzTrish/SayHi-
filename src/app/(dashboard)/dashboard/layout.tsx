import { authOptions } from '@/libraries/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { Icon, Icons } from '@/components/Icons'
import Link from 'next/link'
import Image from 'next/image'
import SignOutButton from '@/components/SignOutButton'
import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions'
import { fetchRedis } from '@/helpers/redis'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import SideBarChatList from '@/components/SideBarChatList'

interface LayoutProps {
    children: ReactNode
}

interface sideBarOption1 {
    id: number,
    name: string,
    href: string,
    Icon: Icon  //this Icon is coming from components/Icons  thats the Icon type we declered over there "export type Icon = keyof typeof Icons"    So it will be either a Logo | UserPlus what we will be allowed to use 
}

const sideBarOptions: sideBarOption1[] = [{
    id: 1,
    name: 'Add Friend',
    href: '/dashboard/add',
    Icon: 'UserPlus'
}]


const Layout = async ({ children }: LayoutProps) => {

    // first we need to get the session, meaning you need this to see if the user is logged in and if youcan show him this page in first place.
    // this is how you get thte session
    const session = await getServerSession(authOptions)

    // if there is no session, you do not want to show this page, so you can call notFound like this, but this is not enought to protect this route, later we will do some middlewares just to be sure.

    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)

    const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`
    ) as User[]
    ).length

    return <div className='w-full flex h-screen'>
        <div className='flex h-full w-full max-w-xs grow flex-col gap-y-5  overflow-y-auto border-r border-gray-200 bg-white px-6'>
            <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                <Icons.Logo className="h-8 w-auto text-indigo-600" />
            </Link>
            {friends.length > 0 ? <div className='text-xs font-semibold leading-6  text-gray-400'>Your chats</div> : null}
            <nav className='flex flex-1 flex-col'>
                <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                    <li>
                        <SideBarChatList friends={friends} sessionId={session.user.id} />
                    </li>

                    <li>
                        <div className='text-xs font-semibold leading-6 text-gray-400'>
                            Overview
                        </div>
                        <ul role='list' className='-mx-2 mt-2 space-y-1'>
                            {sideBarOptions.map((option) => {
                                const Icon = Icons[option.Icon]
                                return (
                                    <li key={option.id}>
                                        <Link className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-medium p-2 text-sm leading-6 font-semibold' href={option.href}>
                                            <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625] font-medium bg-white'>
                                                <Icon className='h-4 w-4' />
                                            </span>
                                            {/* truncate = means that if the page goes too small, text will be cut off and . . . will be added on the end of the text, rather then pushing the text on another line */}
                                            <span className='truncate'>
                                                {option.name}
                                            </span>
                                        </Link>
                                    </li>
                                )
                            })}
                            <li>
                                <FriendRequestSidebarOptions sessionId={session.user.id} initialUnseenRequestCount={unseenRequestCount} />
                            </li>
                        </ul>
                    </li>


                    <li className='-mx-6 mt-auto flex items-center'>
                        <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                            <div className='relative h-8 w-8 bg-gray-50'>
                                <Image
                                    fill
                                    referrerPolicy='no-referrer'
                                    className='rounded-full'
                                    src={session.user.image || ''}
                                    alt='Your profile picture'
                                />
                            </div>
                            <span className='sr-only'>Your profile</span>
                            <div className='flex flex-col'>
                                <span aria-hidden='true'>{session.user.name}</span>
                                <span className='text-xs text-zinc-400' aria-hidden='true'>
                                    {session.user.email}
                                </span>
                            </div>
                        </div>
                        <SignOutButton className="h-full aspect-square" />
                    </li>
                </ul>
            </nav>
        </div>
        <aside className='max-h-screen container py-16 md:py-12 w-full'>{children} </aside>
    </div>
}

export default Layout