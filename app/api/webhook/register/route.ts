import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('WEBHOOK_SECRET is not defined. Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local file.')
    }

    //NOTE - Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    //NOTE - Check the availability of headers
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing headers. Please check the headers in the Webhook Request.', {
            status: 400
        });
    }

    //NOTE - Determine body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    //NOTE - Create a new Webhook instance using Svix
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    //NOTE - Verify the payload with the header
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;

        console.log("Event verified:", evt);

    } catch (error) {
        console.error("Error verifying webhook:", error);

        return new Response("Error verifying webhook", {
            status: 400
        })
    }

    const { id } = evt.data;
    const eventType = evt.type;

    //NOTE - logs
    console.log(`Webhook with and ID of ${id} and event type of ${eventType} was received.`);
    console.log("Webhook body: ", body);

    if (eventType === "user.created") {

        try {
            const {
                email_addresses, primary_email_address_id
            } = evt.data;

            //Note - Determine primary email with existing emails
            const primaryEmail = email_addresses
                .find(email => email.id === primary_email_address_id)

            console.log("Primary email:", primaryEmail);
            console.log("Email addresses:", primaryEmail?.email_address);

            //NOTE - Check if primary email exists
            if (!primaryEmail) {
                return new Response('Primary email not found', {
                    status: 404
                })
            }

            //NOTE - Create user in neon (postgres) database
            const newUser = await prisma.user.create({
                data: {
                    id: evt.data.id!,
                    email: primaryEmail.email_address,
                    isSubscribed: false,
                }
            })

            console.log("New user created:", newUser);


        } catch (error) {
            console.error("Error creating user:", error);

            return new Response("Error creating user", {
                status: 400
            })

        }
    }


    return new Response(`Webhook with and ID of ${id} and event type of ${eventType} was received successfully.`, {
        status: 200
    })
}