export type Domicile = 'sweden' | 'abroad' | 'unknown';
export type Will = 'yes' | 'no' | 'unknown';
export type FamilySituation = 'cohabitant' | 'married' | 'widowed-with-prior-children' | 'single' | 'other-unknown';
export type Complexity = 'simple' | 'medium' | 'complex' | 'unknown';
export type Company = 'stock-company' | 'sole-trader-or-partnership' | 'no' | 'unknown';
export type CoOwnership = 'yes' | 'no' | 'unknown';
export type ForeignAssets = 'real-estate' | 'accounts-or-securities' | 'no' | 'unknown';

export interface QuizAnswers {
  domicile: Domicile | null;
  will: Will | null;
  familySituation: FamilySituation | null;
  complexity: Complexity | null;
  company: Company | null;
  coOwnership: CoOwnership | null;
  foreignAssets: ForeignAssets | null;
}

export const INITIAL_QUIZ_ANSWERS: QuizAnswers = {
  domicile: null,
  will: null,
  familySituation: null,
  complexity: null,
  company: null,
  coOwnership: null,
  foreignAssets: null,
};

export type QuizResult = 'fits' | 'warning' | 'no-fit';

export const RESULT_LABELS: Record<QuizResult, string> = {
  fits: 'Passar bra',
  warning: 'Passar med förbehåll',
  'no-fit': 'Passar inte',
};

export const QUESTION_LABELS: Record<keyof QuizAnswers, { title: string; answers: Record<string, string> }> = {
  domicile: {
    title: 'Hemvist',
    answers: { sweden: 'Sverige', abroad: 'Utlandet', unknown: 'Vet inte' },
  },
  will: {
    title: 'Testamente',
    answers: { yes: 'Ja, testamente/arvsförord', no: 'Nej', unknown: 'Vet inte' },
  },
  familySituation: {
    title: 'Familjesituation',
    answers: {
      cohabitant: 'Sambo',
      married: 'Gifta makar',
      'widowed-with-prior-children': 'Änka/änkling med barn sedan tidigare',
      single: 'Ogift/frånskild',
      'other-unknown': 'Annat/vet inte',
    },
  },
  complexity: {
    title: 'Komplexitet',
    answers: { simple: 'Enkelt', medium: 'Medel', complex: 'Komplext', unknown: 'Vet inte' },
  },
  company: {
    title: 'Företag',
    answers: {
      'stock-company': 'Aktiebolag',
      'sole-trader-or-partnership': 'Enskild firma/handelsbolag',
      no: 'Nej',
      unknown: 'Vet inte',
    },
  },
  coOwnership: {
    title: 'Samägande',
    answers: { yes: 'Ja', no: 'Nej', unknown: 'Vet inte' },
  },
  foreignAssets: {
    title: 'Utlandstillgångar',
    answers: { 'real-estate': 'Fastigheter', 'accounts-or-securities': 'Konton/värdepapper', no: 'Nej', unknown: 'Vet inte' },
  },
};

export function calculateQuizResult(answers: QuizAnswers): QuizResult {
  const complexYesCount = [
    answers.company === 'stock-company' || answers.company === 'sole-trader-or-partnership',
    answers.coOwnership === 'yes',
    answers.foreignAssets === 'real-estate' || answers.foreignAssets === 'accounts-or-securities',
  ].filter(Boolean).length;

  const noFit = answers.domicile === 'abroad' && answers.complexity === 'complex' && complexYesCount >= 2;
  if (noFit) return 'no-fit';

  const warning =
    answers.domicile === 'abroad' ||
    answers.will === 'yes' ||
    answers.familySituation === 'other-unknown' ||
    answers.complexity === 'complex' ||
    complexYesCount >= 2 ||
    answers.domicile === 'unknown' ||
    answers.will === 'unknown' ||
    answers.complexity === 'unknown';
  if (warning) return 'warning';

  return 'fits';
}
