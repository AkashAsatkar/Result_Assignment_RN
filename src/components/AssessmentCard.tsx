import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Assessment } from '../types';

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const isCompleted = assessment.status === 'Completed';
  const isGood = (assessment.score ?? 0) >= 70;

  return (
    <View style={styles.card} testID="assessment-card">
      <View style={styles.topLine}>
        <View style={styles.badges}>
          <Text style={styles.typeBadge}>{assessment.assessmentType}</Text>
          <Text
            style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadge : styles.pendingBadge,
            ]}>
            {assessment.status}
          </Text>
        </View>
        {isCompleted ? (
          <View style={[styles.scoreBlock, isGood ? styles.goodScore : styles.lowScore]}>
            <Text style={styles.scoreValue} testID="assessment-score">
              {assessment.score}%
            </Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.question}>{assessment.question}</Text>

      {isCompleted ? (
        <View style={styles.resultDetails}>
          <Text style={[styles.performance, isGood ? styles.goodText : styles.lowText]}>
            {isGood ? 'Good' : 'Needs Improvement'}
          </Text>
          {assessment.feedback ? (
            <View style={styles.feedbackBlock}>
              <Text style={styles.feedbackLabel}>FEEDBACK</Text>
              <Text style={styles.feedbackText} testID="assessment-feedback">
                {assessment.feedback}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <Text style={styles.pendingCopy}>Waiting for evaluation</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EAE3',
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  typeBadge: {
    color: '#526158',
    backgroundColor: '#EDF0EA',
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statusBadge: {
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
  },
  completedBadge: {
    color: '#276348',
    backgroundColor: '#E5F1E8',
  },
  pendingBadge: {
    color: '#886529',
    backgroundColor: '#F5EBD8',
  },
  scoreBlock: {
    minWidth: 54,
    alignItems: 'flex-end',
  },
  goodScore: {
    borderBottomColor: '#69A27A',
    borderBottomWidth: 2,
  },
  lowScore: {
    borderBottomColor: '#D8795F',
    borderBottomWidth: 2,
  },
  scoreValue: {
    color: '#23352A',
    fontSize: 20,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#7C857E',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  question: {
    color: '#25312A',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 13,
  },
  resultDetails: {
    marginTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EFF0EB',
    paddingTop: 10,
  },
  performance: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '800',
  },
  goodText: {
    color: '#347351',
  },
  lowText: {
    color: '#B35340',
  },
  feedbackBlock: {
    marginTop: 11,
  },
  feedbackLabel: {
    color: '#89918A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  feedbackText: {
    color: '#59645D',
    fontSize: 13,
    lineHeight: 19,
  },
  pendingCopy: {
    color: '#8C7953',
    fontSize: 12,
    marginTop: 10,
  },
});

export default memo(AssessmentCard);