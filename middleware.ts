import { clerkMiddleware, clerkClient, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(
    [
        "/",
        "/api/webhook/register",
        "/sign-up",
        "/sign-in",
    ]
)


export default clerkMiddleware(
    async (auth, request) => {
        const { userId } = await auth();

        //NOTE - secure protected routes from users without any authentication, redirects to sign-in page
        if (!userId && !isPublicRoute(request)) {
            return NextResponse.redirect(new URL('/sign-in', request.url))

        }

        //NOTE - filter designated role driven users to access desired routes
        if (userId) {
            try {
                const client = await clerkClient()

                const user = await client.users?.getUser(userId)

                const role = user?.publicMetadata?.role as string | undefined

                //NOTE - admin user access to admin dashboard
                if (role === "admin" && request.url.includes("/dashboard")) {
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url))

                }

                //NOTE - prevent autherized non-admin users from accessing admin dashboard
                if (role !== "admin" && request.url.match("/admin")) {
                    return NextResponse.redirect(new URL('/dashboard', request.url))

                }

                //Note - restrict authenticated users from accessing public routes
                if (isPublicRoute(request)) {
                    return NextResponse.redirect(
                        new URL(
                            role === "admin" ? "/admin/dashboard" : "/dashboard",
                            request.url
                        )
                    )

                }
            } catch (error: any) {
                console.error("Error fetching user data from Clerk:", error);

                return NextResponse.redirect(new URL('/error', request.url))

            }

        }


    }
)

export const config = {
    matcher: [
        "/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"
    ],
}