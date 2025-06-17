
// Feedback translation module
export const feedback = {
  // Basic terms
  feedback: 'Rəy',
  comment: 'Şərh',
  review: 'Baxış',
  
  // Actions
  submit_feedback: 'Rəy göndər',
  leave_comment: 'Şərh yaz',
  
  // Messages
  feedback_sent: 'Rəy göndərildi',
  thank_you: 'Təşəkkür edirik'
} as const;

export type Feedback = typeof feedback;
export default feedback;
