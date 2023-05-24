// YOUTUBE 3h 38min

import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// withAuth is already built in nextJS

export default withAuth(
    // middleware is your name
    async function middleware(req) {
        // with this we will find out on what URL the user currently is
        const currentPath = req.nextUrl.pathname

        // Manage routes protection
        const isAuthenticated = await getToken({ req })  //getToken will automatically use our secret that we have in the env file, meaning it will automatically decrypt our token and see the values that are in there - from the request

        // now we check if the user is trying to navigate to the login page
        const isLoginPage = currentPath.startsWith('/login')

        // and nobody should be able to access this URL /dashboard unless they are logged in
        const sensitiveRoute = ['/dashboard']

        const isAccessingSensitiveRoute = sensitiveRoute.some((route) => currentPath.startsWith(route))

        if (isLoginPage) { // if they are trying to navigate to login page we will check:
            // if they are authenticated
            if (isAuthenticated) {
                // we will redirect them to dashboard, so they cannot log in again
                return NextResponse.redirect(new URL('/dashboard', req.url)) //req.url is the base URL, for example localhost:3000
            }
            return NextResponse.next()  //next() basically tells to pass along the request and continue on the url the user wants ..and in this case to continue on the login page if it he is not logged in
        }

        // if they are not logged in and are trying to access any of our sensitive routes we redirect them to login page
        if (!isAuthenticated && isAccessingSensitiveRoute) {
            return NextResponse.redirect(new URL('/login', req.url))
        }


        if (currentPath === '/' && isAuthenticated) {  // so this matches with our routing structure and if there is just / in the url we redirect them to /dashboard as that is our home page
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    },
    {  // CALLBACK will be a second argument in this function
        callbacks: {
            // we need to do this and return true so our middleware function is always called
            // if we didnt have this callback we would have an infinite redirect and just error in the browser telling us that this page is redirecting us too often
            async authorized() {
                return true
            }
        }
    }
)


export const config = {
    matcher: ['/', '/login', '/dashboard/:path*'] //'/dashboard/:path*' means every path that starts with /dashboard/anythinghere
    // matcher is a built in property that is and [ array ] and it will determine  in which routes this middleware will run
}


