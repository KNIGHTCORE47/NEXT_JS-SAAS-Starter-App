import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes
const publicRoutes = [
    "/",
    "/api/webhook/register",
    "/sign-up",
    "/sign-in",
]

// Helper function to check if a route is public
const isPublicRoute = (url: string) => {
    return publicRoutes.some(route => url.includes(route))
}

export async function middleware(request: Request) {
    try {
        // Get auth state
        const { userId } = await auth()
        const url = new URL(request.url)

        // Handle unauthenticated users trying to access protected routes
        if (!userId && !isPublicRoute(url.pathname)) {
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }

        // Handle authenticated users
        if (userId) {
            try {
                const client = await clerkClient()

                const user = await client.users.getUser(userId)
                const role = user.publicMetadata.role as string | undefined

                // Admin user access to admin dashboard
                if (role === "admin" && url.pathname === "/dashboard") {
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
                }

                // Prevent non-admin users from accessing admin routes
                if (role !== "admin" && url.pathname.startsWith("/admin")) {
                    return NextResponse.redirect(new URL('/dashboard', request.url))
                }

                // Restrict authenticated users from accessing public routes
                if (isPublicRoute(url.pathname)) {
                    return NextResponse.redirect(
                        new URL(
                            role === "admin" ? "/admin/dashboard" : "/dashboard",
                            request.url
                        )
                    )
                }
            } catch (error) {
                console.error("Error fetching user data from Clerk:", error)
                return NextResponse.redirect(new URL('/error', request.url))
            }
        }

        // Allow the request to proceed
        return NextResponse.next()
    } catch (error) {
        console.error("Middleware error:", error)
        return NextResponse.redirect(new URL('/error', request.url))
    }
}

export const config = {
    matcher: [
        "/((?!.+\\.[\\w]+$|_next).*)",
        "/",
        "/(api|trpc)(.*)"
    ],
}