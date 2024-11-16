"use client"

import React, { useState } from 'react'
import { Todo } from '@prisma/client'

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, XCircle } from "lucide-react";


interface TodoItemsProps {
    todo: Todo,
    isAdmin?: boolean,
    onUpdate: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
}



export default function TodoItems(
    {
        todo,
        isAdmin = false,
        onUpdate,
        onDelete
    }: TodoItemsProps
) {
    const [isCompleted, setIsCompleted] = useState<Todo["completed"]>(todo.completed)

    async function handleTodoToggleCompleted() {
        setIsCompleted(!isCompleted);

        onUpdate(todo.id, !isCompleted);
    }



    return (
        <Card>
            <CardContent
                className="flex items-center justify-between p-4"
            >

                <span
                    className={isCompleted ? "line-through" : ""}
                >
                    {todo.title}
                </span>

                <div
                    className='flex items-center gap-x-2'
                >

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTodoToggleCompleted}
                    >
                        {
                            isCompleted ? (
                                <XCircle
                                    className='mr-2 w-4 h-4'
                                />
                            ) : (
                                <CheckCircle
                                    className='mr-2 w-4 h-4'
                                />
                            )
                        }

                        {isCompleted ? "Undo" : "Complete"}
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(todo.id)}
                    >

                        <Trash2
                            className='mr-2 w-4 h-4'
                        />
                        Delete
                    </Button>

                    {
                        isAdmin && (
                            <span
                                className='ml-2 text-sm text-muted-foreground'
                            >
                                User ID: {todo.userId}
                            </span>
                        )
                    }
                </div>
            </CardContent>

        </Card>
    )
}
