"use client";

import { useSignUp } from '@clerk/nextjs';
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


export default function Signup() {

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [error, setError] = React.useState("");

    const { signUp, isLoaded, setActive } = useSignUp();

    const router = useRouter();


    if (!isLoaded) return null

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault();

        if (!isLoaded) return null;

        try {
            //NOTE - user creation flow
            await signUp?.create({
                emailAddress,
                password,
            })

            //NOTE - user verification flow
            await signUp?.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setPendingVerification(true);

        } catch (error: any) {
            console.log(JSON.stringify(error, null, 2));
            setError(error.errors[0].message);



        }
    }

    async function handleVerificationSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isLoaded) return null;

        try {
            const signupAttempt = await signUp?.attemptEmailAddressVerification({
                code,
            })

            if (signupAttempt.status !== "complete") {
                setError("Invalid code");

                console.log(JSON.stringify(signupAttempt, null, 2));
            }

            if (signupAttempt.status === "complete") {
                await setActive({
                    session: signupAttempt.createdSessionId
                })

                router.push("/dashboard")
            }


        } catch (error: any) {
            console.log(JSON.stringify(error, null, 2));
            setError(error.errors[0].message);

        }
    }

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-background"
        >
            <Card className="w-full max-w-md">
                <CardHeader>

                    <CardTitle
                        className="text-2xl font-bold text-center"
                    >
                        Sign Up for Todo Master
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    {!pendingVerification ? (

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-2">

                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={emailAddress}
                                    onChange={(event) => setEmailAddress(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">

                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full">
                                Sign Up
                            </Button>
                        </form>

                    ) : (

                        <form
                            onSubmit={handleVerificationSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-2">

                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    placeholder="Enter verification code"
                                    required
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full">
                                Verify Email
                            </Button>
                        </form>

                    )}
                </CardContent>

                <CardFooter className="justify-center">
                    <p
                        className="text-sm text-muted-foreground"
                    >
                        Already have an account?{" "}
                        <Link
                            href="/sign-in"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>

            </Card>
        </div>
    );
}
