import { render, screen } from '../utils/test-utils'
import Message from '@/components/Message'
import { createMockMessage } from '../utils/test-utils'

describe('Message Component', () => {
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
    
    const messageText = screen.getByText((content, element) => {
      return element?.textContent === 'Line 1\nLine 2\nLine 3'
    })
    expect(messageText).toHaveClass('whitespace-pre-wrap')
  })
}) 