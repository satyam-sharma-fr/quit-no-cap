import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignup: { label: "Is Signup", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials.email as string
        const password = credentials.password as string
        const name = credentials.name as string | undefined
        const isSignup = credentials.isSignup === "true"

        if (!email || !password) return null

        if (isSignup) {
          // Check if user already exists
          const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .single()

          if (existing) {
            throw new Error("Email already taken")
          }

          const passwordHash = await bcrypt.hash(password, 12)

          const { data: newUser, error } = await supabase
            .from("profiles")
            .insert({
              email,
              password_hash: passwordHash,
              name: name || email.split("@")[0],
              username: email.split("@")[0],
            })
            .select("id, email, name, image")
            .single()

          if (error || !newUser) return null

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            image: newUser.image,
          }
        } else {
          // Login
          const { data: user } = await supabase
            .from("profiles")
            .select("id, email, name, image, password_hash")
            .eq("email", email)
            .single()

          if (!user || !user.password_hash) return null

          const valid = await bcrypt.compare(password, user.password_hash)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", user.email)
          .single()

        if (!existing) {
          await supabase.from("profiles").insert({
            email: user.email,
            name: user.name || user.email.split("@")[0],
            image: user.image || null,
            username: user.email.split("@")[0],
          })
        } else {
          await supabase
            .from("profiles")
            .update({
              name: user.name || undefined,
              image: user.image || undefined,
            })
            .eq("id", existing.id)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        // For credentials provider, user.id is already the profile id
        // For Google, we need to look it up
        if (user.id && user.id.length === 36) {
          // UUID from credentials provider
          token.profileId = user.id
          token.profileName = user.name
          token.profileImage = user.image
        } else if (user.email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, name, email, image")
            .eq("email", user.email)
            .single()

          if (profile) {
            token.profileId = profile.id
            token.profileName = profile.name
            token.profileImage = profile.image
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.profileId) {
        session.user.id = token.profileId as string
        session.user.name = (token.profileName as string) || session.user.name
        session.user.image = (token.profileImage as string) || session.user.image
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
})
