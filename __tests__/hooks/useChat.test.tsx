import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import { mockFetchResponse, waitForAsync } from '../utils/test-utils'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('useChat Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('test-session-id')
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChat())
    
    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(true) // Loading during initialization
    expect(result.current.formCompleted).toBe(false)
    expect(result.current.conversationState).toBeNull()
    expect(result.current.sessionId).toBe('')
  })

  it('generates and stores session ID on first load', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    mockFetchResponse({
      response: 'Welcome message',
      nextQuestion: 'First question',
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'legal_navigator_session_id',
      expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
    )
  })

  it('initializes chat conversation on mount', async () => {
    mockFetchResponse({
      response: 'Welcome to DIY Legal Navigator!',
      nextQuestion: 'Let\'s start with the court information.',
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: null,
        conversationState: null,
        sessionId: 'test-session-id'
      })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].text).toContain('Welcome to DIY Legal Navigator!')
    expect(result.current.messages[0].sender).toBe('ai')
  })

  it('handles message sending correctly', async () => {
    // Setup initial state
    mockFetchResponse({
      response: 'Welcome message',
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Mock response for message
    mockFetchResponse({
      response: 'Thank you! What is the name of the Court?',
      conversationState: { 
        currentStep: 1, 
        formData: { county: 'Marion County' }, 
        completed: false 
      }
    })

    // Send message
    await act(async () => {
      result.current.handleSendMessage('Marion County')
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.messages).toHaveLength(3) // Welcome + user message + AI response
    expect(result.current.messages[1].text).toBe('Marion County')
    expect(result.current.messages[1].sender).toBe('user')
    expect(result.current.messages[2].text).toBe('Thank you! What is the name of the Court?')
    expect(result.current.messages[2].sender).toBe('ai')
  })

  it('handles form completion', async () => {
    // Setup initial state
    mockFetchResponse({
      response: 'Welcome message',
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Mock form completion response
    mockFetchResponse({
      response: 'Perfect! Your form is ready to be generated.',
      conversationState: { 
        currentStep: 9, 
        formData: { 
          county: 'Marion County',
          court: 'Superior Court',
          // ... other form fields
        }, 
        completed: true 
      },
      formCompleted: true
    })

    await act(async () => {
      result.current.handleSendMessage('john@example.com')
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.formCompleted).toBe(true)
    expect(result.current.conversationState?.completed).toBe(true)
  })

  it('handles PDF generation request', async () => {
    // Setup completed form state
    mockFetchResponse({
      response: 'Welcome message',
      conversationState: { 
        currentStep: 9, 
        formData: { county: 'Marion County' }, 
        completed: true 
      }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Mock PDF generation response
    mockFetchResponse({
      response: 'Great! I\'ll generate your PDF now.',
      conversationState: { 
        currentStep: 9, 
        formData: { county: 'Marion County' }, 
        completed: true 
      },
      generatePdf: true
    })

    await act(async () => {
      result.current.handleSendMessage('yes')
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.messages).toHaveLength(4) // Welcome + user 'yes' + AI response + PDF message
    expect(result.current.messages[3].text).toBe('PDF generation is being implemented. Your form data has been collected successfully!')
  })

  it('handles API errors gracefully', async () => {
    mockFetchResponse({ error: 'Internal server error' }, 500)

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].text).toContain('error starting our conversation')
    expect(result.current.messages[0].sender).toBe('ai')
  })

  it('does not send empty messages', async () => {
    mockFetchResponse({
      response: 'Welcome message',
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialMessageCount = result.current.messages.length

    await act(async () => {
      result.current.handleSendMessage('')
    })

    expect(result.current.messages).toHaveLength(initialMessageCount)
    expect(global.fetch).toHaveBeenCalledTimes(1) // Only initial call
  })

  it('handles network errors during message sending', async () => {
    // Setup initial state
    mockFetchResponse({
      response: 'Welcome message',
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    const { result } = renderHook(() => useChat())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Mock network error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      result.current.handleSendMessage('Test message')
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.messages).toHaveLength(3) // Welcome + user message + error message
    expect(result.current.messages[2].text).toContain('error processing your message')
    expect(result.current.messages[2].sender).toBe('ai')
  })
}) 