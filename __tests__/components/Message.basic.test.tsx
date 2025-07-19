import { render, screen } from '@testing-library/react'
import Message from '../../components/Message'

// Test data factory
const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  text: 'Test message',
  sender: 'user' as const,
  timestamp: new Date(),
  ...overrides
})

describe('Message Component (Basic)', () => {
  it('renders user message correctly', () => {
    const mockMessage = createMockMessage({
      text: 'Hello, I need help with my eviction form',
      sender: 'user'
    })

    render(<Message message={mockMessage} />)
    
    expect(screen.getByText('Hello, I need help with my eviction form')).toBeInTheDocument()
    expect(screen.getByText(mockMessage.timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }))).toBeInTheDocument()
  })

  it('renders AI message correctly', () => {
    const mockMessage = createMockMessage({
      text: 'I can help you with that! Let\'s start with the court information.',
      sender: 'ai'
    })

    render(<Message message={mockMessage} />)
    
    expect(screen.getByText('I can help you with that! Let\'s start with the court information.')).toBeInTheDocument()
  })

  it('applies correct styling for user messages', () => {
    const mockMessage = createMockMessage({
      text: 'User message',
      sender: 'user'
    })

    render(<Message message={mockMessage} />)
    
    const messageContainer = screen.getByText('User message').closest('div')
    expect(messageContainer).toHaveClass('bg-blue-600', 'text-white', 'rounded-br-none')
  })

  it('applies correct styling for AI messages', () => {
    const mockMessage = createMockMessage({
      text: 'AI message',
      sender: 'ai'
    })

    render(<Message message={mockMessage} />)
    
    const messageContainer = screen.getByText('AI message').closest('div')
    expect(messageContainer).toHaveClass('bg-gray-700', 'text-gray-100', 'rounded-bl-none')
  })

  it('handles multiline text correctly', () => {
    const mockMessage = createMockMessage({
      text: 'Line 1\nLine 2\nLine 3',
      sender: 'user'
    })

    render(<Message message={mockMessage} />)
    
    // Use a more flexible text matcher for multiline content
    const messageText = screen.getByText((content, node) => {
      const hasText = (node: Element | null) => 
        node?.textContent === 'Line 1\nLine 2\nLine 3'
      return hasText(node)
    })
    expect(messageText).toHaveClass('whitespace-pre-wrap')
  })
}) 