import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        // @ts-ignore
        const transactions = await prisma.transaction.findMany({
            orderBy: { timestamp: 'desc' },
        })
        return NextResponse.json(transactions)
    } catch (error) {
        console.error('Failed to fetch transactions:', error)
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const transaction = await prisma.transaction.create({
            data: {
                type: body.type,
                category: body.category,
                amount: body.amount,
                timestamp: new Date(body.timestamp),
                counterparty: body.counterparty,
                tag: body.tag,
                notes: body.notes,
            },
        })
        return NextResponse.json(transaction)
    } catch (error) {
        console.error('Failed to create transaction:', error)
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        await prisma.transaction.delete({
            where: { id: Number(id) },
        })
        return NextResponse.json({ message: 'Transaction deleted' })
    } catch (error) {
        console.error('Failed to delete transaction:', error)
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
    }
}