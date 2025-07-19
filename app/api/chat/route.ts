import { NextRequest, NextResponse } from 'next/server';
import {
  generateSessionId,
  createConversation,
  getConversationBySessionId,
  updateConversation,
  saveMessage,
  getMessagesByConversationId,
  createFormSubmission
} from '@/lib/database';

// Define the question sequence for the Appearance form
interface FormData {
  [key: string]: string | boolean | undefined;
  county?: string;
  court?: string;
  caseNumber?: string;
  plaintiff?: string;
  defendant?: string;
  agreeToNotify?: boolean;
  mailingAddress?: string;
  phone?: string;
  email?: string;
}

interface ConversationState {
  currentStep: number;
  formData: FormData;
  completed: boolean;
  conversationId?: string;
  sessionId?: string;
}

const QUESTIONS = [
  {
    id: 'county',
    question: "Let's start with the court information. On the papers you received from the court, what County is listed at the very top?",
    field: 'county' as keyof FormData
  },
  {
    id: 'court',
    question: "And right below the County, what is the name of the Court (e.g., Superior Court, Small Claims Court)?",
    field: 'court' as keyof FormData
  },
  {
    id: 'caseNumber',
    question: "Great. Now, what is the Case Number? It should be labeled 'Cause No.' or 'Case No.'",
    field: 'caseNumber' as keyof FormData
  },
  {
    id: 'plaintiff',
    question: "What is the full name of the person or company suing you (the Plaintiff)?",
    field: 'plaintiff' as keyof FormData
  },
  {
    id: 'defendant',
    question: "And what is your full legal name as the Defendant?",
    field: 'defendant' as keyof FormData
  },
  {
    id: 'agreeToNotify',
    question: "The court requires you to keep your contact information updated. Do you agree to notify the court if your address or phone number changes? (Please answer 'yes' or 'no')",
    field: 'agreeToNotify' as keyof FormData
  },
  {
    id: 'mailingAddress',
    question: "To make sure the court can contact you, what is your current mailing address? (Include street, city, state, and zip code)",
    field: 'mailingAddress' as keyof FormData
  },
  {
    id: 'phone',
    question: "What is your best contact phone number?",
    field: 'phone' as keyof FormData
  },
  {
    id: 'email',
    question: "And what is your email address?",
    field: 'email' as keyof FormData
  }
];

export async function POST(request: NextRequest) {
  try {
    const { message, conversationState, sessionId } = await request.json();

    let state: ConversationState;
    let conversation;
    let messageOrder = 0;

    // Handle new conversation or retrieve existing one
    if (!conversationState && !sessionId) {
      // Create new conversation
      const newSessionId = generateSessionId();
      conversation = await createConversation(newSessionId);
      state = {
        currentStep: 0,
        formData: {},
        completed: false,
        conversationId: conversation.id,
        sessionId: newSessionId
      };
    } else if (sessionId && !conversationState) {
      // Retrieve existing conversation
      conversation = await getConversationBySessionId(sessionId);
      if (conversation) {
        state = {
          currentStep: conversation.current_step,
          formData: conversation.form_data as FormData,
          completed: conversation.completed,
          conversationId: conversation.id,
          sessionId: conversation.session_id
        };
        // Get message count for ordering
        const messages = await getMessagesByConversationId(conversation.id);
        messageOrder = messages.length;
      } else {
        // Session doesn't exist, create new one
        const newSessionId = generateSessionId();
        conversation = await createConversation(newSessionId);
        state = {
          currentStep: 0,
          formData: {},
          completed: false,
          conversationId: conversation.id,
          sessionId: newSessionId
        };
      }
    } else {
      // Use provided conversation state
      state = conversationState;
      if (state.conversationId) {
        const messages = await getMessagesByConversationId(state.conversationId);
        messageOrder = messages.length;
      }
    }

    // Welcome message for first interaction
    if (state.currentStep === 0 && !message) {
      const welcomeMessage = "Hello! I'm here to help you fill out your Appearance form for your eviction case in Indiana. I'll ask you a series of questions to gather the information needed for your court documents. Let's get started!";
      const firstQuestion = QUESTIONS[0].question;
      const fullResponse = `${welcomeMessage}\n\n${firstQuestion}`;

      // Save AI welcome message
      if (state.conversationId) {
        await saveMessage(state.conversationId, fullResponse, 'ai', messageOrder);
      }

      return NextResponse.json({
        response: welcomeMessage,
        conversationState: state,
        nextQuestion: firstQuestion
      });
    }

    // Process user input
    if (message && state.currentStep < QUESTIONS.length) {
      // Save user message
      if (state.conversationId) {
        await saveMessage(state.conversationId, message, 'user', messageOrder);
        messageOrder++;
      }

      const currentQuestion = QUESTIONS[state.currentStep];
      let processedValue: string | boolean = message.trim();

      // Special processing for boolean fields
      if (currentQuestion.field === 'agreeToNotify') {
        const lowerMessage = message.toLowerCase().trim();
        if (lowerMessage.includes('yes') || lowerMessage === 'y') {
          processedValue = true;
        } else if (lowerMessage.includes('no') || lowerMessage === 'n') {
          processedValue = false;
        } else {
          const errorResponse = "Please answer 'yes' or 'no' to whether you agree to notify the court of address changes.";
          
          // Save AI error message
          if (state.conversationId) {
            await saveMessage(state.conversationId, errorResponse, 'ai', messageOrder);
          }

          return NextResponse.json({
            response: errorResponse,
            conversationState: state
          });
        }
      }

      // Update form data
      state.formData[currentQuestion.field] = processedValue;
      state.currentStep++;

      // Update conversation in database
      if (state.conversationId) {
        await updateConversation(state.conversationId, {
          current_step: state.currentStep,
          form_data: state.formData as any
        });
      }

      // Check if we have more questions
      if (state.currentStep < QUESTIONS.length) {
        const nextQuestion = QUESTIONS[state.currentStep];
        const aiResponse = `Thank you! ${nextQuestion.question}`;

        // Save AI response
        if (state.conversationId) {
          await saveMessage(state.conversationId, aiResponse, 'ai', messageOrder);
        }

        return NextResponse.json({
          response: aiResponse,
          conversationState: state
        });
      } else {
        // All questions completed
        state.completed = true;
        const completionResponse = "Perfect! I've collected all the information needed for your Appearance form. Your form is now ready to be generated. Would you like me to create your PDF document?";

        // Update conversation as completed and save AI message
        if (state.conversationId) {
          await updateConversation(state.conversationId, {
            current_step: state.currentStep,
            form_data: state.formData as any,
            completed: true
          });
          await saveMessage(state.conversationId, completionResponse, 'ai', messageOrder);
        }

        return NextResponse.json({
          response: completionResponse,
          conversationState: state,
          formCompleted: true
        });
      }
    }

    // Handle form completion request
    if (state.completed && message && message.toLowerCase().includes('yes')) {
      // Save user confirmation message
      if (state.conversationId) {
        await saveMessage(state.conversationId, message, 'user', messageOrder);
        messageOrder++;

        // Create form submission record
        await createFormSubmission(state.conversationId, state.formData);
      }

      const pdfResponse = "Great! I'll generate your PDF now. Please wait a moment...";
      
      // Save AI response
      if (state.conversationId) {
        await saveMessage(state.conversationId, pdfResponse, 'ai', messageOrder);
      }

      return NextResponse.json({
        response: pdfResponse,
        conversationState: state,
        generatePdf: true
      });
    }

    // Default response for edge cases
    return NextResponse.json({
      response: "I'm sorry, I didn't understand that. Could you please try again?",
      conversationState: state
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 