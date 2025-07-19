import { supabase, isSupabaseConfigured, type Tables, type InsertTables } from './supabase'

// Fallback error for when Supabase is not configured
function throwNotConfiguredError(): never {
  throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

// Generate a unique session ID for new conversations
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a new conversation
export async function createConversation(sessionId: string) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      session_id: sessionId,
      current_step: 0,
      form_data: {},
      completed: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw error
  }

  return data
}

// Get conversation by session ID
export async function getConversationBySessionId(sessionId: string) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching conversation:', error)
    throw error
  }

  return data
}

// Update conversation progress
export async function updateConversation(
  conversationId: string, 
  updates: Partial<Pick<Tables<'conversations'>, 'current_step' | 'form_data' | 'completed'>>
) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversation:', error)
    throw error
  }

  return data
}

// Save a message to the database
export async function saveMessage(
  conversationId: string,
  messageText: string,
  sender: 'user' | 'ai',
  messageOrder: number
) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      message_text: messageText,
      sender,
      message_order: messageOrder
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    throw error
  }

  return data
}

// Get all messages for a conversation
export async function getMessagesByConversationId(conversationId: string) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('message_order', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    throw error
  }

  return data || []
}

// Create a form submission record
export async function createFormSubmission(
  conversationId: string,
  formData: Record<string, any>,
  formType: string = 'appearance_form'
) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('form_submissions')
    .insert({
      conversation_id: conversationId,
      form_type: formType,
      form_data: formData,
      pdf_generated: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating form submission:', error)
    throw error
  }

  return data
}

// Get form submission by conversation ID
export async function getFormSubmissionByConversationId(conversationId: string) {
  if (!isSupabaseConfigured()) throwNotConfiguredError();

  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('conversation_id', conversationId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching form submission:', error)
    throw error
  }

  return data
} 