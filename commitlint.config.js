export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[([A-Za-z ]+)\]\s(.+)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'Bootstrap',
        'Feature',
        'Fix',
        'Refactor',
        'Design System',
        'Release',
        'Docs',
        'Test',
        'Chore',
        'Perf',
      ],
    ],
    'type-case': [2, 'always', 'start-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'header-min-length': [2, 'always', 10],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
  },
}
