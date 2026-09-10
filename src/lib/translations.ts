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
      bio: 'مطور باك إند .NET مبتدئ (ASP.NET Core) مقيم في أسيوط، مصر. يبني أنظمة API إنتاجية متكاملة — المصادقة، معاملات قواعد البيانات، الاختبارات، والتقارير — عبر منصات الحجز، التجارة الإلكترونية، نقاط البيع، والأنظمة المالية والأكاديمية. أنجز أكثر من 200 نقطة نهاية REST API عبر مشاريع منتجات وعمل حر، بما في ذلك خفض زمن الاستجابة بنسبة 97% في أحد الأنظمة الإنتاجية. شريك مؤسس ومطور باك إند في Alaris Space. يدرس هندسة البرمجيات بالجامعة الوطنية بأسيوط (متوقع التخرج 2027).',
      tagline: 'منصة الاستفسارات المشفرة · اسأل ما شئت وستتلقى الإجابة بدقة الخطة المحكمة',
    },
    header: {
      answeredCounter: 'إجابة مكتملة',
      likesCounter: 'إعجاب',
      langToggle: 'English',
      adminAccess: 'خزينة الإدارة',
      askButton: 'وجّه سؤالاً لبروف',
    },
    feed: {
      title: 'السجل العلني للاستفسارات',
      subtitle: 'الأجوبة المعتمدة والمفرجة عنها رسمياً من غرفة العمليات',
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
      desc: 'رسالتك تُودع مباشرة في الخزينة. لا يشترط التسجيل، وسرية هويتك محفوظة تماماً.',
      questionLabel: 'نص السؤال أو الاستشارة التقنية',
      questionPlaceholder: 'اكتب سؤالك بدقة ووضوح... في مجالات البرمجة، هندسة النظم، الأمن السيبراني، أو المسار المهني.',
      nameLabel: 'الاسم أو اللقب (اختياري)',
      namePlaceholder: 'اتركه فارغاً للإرسال بهوية مجهولة تماماً',
      anonymousNote: 'الوضع الافتراضي: إرسال مجهول (Anonymous)',
      replyingTo: 'أنت الآن تعقّب على سؤال سابق:',
      cancelReply: 'إلغاء الارتباط',
      submitButton: 'إيداع السؤال في الخزينة',
      submitting: 'جارٍ التشفير والإرسال...',
      successTitle: 'تم إيداع رسالتك بنجاح في الخزينة!',
      successDesc: 'تم حفظ السؤال وحالته الآن «قيد المراجعة». سيقوم البروف بدراسته وإضافة الإجابة ونشرها في السجل العام.',
      successBadge: 'مشفر ومحفوظ',
      closeButton: 'إغلاق',
      rateLimitError: 'لقد قمت بإرسال عدد كبير من الرسائل خلال وقت قصير. يُرجى الانتظار قليلاً.',
      validationError: 'يُرجى كتابة سؤال يتجاوز ١٠ أحرف على الأقل.',
    },
    inbox: {
      title: 'غرفة العمليات والخزينة الخاصة',
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
