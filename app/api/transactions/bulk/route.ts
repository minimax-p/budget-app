import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const transactions = await prisma.transaction.createMany({
            data: body.map((t: any) => ({
                type: t.amount > 0 ? 'income' : 'expense',
                category: t.category,
                amount: Math.abs(t.amount),
                timestamp: new Date(t.timestamp),
                counterparty: t.counterparty,
                tag: t.tag,
                notes: t.notes,
            })),
        })
        return NextResponse.json(transactions)
    } catch (error) {
        console.error('Failed to create transactions:', error)
        return NextResponse.json({ error: 'Failed to create transactions' }, { status: 500 })
    }
}