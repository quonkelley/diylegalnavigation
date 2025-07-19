export const isDemoMode = true;

interface DemoResponse {
  response: string;
  conversationState: any;
  nextQuestion?: string;
  formCompleted?: boolean;
  generatePdf?: boolean;
}

// Pre-scripted conversation that simulates the real chat experience
export const DEMO_RESPONSES: Record<number, DemoResponse> = {
  0: {
    response: "Hello! I'm here to help you fill out your Appearance form for your eviction case in Indiana. I'll ask you a series of questions to gather the information needed for your court documents. Let's get started!",
    conversationState: { currentStep: 0, formData: {}, completed: false },
    nextQuestion: "Let's start with the court information. On the papers you received from the court, what County is listed at the very top?"
  },
  1: {
    response: "Thank you! And right below the County, what is the name of the Court (e.g., Superior Court, Small Claims Court)?",
    conversationState: { currentStep: 1, formData: { county: "Marion" }, completed: false }
  },
  2: {
    response: "Great. Now, what is the Case Number? It should be labeled 'Cause No.' or 'Case No.'",
    conversationState: { currentStep: 2, formData: { county: "Marion", court: "Superior Court" }, completed: false }
  },
  3: {
    response: "What is the full name of the person or company suing you (the Plaintiff)?",
    conversationState: { currentStep: 3, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234" }, completed: false }
  },
  4: {
    response: "And what is your full legal name as the Defendant?",
    conversationState: { currentStep: 4, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management" }, completed: false }
  },
  5: {
    response: "The court requires you to keep your contact information updated. Do you agree to notify the court if your address or phone number changes? (Please answer 'yes' or 'no')",
    conversationState: { currentStep: 5, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management", defendant: "John Smith" }, completed: false }
  },
  6: {
    response: "To make sure the court can contact you, what is your current mailing address? (Include street, city, state, and zip code)",
    conversationState: { currentStep: 6, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management", defendant: "John Smith", agreeToNotify: true }, completed: false }
  },
  7: {
    response: "What is your best contact phone number?",
    conversationState: { currentStep: 7, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management", defendant: "John Smith", agreeToNotify: true, mailingAddress: "123 Main St, Indianapolis, IN 46202" }, completed: false }
  },
  8: {
    response: "And what is your email address?",
    conversationState: { currentStep: 8, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management", defendant: "John Smith", agreeToNotify: true, mailingAddress: "123 Main St, Indianapolis, IN 46202", phone: "(317) 555-0123" }, completed: false }
  },
  9: {
    response: "Perfect! I've collected all the information needed for your Appearance form. Your form is now ready to be generated. Would you like me to create your PDF document?",
    conversationState: { currentStep: 9, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management", defendant: "John Smith", agreeToNotify: true, mailingAddress: "123 Main St, Indianapolis, IN 46202", phone: "(317) 555-0123", email: "john.smith@email.com" }, completed: true },
    formCompleted: true
  },
  10: {
    response: "Great! I'll generate your PDF now. Please wait a moment...",
    conversationState: { currentStep: 9, formData: { county: "Marion", court: "Superior Court", caseNumber: "49D01-2024-EV-001234", plaintiff: "ABC Property Management", defendant: "John Smith", agreeToNotify: true, mailingAddress: "123 Main St, Indianapolis, IN 46202", phone: "(317) 555-0123", email: "john.smith@email.com" }, completed: true },
    generatePdf: true
  }
};

// Demo PDF download function
export const generateDemoPdf = () => {
  // Create a download link for the demo PDF
  const link = document.createElement('a');
  link.href = '/demo-appearance-form.pdf';
  link.download = 'Appearance_Form_Demo.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 