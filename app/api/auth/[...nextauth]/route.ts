import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAppClient, viemConnector } from "@farcaster/auth-client";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign in with Farcaster",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        name: {
          label: "Name",
          type: "text",
          placeholder: "0x0",
        },
        pfp: {
          label: "Pfp",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        const csrfToken = (req.body as { csrfToken: string }).csrfToken;
      
        const appClient = createAppClient({
          ethereum: viemConnector(),
        });
      
        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: "scratchnism.vercel.app",
          nonce: csrfToken,
        });
      
        const { success, fid } = verifyResponse;
      
        if (!success) {
          return null;
        }
      
        return {
          id: fid.toString(),
          name: credentials?.name,
          image: credentials?.pfp,
        };
      },
      
    }),
  ],
};

// Default handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
