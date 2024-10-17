'use client'

import {useEffect, useState} from 'react'
import {Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'
import {Moon, Plus, Sun, Trash2} from 'lucide-react'

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {useTheme} from "next-themes"
import {toast} from "@/hooks/use-toast"
import {CSVUpload} from "@/components/csv-upload"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {ScrollArea} from "@/components/ui/scroll-area"

type Transaction = {
    id: number
    type: 'income' | 'expense'
    category: string
    amount: number
    timestamp: string
    counterparty: string
    tag: string
    notes?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const predefinedCategories = {
    'Food & Dining': [
        '🍽️ Restaurants', '🛒 Groceries', '☕ Coffee Shops',
        '🍕 Fast Food', '🍻 Bars & Pubs', '🍱 Takeout', '🍲 Meal Kits',
        '🥡 Food Delivery (UberEats, DoorDash)', '🍦 Snacks & Treats', '🥤 Bubble Tea', '🍰 Desserts'
    ],
    'Transportation': [
        '🚗 Gas', '🚇 Public Transit', '🚕 Taxi/Uber',
        '🚲 Bike Rentals', '🛴 E-Scooters', '🅿️ Parking Fees', '🚗 Car Rentals',
        '🚘 Car Payments', '🔧 Vehicle Maintenance', '🛣️ Toll Fees', '🏎️ Ride Shares (Lyft)'
    ],
    'Housing': [
        '🏠 Rent/Mortgage', '🔧 Utilities', '🛠️ Maintenance',
        '🔌 Internet', '📺 Streaming Services', '🛏️ Home Furnishings', '🧹 Cleaning Services',
        '🔑 Renters Insurance', '🚪 Home Security', '💡 Smart Home Devices', '🛍️ Home Decor'
    ],
    'Entertainment': [
        '🎬 Movies', '🎵 Music', '🎮 Games',
        '🎧 Subscriptions (Netflix, Spotify)', '🎢 Events & Concerts', '📚 Books & eBooks', '🏞️ Outdoor Activities',
        '🃏 Board Games & Puzzles', '🎤 Karaoke', '🎯 Social Clubs & Memberships', '📽️ Digital Media (YouTube, Twitch)'
    ],
    'Shopping': [
        '👚 Clothing', '🛍️ General', '📚 Books',
        '💻 Electronics', '📱 Smartphones & Accessories', '🐾 Pets', '🖥️ Amazon', '💄 Beauty & Grooming', '📦 Online Subscriptions',
        '👠 Footwear', '🎒 Bags & Accessories', '⌚ Watches & Jewelry', '💡 Tech Gadgets', '🔌 Home Appliances'
    ],
    'Health & Fitness': [
        '💊 Healthcare', '🏋️ Gym', '🧘 Wellness',
        '🥗 Nutrition & Supplements', '🧴 Skincare', '🦷 Dental Care', '🏃‍♂️ Sports & Fitness Gear',
        '👓 Vision Care (Glasses/Contacts)', '🧪 Lab Tests & Screenings', '💉 Vaccinations', '🩺 Doctor Visits'
    ],
    'Travel': [
        '✈️ Flights', '🏨 Accommodation', '🍴 Dining Out',
        '🚌 Transportation (Local)', '🚗 Car Rentals', '🏝️ Activities & Tours', '💼 Business Travel',
        '🛏️ Airbnb', '🚤 Cruises', '🏞️ Adventure Trips', '🎒 Backpacking'
    ],
    'Education': [
        '📚 Tuition', '📖 Books', '💻 Online Courses',
        '✍️ Workshops & Bootcamps', '📝 Study Materials', '📜 Certifications', '🎓 Student Loans',
        '🔬 Lab Fees', '📅 Tutoring', '🎥 Educational Subscriptions (Coursera, MasterClass)', '🖥️ Tech for School'
    ],
    'Income': [
        '💼 Salary', '💰 Freelance', '📈 Investments',
        '💸 Side Hustles', '🛒 eCommerce Earnings', '🏦 Dividends & Interest', '🎯 Gig Economy',
        '📝 Content Creation (YouTube, TikTok)', '📦 Reselling (eBay, Poshmark)', '🚗 Ride-Share Driving (Uber, Lyft)', '🎮 Streaming Income (Twitch)'
    ],
    'Self-Care & Personal Development': [
        '🧘 Therapy & Counseling', '📚 Self-Help Books', '🌱 Hobbies & Crafts',
        '💆 Spa & Relaxation', '📖 Journaling & Mindfulness', '🎨 Art Supplies',
        '🎧 Meditation Apps', '🧑‍🏫 Coaching & Mentorship', '✍️ Writing & Blogging', '📸 Photography & Videography Gear'
    ],
    'Subscriptions & Memberships': [
        '📺 Streaming (Netflix, Disney+)', '🎵 Music Subscriptions (Spotify, Apple Music)', '🎮 Gaming (Xbox Live, PS Plus)',
        '🎧 Audiobooks (Audible)', '📰 News & Magazines', '💌 Online Tools (Adobe, Canva)', '📅 Premium App Subscriptions',
        '🏋️ Gym Memberships', '🎓 Educational Platforms (Coursera, Udemy)', '📦 Product Subscriptions (FabFitFun, HelloFresh)'
    ]
};


export default function BudgetApp() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense',
        category: '',
        amount: '',
        timestamp: new Date().toISOString().slice(0, 16),
        counterparty: '',
        tag: '',
        notes: ''
    })
    const [customTag, setCustomTag] = useState('')
    const {theme, setTheme} = useTheme()

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/transactions')
            if (!response.ok) {
                throw new Error('Failed to fetch transactions')
            }
            const data = await response.json()
            setTransactions(data)
        } catch (error) {
            console.error('Error fetching transactions:', error)
            toast({
                title: "Error",
                description: "Failed to fetch transactions. Please try again.",
                variant: "destructive",
            })
        }
    }

    const addTransaction = async () => {
        if (newTransaction.category && newTransaction.amount && newTransaction.counterparty) {
            try {
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...newTransaction,
                        amount: parseFloat(newTransaction.amount),
                        tag: newTransaction.tag || customTag,
                    }),
                })
                if (!response.ok) {
                    throw new Error('Failed to add transaction')
                }
                setNewTransaction({
                    type: 'expense',
                    category: '',
                    amount: '',
                    timestamp: new Date().toISOString().slice(0, 16),
                    counterparty: '',
                    tag: '',
                    notes: ''
                })
                setCustomTag('')
                fetchTransactions()
                toast({
                    title: "Success",
                    description: "Transaction added successfully.",
                })
            } catch (error) {
                console.error('Error adding transaction:', error)
                toast({
                    title: "Error",
                    description: "Failed to add transaction. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    const removeTransaction = async (id: number) => {
        try {
            const response = await fetch(`/api/transactions?id=${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('Failed to delete transaction')
            }
            fetchTransactions()
            toast({
                title: "Success",
                description: "Transaction deleted successfully.",
            })
        } catch (error) {
            console.error('Error deleting transaction:', error)
            toast({
                title: "Error",
                description: "Failed to delete transaction. Please try again.",
                variant: "destructive",
            })
        }
    }

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const savings = totalIncome - totalExpenses

    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {} as Record<string, number>)

    const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({name, value}))

    const balanceOverTime = transactions
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .reduce((acc, t, index) => {
            const prevBalance = index > 0 ? acc[index - 1].balance : 0
            const newBalance = prevBalance + (t.type === 'income' ? t.amount : -t.amount)
            acc.push({date: new Date(t.timestamp).toLocaleDateString(), balance: newBalance})
            return acc
        }, [] as { date: string, balance: number }[])

    return (
        <div className="min-h-screen p-8 bg-background text-foreground">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Personal Budget App</CardTitle>
                    <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Savings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${savings.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Balance Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={balanceOverTime}>
                                    <XAxis dataKey="date"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Line type="monotone" dataKey="balance" stroke="#8884d8"/>
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Transaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={newTransaction.type}
                                        onValueChange={(value) => setNewTransaction({
                                            ...newTransaction,
                                            type: value as 'income' | 'expense'
                                        })}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={newTransaction.category}
                                        onValueChange={(value) =>
                                            setNewTransaction({
                                                ...newTransaction,
                                                category: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(predefinedCategories)
                                                .filter((category) => {
                                                    // Only show "Income" category for income transaction type
                                                    if (newTransaction.type === 'income') {
                                                        return true;
                                                    }
                                                    // Exclude "Income" category if type is "expense"
                                                    return category !== 'Income';
                                                })
                                                .map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="tag">Tag</Label>
                                    <Select
                                        value={newTransaction.tag}
                                        onValueChange={(value) =>
                                            setNewTransaction({...newTransaction, tag: value})
                                        }
                                    >
                                        <SelectTrigger id="tag">
                                            <SelectValue placeholder="Tag"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {newTransaction.category &&
                                                predefinedCategories[
                                                    newTransaction.category as keyof typeof predefinedCategories
                                                    ]?.map((tag: string) => (
                                                    <SelectItem key={tag} value={tag}>
                                                        {tag}
                                                    </SelectItem>
                                                ))}
                                            <SelectItem value="custom">Add Custom Tag</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newTransaction.tag === 'custom' && (
                                    <div>
                                        <Label htmlFor="customTag">Custom Tag</Label>
                                        <div className="flex">
                                            <Input
                                                id="customTag"
                                                placeholder="Enter custom tag"
                                                value={customTag}
                                                onChange={(e) => setCustomTag(e.target.value)}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="ml-2">🙂</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64">
                                                    <div className="grid grid-cols-8 gap-2">
                                                        {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'].map((emoji, index) => (
                                                            <button
                                                                key={index}
                                                                className="text-2xl"
                                                                onClick={() => setCustomTag(prevTag => emoji + ' ' + prevTag)}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Amount"
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="timestamp">Date & Time</Label>
                                    <Input
                                        id="timestamp"
                                        type="datetime-local"
                                        value={newTransaction.timestamp}
                                        onChange={(e) => setNewTransaction({
                                            ...newTransaction,
                                            timestamp: e.target.value
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="counterparty">Counterparty</Label>
                                    <Input
                                        id="counterparty"
                                        placeholder="Counterparty"
                                        value={newTransaction.counterparty}
                                        onChange={(e) => setNewTransaction({
                                            ...newTransaction,
                                            counterparty: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Notes"
                                        value={newTransaction.notes}
                                        onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                                    />
                                </div>
                            </div>

                            <Button className="mt-4 w-full" onClick={addTransaction}>
                                <Plus className="mr-2 h-4 w-4"/> Add Transaction
                            </Button>
                        </CardContent>
                    </Card>

                    <CSVUpload/>

                    <Card>

                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4">
                                    {transactions.map(transaction => (
                                        <div key={transaction.id}
                                             className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                                            <div>
                                                <div className="font-medium">{transaction.category}</div>
                                                <div className="text-sm text-muted-foreground">{transaction.type}</div>
                                                <div
                                                    className="text-sm">{new Date(transaction.timestamp).toLocaleString()}</div>
                                                <div className="text-sm">{transaction.counterparty}</div>
                                                {transaction.tag && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {transaction.tag.split(' ')[0]} {transaction.tag.split(' ').slice(1).join(' ')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                    ${transaction.amount.toFixed(2)}
                                                </div>
                                                <Button variant="ghost" size="icon"
                                                        onClick={() => removeTransaction(transaction.id)}>
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}