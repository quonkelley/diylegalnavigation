import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import ChatInput from '@/components/ChatInput'

describe('ChatInput Component', () => {
  const mockOnSendMessage = jest.fn()

  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('renders input field and send button', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />)
    
    expect(screen.getByPlaceholderText('Ask me about your legal form...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('calls onSendMessage when form is submitted with text', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />)
    
    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    const submitButton = screen.getByRole('button', { name: 'Send' })
    
    await user.type(input, 'Marion County')
    await user.click(submitButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Marion County')
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />)
    
    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    
    await user.type(input, 'Test message')
    fireEvent.submit(input.closest('form')!)
    
    expect(input).toHaveValue('')
  })

  it('does not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />)
    
    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    
    // Test empty message
    fireEvent.submit(input.closest('form')!)
    expect(mockOnSendMessage).not.toHaveBeenCalled()
    
    // Test whitespace-only message
    await user.type(input, '   ')
    fireEvent.submit(input.closest('form')!)
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('disables input and button when loading', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />)
    
    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    const submitButton = screen.getByRole('button')
    
    expect(input).toBeDisabled()
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Sending...')).toBeInTheDocument()
  })

  it('shows loading spinner when loading', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('handles Enter key submission', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />)
    
    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    
    await user.type(input, 'Test message{enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('trims whitespace from messages', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />)
    
    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    
    await user.type(input, '  Marion County  ')
    fireEvent.submit(input.closest('form')!)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Marion County')
  })
}) 