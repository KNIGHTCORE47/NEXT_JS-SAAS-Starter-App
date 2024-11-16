"use client"

import React from 'react'

import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"

interface TododFormProps {
    onSubmit: (title: string) => void
}

export default function TododForm({ onSubmit }: TododFormProps) {
    const [title, setTitle] = React.useState("")

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (title.trim()) {
            onSubmit(title.trim());
            setTitle("");
        }
    }


    return (
        <form
            onSubmit={handleSubmit}
            className='flex space-x-2 mb-4'
        >
            <Input
                className='flex-grow'
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='What needs to be done?'
            />
            <Button
                type='submit'
                variant={title ? "default" : "outline"}
            >
                Add
            </Button>

        </form>
    )
}