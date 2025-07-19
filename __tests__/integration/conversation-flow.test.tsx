import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import ChatContainer from '@/components/ChatContainer'
import { mockFetchResponse } from '../utils/test-utils'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'test-session-id'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Complete Conversation Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('completes full eviction form conversation flow', async () => {
    const user = userEvent.setup()

    // Mock initial welcome
    mockFetchResponse({
      response: "Hello! I'm here to help you fill out your Appearance form for your eviction case in Indiana. I'll ask you a series of questions to gather the information needed for your court documents. Let's get started!",
      nextQuestion: "Let's start with the court information. On the papers you received from the court, what County is listed at the very top?",
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    render(<ChatContainer />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Hello! I'm here to help you/)).toBeInTheDocument()
    })

    // Step 1: County
    mockFetchResponse({
      response: "Thank you! And right below the County, what is the name of the Court (e.g., Superior Court, Small Claims Court)?",
      conversationState: { 
        currentStep: 1, 
        formData: { county: 'Marion County' }, 
        completed: false 
      }
    })

    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    await user.type(input, 'Marion County')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('Marion County')).toBeInTheDocument()
      expect(screen.getByText(/what is the name of the Court/)).toBeInTheDocument()
    })

    // Step 2: Court
    mockFetchResponse({
      response: "Great. Now, what is the Case Number? It should be labeled 'Cause No.' or 'Case No.'",
      conversationState: { 
        currentStep: 2, 
        formData: { county: 'Marion County', court: 'Superior Court' }, 
        completed: false 
      }
    })

    await user.clear(input)
    await user.type(input, 'Superior Court')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('Superior Court')).toBeInTheDocument()
      expect(screen.getByText(/what is the Case Number/)).toBeInTheDocument()
    })

    // Step 3: Case Number
    mockFetchResponse({
      response: "What is the full name of the person or company suing you (the Plaintiff)?",
      conversationState: { 
        currentStep: 3, 
        formData: { 
          county: 'Marion County', 
          court: 'Superior Court', 
          caseNumber: '49D10-2023-MF-001234' 
        }, 
        completed: false 
      }
    })

    await user.clear(input)
    await user.type(input, '49D10-2023-MF-001234')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('49D10-2023-MF-001234')).toBeInTheDocument()
      expect(screen.getByText(/full name of the person or company suing you/)).toBeInTheDocument()
    })

    // Continue through remaining steps...
    // Step 4: Plaintiff
    mockFetchResponse({
      response: "And what is your full legal name as the Defendant?",
      conversationState: { 
        currentStep: 4, 
        formData: { 
          county: 'Marion County', 
          court: 'Superior Court', 
          caseNumber: '49D10-2023-MF-001234',
          plaintiff: 'ABC Property Management LLC'
        }, 
        completed: false 
      }
    })

    await user.clear(input)
    await user.type(input, 'ABC Property Management LLC')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('ABC Property Management LLC')).toBeInTheDocument()
      expect(screen.getByText(/your full legal name as the Defendant/)).toBeInTheDocument()
    })

    // Step 5: Defendant
    mockFetchResponse({
      response: "The court requires you to keep your contact information updated. Do you agree to notify the court if your address or phone number changes? (Please answer 'yes' or 'no')",
      conversationState: { 
        currentStep: 5, 
        formData: { 
          county: 'Marion County', 
          court: 'Superior Court', 
          caseNumber: '49D10-2023-MF-001234',
          plaintiff: 'ABC Property Management LLC',
          defendant: 'John Doe'
        }, 
        completed: false 
      }
    })

    await user.clear(input)
    await user.type(input, 'John Doe')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText(/Do you agree to notify the court/)).toBeInTheDocument()
    })

    // Step 6: Agreement (yes/no validation)
    mockFetchResponse({
      response: "To make sure the court can contact you, what is your current mailing address? (Include street, city, state, and zip code)",
      conversationState: { 
        currentStep: 6, 
        formData: { 
          county: 'Marion County', 
          court: 'Superior Court', 
          caseNumber: '49D10-2023-MF-001234',
          plaintiff: 'ABC Property Management LLC',
          defendant: 'John Doe',
          agreeToNotify: true
        }, 
        completed: false 
      }
    })

    await user.clear(input)
    await user.type(input, 'yes')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('yes')).toBeInTheDocument()
      expect(screen.getByText(/current mailing address/)).toBeInTheDocument()
    })

    // Test invalid yes/no answer
    mockFetchResponse({
      response: "Please answer 'yes' or 'no' to whether you agree to notify the court of address changes.",
      conversationState: { 
        currentStep: 5, 
        formData: { 
          county: 'Marion County', 
          court: 'Superior Court', 
          caseNumber: '49D10-2023-MF-001234',
          plaintiff: 'ABC Property Management LLC',
          defendant: 'John Doe'
        }, 
        completed: false 
      }
    })

    // Simulate going back and testing invalid input
    await user.clear(input)
    await user.type(input, 'maybe')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText("Please answer 'yes' or 'no'")).toBeInTheDocument()
    })
  })

  it('handles session persistence correctly', async () => {
    // Mock existing session
    mockFetchResponse({
      response: "Welcome back! Let's continue where we left off.",
      conversationState: { 
        currentStep: 3, 
        formData: { 
          county: 'Marion County', 
          court: 'Superior Court' 
        }, 
        completed: false 
      }
    })

    render(<ChatContainer />)

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    })

    // Verify session ID was retrieved from localStorage
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('legal_navigator_session_id')
  })

  it('displays loading states correctly', async () => {
    mockFetchResponse({
      response: "Welcome message",
      conversationState: { currentStep: 0, formData: {}, completed: false }
    })

    render(<ChatContainer />)

    // Should show loading initially
    expect(screen.getByText('Starting conversation...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Starting conversation...')).not.toBeInTheDocument()
    })
  })

  it('handles form completion and PDF generation', async () => {
    const user = userEvent.setup()

    // Mock completed form state
    mockFetchResponse({
      response: "Perfect! I've collected all the information needed for your Appearance form. Your form is now ready to be generated. Would you like me to create your PDF document?",
      conversationState: { 
        currentStep: 9, 
        formData: { 
          county: 'Marion County',
          court: 'Superior Court',
          caseNumber: '49D10-2023-MF-001234',
          plaintiff: 'ABC Property Management LLC',
          defendant: 'John Doe',
          agreeToNotify: true,
          mailingAddress: '123 Main St, Indianapolis, IN 46201',
          phone: '555-123-4567',
          email: 'john@example.com'
        }, 
        completed: true 
      },
      formCompleted: true
    })

    render(<ChatContainer />)

    await waitFor(() => {
      expect(screen.getByText(/Perfect! I've collected all the information/)).toBeInTheDocument()
    })

    // Mock PDF generation
    mockFetchResponse({
      response: "Great! I'll generate your PDF now. Please wait a moment...",
      conversationState: { 
        currentStep: 9, 
        formData: { 
          county: 'Marion County',
          // ... full form data
        }, 
        completed: true 
      },
      generatePdf: true
    })

    const input = screen.getByPlaceholderText('Ask me about your legal form...')
    await user.type(input, 'yes')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText(/I'll generate your PDF now/)).toBeInTheDocument()
      expect(screen.getByText(/PDF generation is being implemented/)).toBeInTheDocument()
    })
  })
}) 