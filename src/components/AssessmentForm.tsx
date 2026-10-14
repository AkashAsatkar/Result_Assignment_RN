import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Assessment, AssessmentStatus, AssessmentType } from '../types';

type AssessmentFormProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (assessment: Assessment) => void;
};

function AssessmentForm({ visible, onCancel, onSubmit }: AssessmentFormProps) {
  const [question, setQuestion] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Text');
  const [status, setStatus] = useState<AssessmentStatus>('Completed');
  const [scoreText, setScoreText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setQuestion('');
      setAssessmentType('Text');
      setStatus('Completed');
      setScoreText('');
      setFeedback('');
      setError('');
    }
  }, [visible]);

  const submit = () => {
    if (!question.trim()) {
      setError('Enter the assessment question or task.');
      return;
    }

    let score: number | null = null;
    let savedFeedback: string | null = null;

    if (status === 'Completed') {
      if (!/^\d+$/.test(scoreText.trim())) {
        setError('Enter a whole-number score from 0 to 100.');
        return;
      }

      score = Number(scoreText);
      if (score < 0 || score > 100) {
        setError('Score must be between 0 and 100.');
        return;
      }

      if (!feedback.trim()) {
        setError('Add feedback for this completed assessment.');
        return;
      }

      savedFeedback = feedback.trim();
    }

    onSubmit({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      question: question.trim(),
      assessmentType,
      score,
      status,
      feedback: savedFeedback,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            testID="cancel-assessment">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerLabel}>NEW RECORD</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Add assessment</Text>
          <Text style={styles.intro}>Enter the details you want to keep on record.</Text>

          <FieldLabel label="QUESTION OR TASK" required />
          <TextInput
            accessibilityLabel="Question or task"
            multiline
            onChangeText={setQuestion}
            placeholder="What was assessed?"
            placeholderTextColor="#9AA19B"
            style={[styles.input, styles.multilineInput]}
            textAlignVertical="top"
            testID="question-input"
            value={question}
          />

          <FieldLabel label="ASSESSMENT TYPE" required />
          <SegmentedControl
            options={['Recorded', 'Text']}
            selected={assessmentType}
            onSelect={value => setAssessmentType(value as AssessmentType)}
            testPrefix="type"
          />

          <FieldLabel label="STATUS" required />
          <SegmentedControl
            options={['Completed', 'Pending']}
            selected={status}
            onSelect={value => setStatus(value as AssessmentStatus)}
            testPrefix="status"
          />

          {status === 'Completed' ? (
            <>
              <FieldLabel label="SCORE" required />
              <View style={styles.scoreInputWrap}>
                <TextInput
                  accessibilityLabel="Score"
                  keyboardType="number-pad"
                  maxLength={3}
                  onChangeText={setScoreText}
                  placeholder="0-100"
                  placeholderTextColor="#9AA19B"
                  style={styles.scoreInput}
                  testID="score-input"
                  value={scoreText}
                />
                <Text style={styles.scoreSuffix}>/ 100</Text>
              </View>

              <FieldLabel label="FEEDBACK" required />
              <TextInput
                accessibilityLabel="Feedback"
                multiline
                onChangeText={setFeedback}
                placeholder="Note strengths and areas to improve"
                placeholderTextColor="#9AA19B"
                style={[styles.input, styles.feedbackInput]}
                textAlignVertical="top"
                testID="feedback-input"
                value={feedback}
              />
              <Text style={styles.feedbackNote}>
                Feedback is entered manually; no AI service is connected.
              </Text>
            </>
          ) : (
            <View style={styles.pendingInfo}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingInfoText}>
                Score and feedback will be added after evaluation.
              </Text>
            </View>
          )}

          {error ? (
            <Text accessibilityRole="alert" style={styles.error} testID="form-error">
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={submit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
            testID="submit-assessment">
            <Text style={styles.submitText}>Save assessment</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function SegmentedControl({
  options,
  selected,
  onSelect,
  testPrefix,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  testPrefix: string;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map(option => {
        const isSelected = option === selected;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.segment,
              isSelected && styles.segmentSelected,
              pressed && styles.pressed,
            ]}
            testID={`${testPrefix}-${option.toLowerCase()}`}>
            <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5EF',
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAE3',
  },
  cancelButton: {
    minWidth: 58,
    minHeight: 42,
    justifyContent: 'center',
  },
  cancelText: {
    color: '#28634F',
    fontSize: 14,
    fontWeight: '700',
  },
  headerLabel: {
    color: '#7E8880',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerSpacer: {
    width: 58,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 36,
  },
  title: {
    color: '#202923',
    fontSize: 29,
    fontWeight: '700',
  },
  intro: {
    color: '#6C766F',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  fieldLabel: {
    color: '#59645D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 8,
    marginTop: 18,
  },
  required: {
    color: '#C05D48',
  },
  input: {
    color: '#26332B',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E4DC',
    borderRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 82,
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    minHeight: 43,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E4DC',
    borderRadius: 6,
  },
  segmentSelected: {
    backgroundColor: '#E4EFE7',
    borderColor: '#75A487',
  },
  segmentText: {
    color: '#68736B',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: '#28634F',
    fontWeight: '800',
  },
  scoreInputWrap: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E4DC',
    borderRadius: 6,
    paddingHorizontal: 13,
  },
  scoreInput: {
    flex: 1,
    color: '#26332B',
    fontSize: 16,
    paddingVertical: 9,
  },
  scoreSuffix: {
    color: '#8B948D',
    fontSize: 13,
  },
  feedbackInput: {
    minHeight: 104,
  },
  feedbackNote: {
    color: '#858E87',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    marginTop: 20,
    backgroundColor: '#F3E8D6',
    borderRadius: 6,
  },
  pendingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B7833D',
  },
  pendingInfoText: {
    flex: 1,
    color: '#67563A',
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    color: '#A24435',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 13,
  },
  submitButton: {
    minHeight: 49,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28634F',
    borderRadius: 6,
    marginTop: 23,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
});

export default AssessmentForm;