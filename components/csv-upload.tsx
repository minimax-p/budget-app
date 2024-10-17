'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {predefinedCategories} from "@/lib/contants";

type ParsedTransaction = {
    timestamp: string
    notes: string
    amount: number
    category: string
    tag: string
    counterparty: string
}

export function CSVUpload() {
    const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [customTag, setCustomTag] = useState('')

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result as string
                const lines = content.split('\n')
                const parsed = lines.slice(1).map(line => {
                    const [postingDate, description, amount] = line.split(',')

                    // Manual date parsing
                    const dateParts = postingDate.split('/');

                    // Ensure the dateParts have the expected length
                    if (dateParts.length !== 3) {
                        console.error('Invalid date format:', postingDate);
                        return null; // Skip this entry
                    }

                    const month = parseInt(dateParts[0], 10) - 1; // Month is 0-based in JavaScript
                    const day = parseInt(dateParts[1], 10);
                    const year = parseInt(dateParts[2], 10);

                    // Log parsed values for debugging
                    console.log(`Parsed Date - Year: ${year}, Month: ${month + 1}, Day: ${day}`);

                    // Create a new Date object
                    const date = new Date(year, month, day);

                    // Check if the date is valid
                    if (isNaN(date.getTime())) {
                        console.error('Invalid Date:', postingDate);
                        return null; // Skip this entry
                    }

                    return {
                        timestamp: date.toISOString(),
                        notes: description,
                        amount: parseFloat(amount),
                        category: '',
                        tag: '',
                        counterparty: ''
                    }
                });

                // Filter out null values and assert the type
                const validParsedTransactions = parsed.filter((transaction): transaction is ParsedTransaction => transaction !== null && !isNaN(transaction.amount));

                setParsedTransactions(validParsedTransactions); // Pass only valid transactions
                setCurrentIndex(0);
            }
            reader.readAsText(file);
        }
    }



    const handleInputChange = (field: keyof ParsedTransaction, value: string) => {
        setParsedTransactions(prev =>
            prev.map((t, i) => i === currentIndex ? { ...t, [field]: value } : t)
        )
    }

    const handleNext = async () => {
        if (currentIndex < parsedTransactions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setCustomTag('')
        } else {
            // All transactions processed, send to API
            try {
                const response = await fetch('/api/transactions/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parsedTransactions),
                })
                if (!response.ok) {
                    throw new Error('Failed to add transactions')
                }
                toast({
                    title: "Success",
                    description: `${parsedTransactions.length} transactions added successfully.`,
                })
                setParsedTransactions([])
                setCurrentIndex(0)
            } catch (error) {
                console.error('Error adding transactions:', error)
                toast({
                    title: "Error",
                    description: "Failed to add transactions. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload CSV</CardTitle>
            </CardHeader>
            <CardContent>
                <Input type="file" accept=".csv" onChange={handleFileUpload} />
                {parsedTransactions.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Transaction {currentIndex + 1} of {parsedTransactions.length}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <Label htmlFor="timestamp">Timestamp</Label>
                                <Input id="timestamp" value={new Date(parsedTransactions[currentIndex].timestamp).toLocaleString()} disabled />
                            </div>
                            <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" value={parsedTransactions[currentIndex].amount} disabled />
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" value={parsedTransactions[currentIndex].notes} disabled />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={parsedTransactions[currentIndex].category}
                                    onValueChange={(value) => handleInputChange('category', value)}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(predefinedCategories).map((category) => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="tag">Tag</Label>
                                <Select
                                    value={parsedTransactions[currentIndex].tag}
                                    onValueChange={(value) => {
                                        if (value === 'custom') {
                                            setCustomTag('')
                                        } else {
                                            handleInputChange('tag', value)
                                        }
                                    }}
                                >
                                    <SelectTrigger id="tag">
                                        <SelectValue placeholder="Tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parsedTransactions[currentIndex].category &&
                                            predefinedCategories[
                                                parsedTransactions[currentIndex].category as keyof typeof predefinedCategories
                                                ]?.map((tag:any) => (
                                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                        ))}
                                        <SelectItem value="custom">Add Custom Tag</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {parsedTransactions[currentIndex].tag === 'custom' && (
                                <div>
                                    <Label htmlFor="customTag">Custom Tag</Label>
                                    <div className="flex">
                                        <Input
                                            id="customTag"
                                            placeholder="Enter custom tag"
                                            value={customTag}
                                            onChange={(e) => {
                                                setCustomTag(e.target.value)
                                                handleInputChange('tag', e.target.value)
                                            }}
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
                                                            onClick={() => {
                                                                const newTag = emoji + ' ' + customTag
                                                                setCustomTag(newTag)
                                                                handleInputChange('tag', newTag)
                                                            }}
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
                                <Label htmlFor="counterparty">Counterparty</Label>
                                <Input
                                    id="counterparty"
                                    value={parsedTransactions[currentIndex].counterparty}
                                    onChange={(e) => handleInputChange('counterparty', e.target.value)}
                                />
                            </div>
                        </div>
                        <Button className="mt-4" onClick={handleNext}>
                            {currentIndex < parsedTransactions.length - 1 ? 'Next' : 'Finish'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}