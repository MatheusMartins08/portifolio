export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/**
 * The single integration point for the contact form. It only simulates a send for now; the real
 * backend (email service, Server Action, API route…) plugs in here later. Resolve = success,
 * reject = the form shows its error banner.
 */
export async function submitContact(message: ContactMessage): Promise<void> {
  void message;
  await new Promise((resolve) => setTimeout(resolve, 1400));
}
