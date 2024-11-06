import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextResponse, NextRequest } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {

    const { userId } = await auth();

    if (!userId) {
        console.log("User not authenticated");
        return NextResponse.json(
            {
                success: false,
                error: 'Not authorized'
            }, { status: 401 }
        )
    }

    try {

        // //NOTE - find out the todo id from params
        const todoId = params.id;

        if (!todoId) {
            console.log("Missing todo id");
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing todo id'
                }, { status: 400 }
            )
        }

        //NOTE - find and check the existing todo
        const todo = await prisma.todo.findUnique(
            {
                where: {
                    id: todoId
                }
            }
        )

        if (!todo) {
            console.log("Todo not found");

            return NextResponse.json(
                {
                    success: false,
                    error: 'Todo not found'
                }, { status: 404 }
            )
        }

        //NOTE - check if todo belongs to authenticated user
        if (todo.userId !== userId) {
            console.log("Forbidden access");

            return NextResponse.json(
                {
                    success: false,
                    error: 'Forbidden access'
                }, { status: 403 }
            )
        }

        //NOTE - update the todo
        const updatedTodo = await prisma.todo.update(
            {
                where: {
                    id: todoId
                },
                data: {
                    completed: !todo.completed
                }
            }
        )

        if (!updatedTodo) {
            console.log("Error updating todo");

            return NextResponse.json(
                {
                    success: false,
                    error: 'Error updating todo'
                }, { status: 500 }
            )
        }

        return NextResponse.json(
            {
                todo: updatedTodo,
                success: true,
                message: 'Todo updated successfully'
            }, { status: 200 }
        )



    } catch (error: any) {
        console.log("Error updating todo", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            }, { status: 500 }
        )
    }
}




export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
        const todoId = params.id;

        if (!todoId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing todo id'
                }, { status: 400 }
            )
        }

        //NOTE - find and check the existing todo
        const todo = await prisma.todo.findUnique(
            {
                where: {
                    id: todoId
                }
            }
        )

        if (!todo) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Todo not found'
                }, { status: 404 }
            )
        }

        //NOTE - check if todo belongs to authenticated user
        if (todo.userId !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Forbidden access'
                }, { status: 403 }
            )
        }

        const deletedTodo = await prisma.todo.delete(
            {
                where: {
                    id: todoId
                }
            }
        )

        return NextResponse.json(
            {
                todo: deletedTodo,
                success: true,
                message: 'Todo deleted successfully'
            }, { status: 200 }
        )

    } catch (error: any) {
        console.log("Error deleting todo", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            }, { status: 500 }
        );

    }
}