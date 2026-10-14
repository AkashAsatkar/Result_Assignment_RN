import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AssessmentCard from './src/components/AssessmentCard';
import AssessmentForm from './src/components/AssessmentForm';
import { Assessment } from './src/types';
import { loadAssessments } from './src/storage';

const STORAGE_KEY = '@result-assignment/assessments';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    loadAssessments()
      .then(savedAssessments => {
        if (isActive) {
          setAssessments(savedAssessments);
        }
      })
      .catch(() => {
        if (isActive) {
          setStorageMessage('Saved assessments could not be loaded.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assessments))
      .then(() => setStorageMessage(''))
      .catch(() => {
        setStorageMessage('Changes could not be saved on this device.');
      });
  }, [assessments, isHydrated]);

  const completedCount = useMemo(
    () => assessments.filter(assessment => assessment.status === 'Completed').length,
    [assessments],
  );
  const averageScore = useMemo(() => {
    const completed = assessments.filter(
      assessment => assessment.status === 'Completed' && assessment.score !== null,
    );

    if (completed.length === 0) {
      return null;
    }

    return Math.round(
      completed.reduce((total, assessment) => total + (assessment.score ?? 0), 0) /
        completed.length,
    );
  }, [assessments]);

  const addAssessment = useCallback((assessment: Assessment) => {
    setAssessments(currentAssessments => [assessment, ...currentAssessments]);
    setIsFormVisible(false);
  }, []);

  const openForm = useCallback(() => setIsFormVisible(true), []);
  const closeForm = useCallback(() => setIsFormVisible(false), []);
  const renderAssessment = useCallback(
    ({ item }: { item: Assessment }) => <AssessmentCard assessment={item} />,
    [],
  );

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom },
      ]}>
      <FlatList
        data={assessments}
        renderItem={renderAssessment}
        keyExtractor={assessment => assessment.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View style={styles.wordmarkWrap}>
                <View style={styles.wordmarkMark} />
                <Text style={styles.wordmark}>ASSESSMENT LOG</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={openForm}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                testID="add-assessment">
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>YOUR LEARNING, IN FOCUS</Text>
              <Text style={styles.title}>{'Make progress\nvisible.'}</Text>
              <Text style={styles.subtitle}>
                A clear view of every assessment, all in one place.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <SummaryStat label="ALL" value={String(assessments.length)} accent="ink" />
              <SummaryStat label="COMPLETED" value={String(completedCount)} accent="green" />
              <SummaryStat
                label="AVG. SCORE"
                value={averageScore === null ? 'N/A' : `${averageScore}%`}
                accent="coral"
              />
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Assessment results</Text>
              <Text style={styles.sectionCount}>
                {assessments.length === 1 ? '1 RECORD' : `${assessments.length} RECORDS`}
              </Text>
            </View>

            {assessments.length > 0 && completedCount === 0 ? (
              <View style={styles.pendingNotice}>
                <View style={styles.noticeDot} />
                <Text style={styles.pendingNoticeText}>
                  No completed assessments yet. Scores and feedback will appear after evaluation.
                </Text>
              </View>
            ) : null}

            {storageMessage ? (
              <Text accessibilityRole="alert" style={styles.storageMessage}>
                {storageMessage}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isHydrated ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyMark}>
                <View style={styles.emptyMarkLine} />
                <View style={[styles.emptyMarkLine, styles.emptyMarkShort]} />
                <View style={[styles.emptyMarkLine, styles.emptyMarkMid]} />
              </View>
              <Text style={styles.emptyTitle}>Your results start here</Text>
              <Text style={styles.emptyCopy}>
                Add an assessment to keep your questions, scores, and feedback together.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={openForm}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                testID="add-first-assessment">
                <Text style={styles.emptyButtonText}>Add your first assessment</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#28634F" />
              <Text style={styles.loadingText}>Loading saved results</Text>
            </View>
          )
        }
        ItemSeparatorComponent={AssessmentSeparator}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <AssessmentForm
        visible={isFormVisible}
        onCancel={closeForm}
        onSubmit={addAssessment}
      />
    </View>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'ink' | 'green' | 'coral';
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statRule, styles[`statRule${accent}`]]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AssessmentSeparator() {
  return <View style={styles.cardSeparator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5EF',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    flexGrow: 1,
  },
  topBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmarkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  wordmarkMark: {
    width: 11,
    height: 11,
    borderRadius: 3,
    backgroundColor: '#28634F',
    transform: [{ rotate: '45deg' }],
  },
  wordmark: {
    color: '#56615B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  addButton: {
    minHeight: 40,
    minWidth: 78,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28634F',
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  titleBlock: {
    paddingTop: 28,
    paddingBottom: 22,
  },
  eyebrow: {
    color: '#C05D48',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: '#202923',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 42,
  },
  subtitle: {
    color: '#67716B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 310,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    paddingVertical: 15,
    marginBottom: 25,
  },
  stat: {
    flex: 1,
    paddingLeft: 15,
    minHeight: 53,
    justifyContent: 'center',
  },
  statRule: {
    width: 21,
    height: 3,
    borderRadius: 2,
    marginBottom: 8,
  },
  statRuleink: {
    backgroundColor: '#28342D',
  },
  statRulegreen: {
    backgroundColor: '#5E9A75',
  },
  statRulecoral: {
    backgroundColor: '#D8795F',
  },
  statValue: {
    color: '#202923',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#7D857F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#202923',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCount: {
    color: '#818A83',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: '#F3E8D6',
  },
  noticeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B7833D',
  },
  pendingNoticeText: {
    color: '#67563A',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  storageMessage: {
    color: '#A24435',
    backgroundColor: '#FBE8E2',
    borderRadius: 6,
    padding: 11,
    marginBottom: 12,
    fontSize: 12,
  },
  cardSeparator: {
    height: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 33,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
  },
  emptyMark: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F0E8',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 15,
  },
  emptyMarkLine: {
    width: 21,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#528369',
  },
  emptyMarkShort: {
    width: 14,
    alignSelf: 'center',
  },
  emptyMarkMid: {
    width: 18,
  },
  emptyTitle: {
    color: '#25332B',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyCopy: {
    color: '#727B74',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 18,
    maxWidth: 260,
  },
  emptyButton: {
    minHeight: 42,
    backgroundColor: '#28634F',
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  loadingText: {
    color: '#67716B',
    fontSize: 13,
  },
});

export default App;