import { dbReadFile as readFile, dbWriteFile as writeFile } from './db'
import path from 'path'
import type { Ticket, TicketNote, TicketStatus } from './types'

const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json')

export async function listTickets(): Promise<Ticket[]> {
  try {
    const data = await readFile(ticketsPath)
    const tickets: Ticket[] = JSON.parse(data)
    return tickets
  } catch {
    return []
  }
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const tickets = await listTickets()
  return tickets.find(t => t.id === id) ?? null
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'> & { status?: TicketStatus }): Promise<Ticket> {
  const tickets = await listTickets()
  const newTicket: Ticket = {
    ...ticket,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    status: ticket.status ?? 'open',
    notes: ticket.notes ?? [],
  }
  tickets.push(newTicket)
  await writeFile(ticketsPath, JSON.stringify(tickets, null, 2))
  return newTicket
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
  const tickets = await listTickets()
  const idx = tickets.findIndex(t => t.id === id)
  if (idx === -1) return null
  const updated: Ticket = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() }
  tickets[idx] = updated
  await writeFile(ticketsPath, JSON.stringify(tickets, null, 2))
  return updated
}

export async function deleteTicket(id: string): Promise<boolean> {
  const tickets = await listTickets()
  const next = tickets.filter(t => t.id !== id)
  await writeFile(ticketsPath, JSON.stringify(next, null, 2))
  return next.length !== tickets.length
}

export async function addTicketNote(id: string, note: Omit<TicketNote, 'id' | 'timestamp'>): Promise<Ticket | null> {
  const ticket = await getTicket(id)
  if (!ticket) return null
  const newNote: TicketNote = {
    ...note,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
    timestamp: new Date().toISOString(),
  }
  const notes = [...(ticket.notes || []), newNote]
  return updateTicket(id, { notes })
}
