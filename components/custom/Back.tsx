"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { ChevronLeft } from 'lucide-react'



export default function Back() {
    const router = useRouter();

    return (

        <Button
            variant="ghost"
            onClick={() => router.back()}
        >
            <div className='flex items-center gap-x-1'>
                <p>
                    <ChevronLeft />
                </p>
                Back
            </div>
        </Button>
    )
}

