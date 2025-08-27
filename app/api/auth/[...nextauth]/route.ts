import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


const handler = NextAuth({
providers:[
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
], callbacks:{
    async signIn(params){
      if(!params.user.email){
        return false;
      }
        try {
            await prismaClient.user.create({
              data:{
                email:params.user.email,
                provider:"Google",

              }
            })
        } catch (error) {
         
        }
        return true;
    }
}
})
export {handler as GET, handler as POST}