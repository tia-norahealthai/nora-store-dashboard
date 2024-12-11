export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Help with React Components',
    messages: [
      {
        id: '1-1',
        role: 'user',
        content: 'How do I create a reusable button component in React?',
        timestamp: '2024-03-15T10:30:00Z'
      },
      {
        id: '1-2',
        role: 'assistant',
        content: 'To create a reusable button component, you can start by...',
        timestamp: '2024-03-15T10:30:15Z'
      }
    ],
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:15Z'
  },
  {
    id: '2',
    title: 'TypeScript Types Question',
    messages: [
      {
        id: '2-1',
        role: 'user',
        content: 'What\'s the difference between type and interface in TypeScript?',
        timestamp: '2024-03-14T15:20:00Z'
      },
      {
        id: '2-2',
        role: 'assistant',
        content: 'The main differences between types and interfaces are...',
        timestamp: '2024-03-14T15:20:30Z'
      }
    ],
    createdAt: '2024-03-14T15:20:00Z',
    updatedAt: '2024-03-14T15:20:30Z'
  },
  {
    id: '3',
    title: 'Next.js Routing',
    messages: [
      {
        id: '3-1',
        role: 'user',
        content: 'How do I implement dynamic routing in Next.js 13?',
        timestamp: '2024-03-13T09:15:00Z'
      },
      {
        id: '3-2',
        role: 'assistant',
        content: 'In Next.js 13, you can create dynamic routes by...',
        timestamp: '2024-03-13T09:15:45Z'
      }
    ],
    createdAt: '2024-03-13T09:15:00Z',
    updatedAt: '2024-03-13T09:15:45Z'
  }
] 