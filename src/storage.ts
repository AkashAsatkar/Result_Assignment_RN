import AsyncStorage from '@react-native-async-storage/async-storage';
import { Assessment } from './types';

const STORAGE_KEY = '@result-assignment/assessments';

function isAssessment(value: unknown): value is Assessment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const assessment = value as Assessment;
  const validScore =
    assessment.score === null ||
    (typeof assessment.score === 'number' &&
      Number.isFinite(assessment.score) &&
      assessment.score >= 0 &&
      assessment.score <= 100);

  return (
    typeof assessment.id === 'string' &&
    typeof assessment.question === 'string' &&
    (assessment.assessmentType === 'Recorded' || assessment.assessmentType === 'Text') &&
    (assessment.status === 'Completed' || assessment.status === 'Pending') &&
    validScore &&
    (assessment.feedback === null || typeof assessment.feedback === 'string') &&
    typeof assessment.createdAt === 'string' &&
    (assessment.status !== 'Pending' ||
      (assessment.score === null && assessment.feedback === null))
  );
}

export async function loadAssessments(): Promise<Assessment[]> {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter(isAssessment);
}