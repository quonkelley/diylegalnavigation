import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock Supabase client for testing
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { id: 'test-id', created_at: new Date().toISOString() },
          error: null
        }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { id: 'test-id', session_id: 'test-session' },
          error: null
        }))
      })),
      order: jest.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-id' },
            error: null
          }))
        }))
      }))
    }))
  }))
}

// Mock the Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  isSupabaseConfigured: jest.fn(() => true)
}))

// Custom render function that includes any providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  text: 'Test message',
  sender: 'user' as const,
  timestamp: new Date(),
  ...overrides
})

export const createMockConversationState = (overrides = {}) => ({
  currentStep: 0,
  formData: {},
  completed: false,
  conversationId: 'test-conversation-id',
  sessionId: 'test-session-id',
  ...overrides
})

// Mock fetch responses
export const mockFetchResponse = (data: any, status = 200) => {
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  }
  ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
  return mockResponse
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0)) 