export type Domicile = 'sweden' | 'abroad' | 'unknown';
export type Will = 'yes' | 'no' | 'unknown';
export type FamilySituation = 'cohabitant' | 'married' | 'widowed-with-prior-children' | 'single' | 'other-unknown';
export type Complexity = 'simple' | 'medium' | 'complex' | 'unknown';

export interface QuizAnswers {
  domicile: Domicile | null;
  will: Will | null;
  familySituation: FamilySituation | null;
  complexity: Complexity | null;
}

export const INITIAL_QUIZ_ANSWERS: QuizAnswers = {
  domicile: null,
  will: null,
  familySituation: null,
  complexity: null,
};

export type QuizResult = 'fits' | 'warning' | 'no-fit';

export function calculateQuizResult(answers: QuizAnswers): QuizResult {
  const noFit =
    answers.domicile === 'abroad' ||
    answers.will === 'yes' ||
    answers.familySituation === 'other-unknown' ||
    answers.complexity === 'complex';
  if (noFit) return 'no-fit';

  const warning =
    answers.domicile === 'unknown' ||
    answers.will === 'unknown' ||
    answers.complexity === 'unknown';
  if (warning) return 'warning';

  return 'fits';
}
