import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextResponse, NextRequest } from 'next/server'

const ITEMS_PER_PAGE = 10

export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {

        return NextResponse.json(
            {
                success: false,
                error: 'Not authorized'
            }, { status: 401 }
        )
    }

    const { searchParams } = new URL(request.url);

    //NOTE - Difference between parseInt() and Number() in JavaScript. LINK - https://tinyurl.com/2kbepj97 or https://tinyurl.com/2edv2hze
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';

    try {
        const todos = await prisma.todo.findMany(
            {
                where: {
                    userId,
                    title: {
                        contains: search,
                        mode: 'insensitive' //NOTE - case insensitive
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: ITEMS_PER_PAGE,
                skip: (page - 1) * ITEMS_PER_PAGE
            }
        )

        const totalTodoItemsCount = await prisma.todo.count(
            {
                where: {
                    userId,
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
            }
        )

        const totalPages = Math.ceil(totalTodoItemsCount / ITEMS_PER_PAGE);

        return NextResponse.json(
            {
                todos,
                currentPage: page,
                totalPages,
            }
        )

    } catch (error: any) {
        console.log("Error getting todos", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            }, { status: 500 }
        )

    }
}





export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {

        return NextResponse.json(
            {
                success: false,
                error: 'Not authorized'
            }, { status: 401 }
        )
    }

    try {
        const userWithTodos = await prisma.user.findUnique(
            {
                where: {
                    id: userId
                },
                include: {
                    todos: true
                }
            }
        )
        console.log("userWithTodos", userWithTodos);

        if (!userWithTodos) {
            console.log("User not found");
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found'
                }, { status: 404 }
            )
        }

        //NOTE - Limiting the creation of new todos for unauthorized users
        if (
            !userWithTodos.isSubscribed && userWithTodos.todos.length >= 5
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error: 'You have reached the limit of 5 todos. Please subscribe to the premium plan to create more todos.'
                }, { status: 403 }
            )
        }

        //NOTE - For authenticated users creating new todos
        const { title } = await request.json();

        const todo = await prisma.todo.create(
            {
                data: {
                    title,
                    userId
                }
            }
        )

        if (!todo) {
            console.log("Error creating new todo");

            return NextResponse.json(
                {
                    success: false,
                    error: 'Internal server error. Error creating new todo'
                }, { status: 500 }
            )
        }


        return NextResponse.json(
            { todo }, { status: 201 }
        )



    } catch (error: any) {
        console.log("Error creating todo", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            }, { status: 500 }
        )
    }
}