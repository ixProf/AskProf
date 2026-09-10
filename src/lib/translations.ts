export type Locale = 'ar' | 'en';

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
  ar: {
    brand: {
      alias: 'بروف',
      fullName: 'محمود سيد محمد',
      bio: 'مهندس برمجيات، سباك دوت نت يعني، رابعة حاسبات ومعلومات، مشيت ايدي على كام مشروع فري لانس، وعامل استارت اب كويسة خالص وهتعجبكم إن شاء الله',
      tagline: 'منصة الاسئلة المشفرة · اسأل براحتك وهتلاقي الاجابة إن شاء الله',
    },
    header: {
      answeredCounter: 'إجابة مكتملة',
      likesCounter: 'إعجاب',
      langToggle: 'English',
      adminAccess: 'خزينة الإدارة',
      askButton: 'وجّه سؤالاً لبروف',
    },
    feed: {
      title: 'سجل الاستفسارات والأسئلة',
      subtitle: 'الاجابات اللي بتعجب الناس',
      tabRecent: 'الأحدث أولاً',
      tabLiked: 'الأكثر تأثيراً وإعجاباً',
      searchPlaceholder: 'ابحث في أرشيف الأسئلة والأجوبة...',
      noQuestions: 'لا توجد استفسارات مطابقة في هذا السجل',
      noQuestionsSub: 'يمكنك إرسال أول استفسار ليتم الرد عليه وإدراجه هنا.',
      anonymous: 'مجهول الهوية',
      like: 'إعجاب',
      liked: 'أعجبك',
      followUp: 'متابعة بسؤال مرتبط',
      share: 'مشاركة الرابط',
      copied: 'تم نسخ الرابط!',
      profSignature: 'رد البروف',
      followUpTo: 'متابعة وتعقيب على:',
      viewThread: 'عرض الأصل',
    },
    askModal: {
      triggerButton: 'اسأل بروف سؤالاً',
      title: 'إرسال استفسار مشفر',
      desc: 'مكان الرسائل، ارسل ما يحلو لك يا ملك',
      questionLabel: 'نص السؤال أو الاستشارة التقنية',
      questionPlaceholder: 'اكتب سؤالك او نقدك او اي حاجه انت عايزها يا هندسة',
      nameLabel: 'الاسم أو اللقب (اختياري)',
      namePlaceholder: 'اتركه فارغاً للإرسال بهوية مجهولة تماماً',
      anonymousNote: 'الوضع الافتراضي: إرسال مجهول (Anonymous)',
      replyingTo: 'أنت الآن انت بترد على سؤال فات، خد بالك:',
      cancelReply: 'إلغاء الارتباط',
      submitButton: 'إيداع السؤال في سلة الاسئلة',
      submitting: 'جارٍ التشفير والإرسال...',
      successTitle: 'رسالتك وصلت يا صحبي، واطمن هويتك امان، عيش براحتك يا هندسة.',
      successDesc: 'تم حفظ السؤال وحالته الآن «قيد المراجعة». سيقوم البروف بدراسته وإضافة الإجابة ونشرها في السجل العام.',
      successBadge: 'مشفر ومحفوظ',
      closeButton: 'إغلاق',
      rateLimitError: 'لقد قمت بإرسال عدد كبير من الرسائل خلال وقت قصير. يُرجى الانتظار قليلاً.',
      validationError: 'اكتب سؤال عدل يا راجل، مش اقل من 8 حروف يا هندسة',
    },
    inbox: {
      title: 'غرفة الرد والفلترة والعرض',
      subtitle: 'إدارة الأسئلة الواردة، اعتماد الإجابات، والتحكم في النشر',
      pendingTab: 'الأسئلة الواردة (قيد الانتظار)',
      answeredTab: 'الأرشيف المنشور',
      pendingCount: 'استفسارات معلقة',
      answeredCount: 'إجابات منشورة',
      passphraseTitle: 'منطقة محظورة · تصريح دخول البروف',
      passphraseDesc: 'أدخل الرمز السري المخصص للوصول إلى الخزينة وإدارة غرفة العمليات.',
      passphrasePlaceholder: 'أدخل كلمة المرور السرية...',
      loginButton: 'فك التشفير والولوج',
      loggingIn: 'جارٍ التحقق...',
      invalidPass: 'رمز المرور غير صحيح. تم تسجيل محاولة الدخول.',
      logoutButton: 'إغلاق الخزينة والمغادرة',
      emptyPending: 'الخزينة خالية من الرسائل المعلقة',
      emptyPendingSub: 'تم الرد على جميع الاستفسارات الواردة أو استبعادها.',
      answerPlaceholder: 'اكتب إجابة البروف الشاملة هنا...',
      publishButton: 'اعتماد ونشر في السجل العام',
      publishing: 'جارٍ النشر...',
      deleteButton: 'استبعاد / حذف السؤال',
      deleting: 'جارٍ الحذف...',
      editAnswer: 'تعديل الإجابة',
      saveChanges: 'حفظ التعديلات',
      returnHome: 'العودة للصفحة العامة',
      adminBadge: 'المتحكم الرئيسي',
      dateSubmitted: 'تاريخ الإرسال',
    },
    time: {
      justNow: 'الآن',
      minutesAgo: 'منذ {n} دقيقة',
      hoursAgo: 'منذ {n} ساعة',
      daysAgo: 'منذ {n} يوم',
    },
  },
  en: {
    brand: {
      alias: 'Prof',
      fullName: 'Mahmoud Sayed Mohamed',
      bio: 'Junior Backend .NET Developer (ASP.NET Core) based in Assiut, Egypt. Builds production API systems end-to-end — authentication, database transactions, testing, and reporting — across booking, e-commerce, POS, financial, and academic platforms. Delivered 200+ REST API endpoints across freelance and product engagements, including a 97% response-time reduction on one production system. Co-founder & backend developer at Alaris Space. Studying Software Engineering at Assiut National University (Expected 2027).',
      tagline: 'Encrypted Inquiries Terminal · Ask with clarity, receive answers with surgical precision',
    },
    header: {
      answeredCounter: 'Answers Given',
      likesCounter: 'Total Likes',
      langToggle: 'العربية',
      adminAccess: 'Vault Access',
      askButton: 'Ask Prof a Question',
    },
    feed: {
      title: 'Public Intelligence Log',
      subtitle: 'Declassified answers officially dispatched from the Operations Room',
      tabRecent: 'Most Recent',
      tabLiked: 'Most Influential',
      searchPlaceholder: 'Search archive of inquiries & answers...',
      noQuestions: 'No matching records in this dossier',
      noQuestionsSub: 'You can submit the first question to be decrypted and answered.',
      anonymous: 'Anonymous',
      like: 'Like',
      liked: 'Liked',
      followUp: 'Follow up on thread',
      share: 'Share Link',
      copied: 'Link copied to clipboard!',
      profSignature: "Prof's Dispatch",
      followUpTo: 'Follow-up regarding:',
      viewThread: 'View original',
    },
    askModal: {
      triggerButton: 'Ask Prof a Question',
      title: 'Deposit Encrypted Inquiry',
      desc: 'Your transmission is locked directly into the Vault. No account required, strict anonymity guaranteed.',
      questionLabel: 'Your inquiry or technical consultation',
      questionPlaceholder: 'State your question with clarity... regarding architecture, distributed systems, cybersecurity, or career trajectory.',
      nameLabel: 'Name / Alias (Optional)',
      namePlaceholder: 'Leave empty for complete anonymity',
      anonymousNote: 'Default state: Completely Anonymous',
      replyingTo: 'You are submitting a follow-up to:',
      cancelReply: 'Clear reference',
      submitButton: 'Deposit into Vault',
      submitting: 'Encrypting & Transmitting...',
      successTitle: 'Inquiry Successfully Vaulted!',
      successDesc: 'Your question is securely queued in Pending status. Prof reviews each item before declassifying it to the public log.',
      successBadge: 'Encrypted & Queued',
      closeButton: 'Dismiss',
      rateLimitError: 'Transmission threshold exceeded. Please wait a brief moment before sending another inquiry.',
      validationError: 'Please provide a question of at least 10 characters.',
    },
    inbox: {
      title: 'Operations Room & Mastermind Vault',
      subtitle: 'Manage incoming dispatches, formulate tactical responses, and declassify answers',
      pendingTab: 'Pending Inquiries',
      answeredTab: 'Published Archives',
      pendingCount: 'Pending Items',
      answeredCount: 'Published Dispatches',
      passphraseTitle: 'Restricted Perimeter · Mastermind Key Required',
      passphraseDesc: 'Authenticate using the secret vault passphrase to access the command room.',
      passphrasePlaceholder: 'Enter secret passphrase...',
      loginButton: 'Decrypt & Enter',
      loggingIn: 'Verifying credentials...',
      invalidPass: 'Invalid credentials. Access attempt logged.',
      logoutButton: 'Seal Vault & Exit',
      emptyPending: 'No Pending Inquiries in Vault',
      emptyPendingSub: 'All received dispatches have been resolved or dismissed.',
      answerPlaceholder: "Draft Prof's analytical answer here...",
      publishButton: 'Approve & Publish to Log',
      publishing: 'Publishing...',
      deleteButton: 'Dismiss / Purge',
      deleting: 'Purging...',
      editAnswer: 'Edit Dispatch',
      saveChanges: 'Save Modifications',
      returnHome: 'Return to Public Feed',
      adminBadge: 'Mastermind Controller',
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
