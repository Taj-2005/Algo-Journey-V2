import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        const usersArray = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                section: true,
                individualPoints: true,
                email: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                individualPoints: 'desc'
            }
        })
        const totalGroups = await prisma.group.count()

        const totalContests = await prisma.contest.count()
        
        const totalUsers = usersArray.length
        
        const response = {
            totalUsers,
            totalGroups,
            totalContests,
            usersArray,
        }   
        console.log(response)
        return NextResponse.json(response, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

