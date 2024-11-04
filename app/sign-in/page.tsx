"use client";

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react'

import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from 'lucide-react'

export default function Signin() {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState("")

    const { signIn, isLoaded, setActive } = useSignIn();
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isLoaded) return null;

        try {
            const signInAttempt = await signIn?.create({
                identifier: email,
                password,
            });

            if (signInAttempt.status !== "complete") {
                console.log(JSON.stringify(signInAttempt, null, 2));

                setError("Invalid email or password");
            }

            if (signInAttempt.status === "complete") {
                await setActive(
                    {
                        session: signInAttempt.createdSessionId,
                    }
                )

                router.push("/dashboard")
            }


        } catch (error: any) {
            console.log(JSON.stringify(error, null, 2));
            setError(error.errors[0].message);
        }
    }

    if (!isLoaded) return null;

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-background"
        >
            <Card className='w-full max-w-md'>
                <CardHeader>

                    <CardTitle
                        className="text-2xl font-bold text-center"
                    >
                        Sign In for Todo Master
                    </CardTitle>
                </CardHeader>


                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>

                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        <div className='space-y-2'>

                            <Label htmlFor="password">Password</Label>
                            <div className='relative'>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-2 top-1/2 -translate-y-1/2'
                                >
                                    {
                                        showPassword ? (
                                            <EyeOff
                                                className='w-4 h-4 text-gray-500'
                                            />
                                        ) : (
                                            <Eye
                                                className='w-4 h-4 text-gray-500'
                                            />
                                        )
                                    }

                                </button>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            className='w-full'
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>


                <CardFooter className='justify-center'>
                    <p
                        className='text-sm text-muted-foreground'
                    >
                        Don't have an account?{' '}
                        <Link
                            href="/sign-up"
                            className='font-medium text-primary hover:underline'
                        >
                            Sign Up
                        </Link>
                    </p>
                </CardFooter>

            </Card>
        </div>
    )
}
