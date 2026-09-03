import { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { ResultCard } from './ResultCard';
import {
  calculateQuizResult,
  INITIAL_QUIZ_ANSWERS,
  type Company,
  type CoOwnership,
  type Complexity,
  type Domicile,
  type FamilySituation,
  type ForeignAssets,
  type QuizAnswers,
  type Will,
} from '../lib/quiz';

const QUESTIONS: {
  key: keyof QuizAnswers;
  title: string;
  subtitle?: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: 'domicile',
    title: 'Var hade den avlidne sitt permanenta hemvist?',
    options: [
      { value: 'sweden' satisfies Domicile, label: 'Sverige' },
      { value: 'abroad' satisfies Domicile, label: 'Utlandet' },
      { value: 'unknown' satisfies Domicile, label: 'Vet inte' },
    ],
  },
  {
    key: 'will',
    title: 'Finns det ett testamente som ändrar på arvfördelningen?',
    subtitle: 'T.ex. arvsförord, gåva, eller något som inte följer laglig ärvningsrätt.',
    options: [
      { value: 'yes' satisfies Will, label: 'Ja, det finns ett testamente/arvsförord' },
      { value: 'no' satisfies Will, label: 'Nej, ingen testamentarisk förordning' },
      { value: 'unknown' satisfies Will, label: 'Vet inte' },
    ],
  },
  {
    key: 'familySituation',
    title: 'Vilken familjesituation gällde för den avlidne?',
    options: [
      {
        value: 'cohabitant' satisfies FamilySituation,
        label: 'Sambo utan registrerat partnerskap — med eller utan barn över 18',
      },
      { value: 'married' satisfies FamilySituation, label: 'Gifta makar — med enbart gemensamma barn' },
      {
        value: 'widowed-with-prior-children' satisfies FamilySituation,
        label: 'Änka eller änkling — med barn från tidigare äktenskap',
      },
      { value: 'single' satisfies FamilySituation, label: 'Ogift eller frånskild — med eller utan barn' },
      { value: 'other-unknown' satisfies FamilySituation, label: 'Något annat / Vet inte' },
    ],
  },
  {
    key: 'complexity',
    title: 'Ungefär hur komplex är dödsboet?',
    options: [
      {
        value: 'simple' satisfies Complexity,
        label: 'Enkelt — bara personliga tillhörigheter, bankkonto, ingen fastighet',
      },
      { value: 'medium' satisfies Complexity, label: 'Medel — en bostad, några bankkonton, ingen aktieportfölj' },
      {
        value: 'complex' satisfies Complexity,
        label: 'Komplext — flera fastigheter, företag, stora tillgångar, utlandstillgångar',
      },
      { value: 'unknown' satisfies Complexity, label: 'Vet inte' },
    ],
  },
  {
    key: 'company',
    title: 'Ägde den avlidne ett företag eller var delägare i något företag?',
    subtitle:
      'Om den avlidne ägde eller var delägare i ett företag kan det kräva speciell hantering och värdering. DödsboGuiden kan ge vägledning men juristkonsultation rekommenderas för företag.',
    options: [
      { value: 'stock-company' satisfies Company, label: 'Ja, ett aktiebolag' },
      { value: 'sole-trader-or-partnership' satisfies Company, label: 'Ja, en enskild firma eller handelsbolag' },
      { value: 'no' satisfies Company, label: 'Nej' },
      { value: 'unknown' satisfies Company, label: 'Vet inte' },
    ],
  },
  {
    key: 'coOwnership',
    title: 'Är något (fastighet, bostadsrätt, konto) samägt med annan person?',
    subtitle:
      'Samägt innebär att flera personer tillsammans äger något. Det kan komplicera arvfördelningen och kan kräva speciell hantering.',
    options: [
      { value: 'yes' satisfies CoOwnership, label: 'Ja, tillsammans med sambo eller annan' },
      { value: 'no' satisfies CoOwnership, label: 'Nej, den avlidne ägde allt själv' },
      { value: 'unknown' satisfies CoOwnership, label: 'Vet inte' },
    ],
  },
  {
    key: 'foreignAssets',
    title: 'Hade den avlidne tillgångar eller fastigheter utomlands?',
    subtitle:
      'Utlandstillgångar följer ofta andra länders regler och kan kräva internationell juridisk hjälp och dubbelbeskattningsavtal.',
    options: [
      { value: 'real-estate' satisfies ForeignAssets, label: 'Ja, fastigheter i andra länder' },
      {
        value: 'accounts-or-securities' satisfies ForeignAssets,
        label: 'Ja, bankkonton eller värdepapper i andra länder',
      },
      { value: 'no' satisfies ForeignAssets, label: 'Nej, inga utlandstillgångar' },
      { value: 'unknown' satisfies ForeignAssets, label: 'Vet inte' },
    ],
  },
];

export function SuitabilityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_QUIZ_ANSWERS);
  const [showResult, setShowResult] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const selected = question ? (answers[question.key] as string | null) : null;

  function selectAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  }

  function goNext() {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((i) => i + 1);
    } else {
      setShowResult(true);
    }
  }

  function goBack() {
    setCurrentQuestion((i) => Math.max(0, i - 1));
  }

  function restart() {
    setAnswers(INITIAL_QUIZ_ANSWERS);
    setCurrentQuestion(0);
    setShowResult(false);
  }

  return (
    <div>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold text-text sm:text-3xl">
          Gör det korta testet för att se om DödsboGuiden kan vara till hjälp eller inte
        </h2>
        <p className="mt-2 text-muted">Svara på {QUESTIONS.length} korta frågor för att ta reda på det.</p>
      </div>

      <div className="mt-8">
        {showResult ? (
          <ResultCard result={calculateQuizResult(answers)} onRestart={restart} />
        ) : (
          <QuestionCard
            questionNumber={currentQuestion + 1}
            totalQuestions={QUESTIONS.length}
            title={question.title}
            subtitle={question.subtitle}
            options={question.options}
            selected={selected}
            onSelect={selectAnswer}
            onNext={goNext}
            onBack={currentQuestion > 0 ? goBack : undefined}
          />
        )}
      </div>
    </div>
  );
}
