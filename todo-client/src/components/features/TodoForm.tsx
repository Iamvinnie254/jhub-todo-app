'use client'
import { useState } from 'react'
import { useCreateTodo } from '@/hooks/useTodos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TodoForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const createTodo = useCreateTodo()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await createTodo.mutateAsync({
      title,
      description: description || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
    })
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New todo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details"
            />
          </div>
          <div className="flex gap-3">
            <div className="space-y-1 flex-1">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1 flex-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createTodo.isPending}>
            {createTodo.isPending ? 'Adding...' : 'Add todo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}