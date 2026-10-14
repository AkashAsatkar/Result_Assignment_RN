export type AssessmentType = 'Recorded' | 'Text';
export type AssessmentStatus = 'Completed' | 'Pending';

export type Assessment = {
  id: string;
  question: string;
  assessmentType: AssessmentType;
  score: number | null;
  status: AssessmentStatus;
  feedback: string | null;
  createdAt: string;
};