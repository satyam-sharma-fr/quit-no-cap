import { auth } from "@/auth"

export async function getSession(): Promise<{
  id: string
  name: string
  email: string
  image?: string | null
} | null> {
  try {
    const session = await auth()
    if (!session?.user?.id) return null
    return {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      image: session.user.image,
    }
  } catch (e) {
    console.error("getSession error:", e)
    return null
  }
}
