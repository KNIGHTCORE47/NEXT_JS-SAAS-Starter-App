import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            {
                success: false,
                error: 'Not authorized'
            }, { status: 401 }
        );
    }


    //NOTE - create subscription, [payment capturing] - TODO, etc.

    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: userId
                }
            }
        )

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found'
                }, { status: 404 }
            )
        }

        //NOTE - create subscription
        const subscriptionEnds = new Date();

        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

        const updatedUser = await prisma.user.update(
            {
                where: {
                    id: userId
                },
                data: {
                    isSubscribed: true,
                    subscriptionEnds: subscriptionEnds
                }
            }
        )

        if (!updatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Subscription failed'
                }, { status: 500 }
            )
        } else {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Subscription successful',
                    data: updatedUser.subscriptionEnds
                }, { status: 200 }
            )
        }


    } catch (error: any) {
        console.log("Error updating subscription", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            }, { status: 500 }
        )
    }

}





export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            {
                success: false,
                error: 'Not authorized'
            }, { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: userId
                },
                select: {
                    isSubscribed: true,
                    subscriptionEnds: true
                }
            }
        )

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found'
                }, { status: 404 }
            )
        }

        //NOTE - check if subscription has expired
        const now = new Date();

        if (user.subscriptionEnds && user.subscriptionEnds < now) {

            const updatedUser = await prisma.user.update(
                {
                    where: {
                        id: userId
                    },
                    data: {
                        isSubscribed: false,
                        subscriptionEnds: null
                    }
                }
            )

            if (!updatedUser) {
                console.log("Error updating subscription");

                return NextResponse.json(
                    {
                        success: false,
                        error: 'Subscription failed'
                    }, { status: 500 }
                )
            }

            return NextResponse.json(
                {
                    isSubscribed: false,
                    subscriptionEnds: null
                }
            )

        }

        return NextResponse.json(
            {
                success: true,
                isSubscribed: user.isSubscribed,
                subscriptionEnds: user.subscriptionEnds,
                message: user.isSubscribed ? "You have a valid subscription" : "Please renew your subscription"
            }, { status: 200 }
        )

    } catch (error: any) {
        console.log("Error updating subscription", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            }, { status: 500 }
        )
    }
}