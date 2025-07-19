import { render, screen } from '../utils/test-utils'
import MessageList from '@/components/MessageList'
import { createMockMessage } from '../utils/test-utils'

// Mock the Message component to focus on MessageList logic
jest.mock('@/components/Message', () => {
  return function MockMessage({ message }: { message: any }) {
    return <div data-testid={`message-${message.id}`}>{message.text}</div>
  }
})

describe('MessageList Component', () => {
  it('displays welcome message when no messages', () => {
    render(<MessageList messages={[]} />)
    
    expect(screen.getByText('Welcome to DIY Legal Navigator!')).toBeInTheDocument()
    expect(screen.getByText('I\'ll help you fill out your Appearance form for your eviction case.')).toBeInTheDocument()
    expect(screen.getByText('Starting conversation...')).toBeInTheDocument()
  })

  it('renders list of messages', () => {
    const messages = [
      createMockMessage({ id: '1', text: 'First message', sender: 'user' }),
      createMockMessage({ id: '2', text: 'Second message', sender: 'ai' }),
      createMockMessage({ id: '3', text: 'Third message', sender: 'user' })
    ]

    render(<MessageList messages={messages} />)
    
    expect(screen.getByTestId('message-1')).toBeInTheDocument()
    expect(screen.getByTestId('message-2')).toBeInTheDocument()
    expect(screen.getByTestId('message-3')).toBeInTheDocument()
    
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
    expect(screen.getByText('Third message')).toBeInTheDocument()
  })

  it('does not show welcome message when messages exist', () => {
    const messages = [
      createMockMessage({ id: '1', text: 'Hello', sender: 'user' })
    ]

    render(<MessageList messages={messages} />)
    
    expect(screen.queryByText('Welcome to DIY Legal Navigator!')).not.toBeInTheDocument()
    expect(screen.getByTestId('message-1')).toBeInTheDocument()
  })

  it('has correct scroll container styling', () => {
    const messages = [
      createMockMessage({ id: '1', text: 'Test message', sender: 'user' })
    ]

    render(<MessageList messages={messages} />)
    
    const scrollContainer = screen.getByText('Test message').closest('.overflow-y-auto')
    expect(scrollContainer).toHaveClass('flex-1', 'overflow-y-auto', 'p-4', 'space-y-4')
  })

  it('renders messages in correct order', () => {
    const messages = [
      createMockMessage({ id: '1', text: 'First message', sender: 'user' }),
      createMockMessage({ id: '2', text: 'Second message', sender: 'ai' }),
      createMockMessage({ id: '3', text: 'Third message', sender: 'user' })
    ]

    render(<MessageList messages={messages} />)
    
    const messageElements = screen.getAllByTestId(/message-/)
    expect(messageElements).toHaveLength(3)
    expect(messageElements[0]).toHaveAttribute('data-testid', 'message-1')
    expect(messageElements[1]).toHaveAttribute('data-testid', 'message-2')
    expect(messageElements[2]).toHaveAttribute('data-testid', 'message-3')
  })
}) 