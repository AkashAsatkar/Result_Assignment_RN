/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () =>
  ({
    __esModule: true,
    default: {
      getItem: jest.fn(() => Promise.resolve(null)),
      setItem: jest.fn(() => Promise.resolve()),
    },
  }),
);
jest.mock('react-native-safe-area-context', () => {
  const ReactNative = require('react');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      ReactNative.createElement(ReactNative.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
jest.mock('@react-native/virtualized-lists', () => {
  const ReactNative = require('react');
  return {
    keyExtractor: (_item: unknown, index: number) => String(index),
    VirtualizedList: ({
      data,
      renderItem,
      ListHeaderComponent,
      ListEmptyComponent,
      ItemSeparatorComponent,
      keyExtractor,
    }: {
      data: unknown[];
      renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
      ListHeaderComponent: React.ReactNode;
      ListEmptyComponent: React.ReactNode;
      ItemSeparatorComponent: React.ComponentType | null;
      keyExtractor: (item: unknown, index: number) => string;
    }) =>
      ReactNative.createElement(
        ReactNative.Fragment,
        null,
        ListHeaderComponent,
        ...(data.length
          ? data.flatMap((item, index) => [
              ReactNative.createElement(
                ReactNative.Fragment,
                { key: keyExtractor(item, index) },
                renderItem({ item, index }),
              ),
              index < data.length - 1 && ItemSeparatorComponent
                ? ReactNative.createElement(ItemSeparatorComponent, { key: `separator-${index}` })
                : null,
            ])
          : [ListEmptyComponent]),
      ),
  };
});

describe('assessment results', () => {
  let app: ReactTestRenderer.ReactTestRenderer;

  beforeEach(async () => {
    await ReactTestRenderer.act(async () => {
      app = ReactTestRenderer.create(<App />);
    });
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      app.unmount();
    });
  });

  test('shows an empty state and validates completed assessment scores', async () => {
    expect(app.root.findByProps({ testID: 'add-first-assessment' })).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'add-assessment' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'question-input' }).props.onChangeText('Read a passage');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'score-input' }).props.onChangeText('101');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'feedback-input' }).props.onChangeText('Clear delivery');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'submit-assessment' }).props.onPress();
    });

    expect(app.root.findByProps({ testID: 'form-error' }).props.children).toBe(
      'Score must be between 0 and 100.',
    );
  });

  test('adds completed assessments with performance classification', async () => {
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'add-assessment' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'question-input' }).props.onChangeText('Explain a concept');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'type-recorded' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'score-input' }).props.onChangeText('70');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'feedback-input' }).props.onChangeText('Strong reasoning.');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'submit-assessment' }).props.onPress();
    });

    const rendered = JSON.stringify(app.toJSON());
    expect(rendered).toContain('assessment-card');
    expect(rendered).toContain('assessment-score');
    expect(rendered).toContain('"children":["70","%"]');
    expect(rendered).toContain('Strong reasoning.');
    expect(rendered).toContain('"children":["Good"]');
  });

  test('adds pending assessments without a score, feedback, or classification', async () => {
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'add-assessment' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'question-input' }).props.onChangeText('Prepare a report');
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'status-pending' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      app.root.findByProps({ testID: 'submit-assessment' }).props.onPress();
    });

    const rendered = JSON.stringify(app.toJSON());
    expect(rendered).toContain('assessment-card');
    expect(rendered).toContain('"children":["Pending"]');
    expect(rendered).not.toContain('assessment-score');
    expect(rendered).not.toContain('assessment-feedback');
    expect(rendered).not.toContain('"children":["Good"]');
    expect(rendered).not.toContain('"children":["Needs Improvement"]');
  });
});
