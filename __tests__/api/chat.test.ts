import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

// Mock the database functions
jest.mock('@/lib/database', () => ({
  generateSessionId: jest.fn(() => 'test-session-id'),
  createConversation: jest.fn(() => Promise.resolve({
    id: 'test-conversation-id',
    session_id: 'test-session-id',
    current_step: 0,
    form_data: {},
    completed: false
  })),
  getConversationBySessionId: jest.fn(() => Promise.resolve({
    id: 'test-conversation-id',
    session_id: 'test-session-id',
    current_step: 2,
    form_data: { county: 'Marion County', court: 'Superior Court' },
    completed: false
  })),
  updateConversation: jest.fn(() => Promise.resolve({
    id: 'test-conversation-id',
    current_step: 3,
    form_data: { county: 'Marion County', court: 'Superior Court', caseNumber: '12345' },
    completed: false
  })),
  saveMessage: jest.fn(() => Promise.resolve({
    id: 'test-message-id',
    conversation_id: 'test-conversation-id',
    message_text: 'Test message',
    sender: 'user',
    message_order: 1
  })),
  getMessagesByConversationId: jest.fn(() => Promise.resolve([
    { id: '1', message_text: 'Welcome', sender: 'ai', message_order: 0 },
    { id: '2', message_text: 'Marion County', sender: 'user', message_order: 1 }
  ])),
  createFormSubmission: jest.fn(() => Promise.resolve({
    id: 'test-submission-id',
    conversation_id: 'test-conversation-id',
    form_data: {}
  }))
}))

const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body)
  } as unknown as NextRequest
}

describe('/api/chat API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles initial conversation setup', async () => {
    const request = createMockRequest({
      message: null,
      conversationState: null,
      sessionId: null
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe("Hello! I'm here to help you fill out your Appearance form for your eviction case in Indiana. I'll ask you a series of questions to gather the information needed for your court documents. Let's get started!")
    expect(data.nextQuestion).toBe("Let's start with the court information. On the papers you received from the court, what County is listed at the very top?")
    expect(data.conversationState).toMatchObject({
      currentStep: 0,
      formData: {},
      completed: false,
      conversationId: 'test-conversation-id',
      sessionId: 'test-session-id'
    })
  })

  it('processes first question answer (county)', async () => {
    const request = createMockRequest({
      message: 'Marion County',
      conversationState: {
        currentStep: 0,
        formData: {},
        completed: false,
        conversationId: 'test-conversation-id',
        sessionId: 'test-session-id'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe("Thank you! And right below the County, what is the name of the Court (e.g., Superior Court, Small Claims Court)?")
    expect(data.conversationState.currentStep).toBe(1)
    expect(data.conversationState.formData.county).toBe('Marion County')
  })

  it('validates yes/no questions correctly', async () => {
    const request = createMockRequest({
      message: 'maybe',
      conversationState: {
        currentStep: 5, // agreeToNotify step
        formData: {
          county: 'Marion County',
          court: 'Superior Court',
          caseNumber: '12345',
          plaintiff: 'ABC Management',
          defendant: 'John Doe'
        },
        completed: false,
        conversationId: 'test-conversation-id'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe("Please answer 'yes' or 'no' to whether you agree to notify the court of address changes.")
    expect(data.conversationState.currentStep).toBe(5) // Should not advance
  })

  it('processes yes answer correctly', async () => {
    const request = createMockRequest({
      message: 'yes',
      conversationState: {
        currentStep: 5, // agreeToNotify step
        formData: {
          county: 'Marion County',
          court: 'Superior Court',
          caseNumber: '12345',
          plaintiff: 'ABC Management',
          defendant: 'John Doe'
        },
        completed: false,
        conversationId: 'test-conversation-id'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.conversationState.formData.agreeToNotify).toBe(true)
    expect(data.conversationState.currentStep).toBe(6)
    expect(data.response).toContain('To make sure the court can contact you')
  })

  it('completes form after all questions', async () => {
    const request = createMockRequest({
      message: 'john@example.com',
      conversationState: {
        currentStep: 8, // Last question (email)
        formData: {
          county: 'Marion County',
          court: 'Superior Court',
          caseNumber: '12345',
          plaintiff: 'ABC Management',
          defendant: 'John Doe',
          agreeToNotify: true,
          mailingAddress: '123 Main St, Indianapolis, IN 46201',
          phone: '555-123-4567'
        },
        completed: false,
        conversationId: 'test-conversation-id'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe("Perfect! I've collected all the information needed for your Appearance form. Your form is now ready to be generated. Would you like me to create your PDF document?")
    expect(data.conversationState.completed).toBe(true)
    expect(data.formCompleted).toBe(true)
    expect(data.conversationState.formData.email).toBe('john@example.com')
  })

  it('handles PDF generation request', async () => {
    const request = createMockRequest({
      message: 'yes',
      conversationState: {
        currentStep: 9,
        formData: {
          county: 'Marion County',
          court: 'Superior Court',
          caseNumber: '12345',
          plaintiff: 'ABC Management',
          defendant: 'John Doe',
          agreeToNotify: true,
          mailingAddress: '123 Main St, Indianapolis, IN 46201',
          phone: '555-123-4567',
          email: 'john@example.com'
        },
        completed: true,
        conversationId: 'test-conversation-id'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe("Great! I'll generate your PDF now. Please wait a moment...")
    expect(data.generatePdf).toBe(true)
  })

  it('retrieves existing conversation by session ID', async () => {
    const request = createMockRequest({
      message: null,
      conversationState: null,
      sessionId: 'existing-session-id'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.conversationState.currentStep).toBe(2)
    expect(data.conversationState.formData).toMatchObject({
      county: 'Marion County',
      court: 'Superior Court'
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock database error
    const { createConversation } = require('@/lib/database')
    createConversation.mockRejectedValueOnce(new Error('Database error'))

    const request = createMockRequest({
      message: null,
      conversationState: null,
      sessionId: null
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('handles invalid JSON request', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
}) 