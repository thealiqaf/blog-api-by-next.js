import { prisma } from "@/app/lib/db"
import { User } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function getUserFromDb(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } })
  
    if (!user || !user.hashedPassword) return null
  
    const isValid = await bcrypt.compare(password, user.hashedPassword)
    if (!isValid) return null
  
    return user
  }