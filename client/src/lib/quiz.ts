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
