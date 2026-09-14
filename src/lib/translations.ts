export type Locale = 'en';

export interface TranslationDictionary {
  brand: {
    alias: string;
    fullName: string;
    bio: string;
    tagline: string;
  };
  header: {
    answeredCounter: string;
    likesCounter: string;
    langToggle: string;
    adminAccess: string;
    askButton: string;
  };
  feed: {
    title: string;
    subtitle: string;
    tabRecent: string;
    tabLiked: string;
    searchPlaceholder: string;
    noQuestions: string;
    noQuestionsSub: string;
    anonymous: string;
    like: string;
    liked: string;
    followUp: string;
    share: string;
    copied: string;
    profSignature: string;
    followUpTo: string;
    viewThread: string;
  };
  askModal: {
    triggerButton: string;
    title: string;
    desc: string;
    questionLabel: string;
    questionPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    anonymousNote: string;
    replyingTo: string;
    cancelReply: string;
    submitButton: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    successBadge: string;
    closeButton: string;
    rateLimitError: string;
    validationError: string;
  };
  inbox: {
    title: string;
    subtitle: string;
    pendingTab: string;
    answeredTab: string;
    pendingCount: string;
    answeredCount: string;
    passphraseTitle: string;
    passphraseDesc: string;
    passphrasePlaceholder: string;
    loginButton: string;
    loggingIn: string;
    invalidPass: string;
    logoutButton: string;
    emptyPending: string;
    emptyPendingSub: string;
    answerPlaceholder: string;
    publishButton: string;
    publishing: string;
    deleteButton: string;
    deleting: string;
    editAnswer: string;
    saveChanges: string;
    returnHome: string;
    adminBadge: string;
    dateSubmitted: string;
  };
  time: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    brand: {
      alias: 'Prof',
      fullName: 'Mahmoud Sayed Mohamed',
      bio: 'Junior Backend .NET Developer (ASP.NET Core) based in Assiut, Egypt. Building scalable web services and systems. Ask me anything about backend architecture, career, or whatever is on your mind.',
      tagline: 'Ask anything anonymously. Thoughtful, direct answers.',
    },
    header: {
      answeredCounter: 'Answers',
      likesCounter: 'Likes',
      langToggle: 'English',
      adminAccess: 'Admin',
      askButton: 'Ask a Question',
    },
    feed: {
      title: 'Questions & Answers',
      subtitle: 'Questions asked anonymously and answered by Prof',
      tabRecent: 'Recent',
      tabLiked: 'Most Liked',
      searchPlaceholder: 'Search questions & answers...',
      noQuestions: 'No questions found',
      noQuestionsSub: 'Be the first to ask a question.',
      anonymous: 'Anonymous',
      like: 'Like',
      liked: 'Liked',
      followUp: 'Reply / Follow up',
      share: 'Share',
      copied: 'Link copied!',
      profSignature: 'Prof',
      followUpTo: 'In reply to:',
      viewThread: 'View thread',
    },
    askModal: {
      triggerButton: 'Ask a Question',
      title: 'Ask a Question',
      desc: 'Ask anything anonymously. No account needed.',
      questionLabel: 'Your question',
      questionPlaceholder: 'Ask about backend development, architecture, projects, advice, or anything else...',
      nameLabel: 'Your name (optional)',
      namePlaceholder: 'Leave blank to stay completely anonymous',
      anonymousNote: 'Will be posted anonymously if left blank',
      replyingTo: 'Replying to:',
      cancelReply: 'Cancel reply',
      submitButton: 'Send Question',
      submitting: 'Sending...',
      successTitle: 'Question Sent',
      successDesc: 'Thanks for reaching out! Prof will review and answer it on the feed soon.',
      successBadge: 'Pending review',
      closeButton: 'Done',
      rateLimitError: 'You have sent several questions recently. Please wait a few minutes before trying again.',
      validationError: 'Please write a question with at least 8 characters.',
    },
    inbox: {
      title: 'Admin Inbox',
      subtitle: 'Manage incoming questions and publish answers',
      pendingTab: 'Pending',
      answeredTab: 'Answered',
      pendingCount: 'pending',
      answeredCount: 'answered',
      passphraseTitle: 'Admin Login',
      passphraseDesc: 'Enter your password to access the admin dashboard.',
      passphrasePlaceholder: 'Enter admin password...',
      loginButton: 'Log In',
      loggingIn: 'Checking password...',
      invalidPass: 'Incorrect password. Please try again.',
      logoutButton: 'Log Out',
      emptyPending: 'No pending questions',
      emptyPendingSub: 'You are all caught up. New questions will appear here.',
      answerPlaceholder: 'Write your answer here...',
      publishButton: 'Publish Answer',
      publishing: 'Publishing...',
      deleteButton: 'Delete Question',
      deleting: 'Deleting...',
      editAnswer: 'Edit Answer',
      saveChanges: 'Save Changes',
      returnHome: 'Back to site',
      adminBadge: 'Admin',
      dateSubmitted: 'Received',
    },
    time: {
      justNow: 'Just now',
      minutesAgo: '{n}m ago',
      hoursAgo: '{n}h ago',
      daysAgo: '{n}d ago',
    },
  },
};
