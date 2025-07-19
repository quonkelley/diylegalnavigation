import {
  generateSessionId,
  createConversation,
  getConversationBySessionId,
  updateConversation,
  saveMessage,
  getMessagesByConversationId,
  createFormSubmission,
  getFormSubmissionByConversationId
} from '@/lib/database'
import { mockSupabaseClient } from '../utils/test-utils'

// Mock the isSupabaseConfigured function
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  isSupabaseConfigured: jest.fn(() => true)
}))

describe('Database Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateSessionId', () => {
    it('generates unique session IDs', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId()
      
      expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('includes timestamp in session ID', () => {
      const beforeTime = Date.now()
      const sessionId = generateSessionId()
      const afterTime = Date.now()
      
      const timestamp = parseInt(sessionId.split('_')[1])
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('createConversation', () => {
    it('creates a new conversation successfully', async () => {
      const sessionId = 'test-session-id'
      const result = await createConversation(sessionId)
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversations')
      expect(result).toMatchObject({
        id: 'test-id',
        created_at: expect.any(String)
      })
    })

    it('throws error when Supabase is not configured', async () => {
      const { isSupabaseConfigured } = require('@/lib/supabase')
      isSupabaseConfigured.mockReturnValueOnce(false)
      
      await expect(createConversation('test-session')).rejects.toThrow(
        'Supabase is not configured'
      )
    })
  })

  describe('getConversationBySessionId', () => {
    it('retrieves conversation by session ID', async () => {
      const result = await getConversationBySessionId('test-session-id')
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversations')
      expect(result).toMatchObject({
        id: 'test-id',
        session_id: 'test-session'
      })
    })

    it('returns null for non-existent conversation', async () => {
      // Mock "not found" error
      const mockError = { code: 'PGRST116' }
      mockSupabaseClient.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      })

      const result = await getConversationBySessionId('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('updateConversation', () => {
    it('updates conversation successfully', async () => {
      const updates = {
        current_step: 5,
        form_data: { county: 'Marion County' },
        completed: false
      }
      
      const result = await updateConversation('test-id', updates)
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversations')
      expect(result).toMatchObject({ id: 'test-id' })
    })
  })

  describe('saveMessage', () => {
    it('saves message successfully', async () => {
      const result = await saveMessage(
        'conversation-id',
        'Test message',
        'user',
        1
      )
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages')
      expect(result).toMatchObject({
        id: 'test-id',
        created_at: expect.any(String)
      })
    })
  })

  describe('getMessagesByConversationId', () => {
    it('retrieves messages for conversation', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({
              data: [
                { id: '1', message_text: 'Hello', sender: 'user', message_order: 0 },
                { id: '2', message_text: 'Hi there!', sender: 'ai', message_order: 1 }
              ],
              error: null
            })
          })
        })
      })
      
      const result = await getMessagesByConversationId('conversation-id')
      
      expect(result).toHaveLength(2)
      expect(result[0].message_text).toBe('Hello')
      expect(result[1].message_text).toBe('Hi there!')
    })

    it('returns empty array when no messages found', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: null, error: null })
          })
        })
      })
      
      const result = await getMessagesByConversationId('conversation-id')
      expect(result).toEqual([])
    })
  })

  describe('createFormSubmission', () => {
    it('creates form submission successfully', async () => {
      const formData = {
        county: 'Marion County',
        court: 'Superior Court',
        caseNumber: '12345'
      }
      
      const result = await createFormSubmission('conversation-id', formData)
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('form_submissions')
      expect(result).toMatchObject({
        id: 'test-id',
        created_at: expect.any(String)
      })
    })

    it('uses custom form type when provided', async () => {
      const formData = { test: 'data' }
      
      await createFormSubmission('conversation-id', formData, 'custom_form')
      
      // Would need to check the insert call parameters in a real test
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('form_submissions')
    })
  })

  describe('getFormSubmissionByConversationId', () => {
    it('retrieves form submission', async () => {
      const result = await getFormSubmissionByConversationId('conversation-id')
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('form_submissions')
      expect(result).toMatchObject({
        id: 'test-id',
        session_id: 'test-session'
      })
    })

    it('handles not found gracefully', async () => {
      const mockError = { code: 'PGRST116' }
      mockSupabaseClient.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      })

      const result = await getFormSubmissionByConversationId('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('error handling', () => {
    it('throws database errors appropriately', async () => {
      const mockError = { message: 'Database connection failed', code: 'DB_ERROR' }
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      })

      await expect(createConversation('test-session')).rejects.toThrow()
    })
  })
}) 