export type LangCode = 'en' | 'es' | 'fr' | 'ar' | 'ur'
export type LessonId = 'basics' | 'message' | 'video' | 'safety' | 'search'
export type SkillArea = 'basics' | 'communication' | 'safety' | 'explore'
export type BadgeId =
  | 'first-steps'
  | 'communication-star'
  | 'digital-explorer'
  | 'safety-champion'
  | 'confidence-builder'
  | 'learning-champion'

export type ChoiceIndex = 0 | 1 | 2

/** Language-independent shape of a lesson: ids, icons and which answer is right. */
export interface LessonShape {
  id: LessonId
  area: SkillArea
  icon: string
  correct: readonly ChoiceIndex[]
}

export interface QuestionText {
  prompt: string
  options: readonly [string, string, string]
  hint: string
  explain: string
}

export interface LessonText {
  title: string
  summary: string
  questions: readonly QuestionText[]
}

export interface BadgeText {
  name: string
  earned: string
  how: string
}

export interface UiStrings {
  tagline: string
  welcome: {
    chooseLanguage: string
    steps: readonly { title: string; body: string }[]
    next: string
    back: string
    start: string
    haveAccount: string
  }
  auth: {
    signUpTitle: string
    signUpIntro: string
    signInTitle: string
    signInIntro: string
    name: string
    email: string
    emailHint: string
    password: string
    passwordHint: string
    showPassword: string
    hidePassword: string
    createAccount: string
    signIn: string
    working: string
    toSignIn: string
    toSignUp: string
    demoNote: string
    errors: {
      name: string
      email: string
      password: string
      invalidLogin: string
      emailTaken: string
      checkEmail: string
      network: string
      unknown: string
    }
  }
  nav: { journey: string; badges: string; settings: string; label: string }
  journey: {
    greeting: string
    title: string
    intro: string
    done: string
    current: string
    upcoming: string
    start: string
    again: string
    youAreHere: string
    nextBadge: string
    lessonsCount: string
    allDone: string
    finish: string
    saveError: string
    retry: string
  }
  lesson: {
    questionOf: string
    readQuestion: string
    readHint: string
    stopReading: string
    tryAgain: string
    next: string
    finish: string
    hint: string
    notThisOne: string
    exit: string
    stuck: string
    showHint: string
    notFound: string
  }
  complete: {
    title: string
    body: string
    score: string
    newBadge: string
    backToJourney: string
    seeBadges: string
  }
  badges: {
    title: string
    intro: string
    locked: string
    unlocked: string
    progress: string
    emptyTitle: string
    emptyBody: string
  }
  settings: {
    title: string
    language: string
    calm: string
    calmHint: string
    sound: string
    soundHint: string
    soundOffInCalm: string
    voice: string
    voiceTest: string
    voiceSample: string
    voiceMissing: string
    account: string
    signedInAs: string
    signOut: string
    demoMode: string
    demoModeHint: string
  }
  loading: string
  skipToContent: string
}

export interface Messages {
  correct: readonly string[]
  wrong: readonly string[]
  complete: readonly string[]
}

export interface LanguagePack {
  code: LangCode
  /** Name of the language written in that language. */
  name: string
  dir: 'ltr' | 'rtl'
  /** BCP 47 tag used to pick a device voice. */
  speechLang: string
  ui: UiStrings
  messages: Messages
  lessons: Record<LessonId, LessonText>
  badges: Record<BadgeId, BadgeText>
}
