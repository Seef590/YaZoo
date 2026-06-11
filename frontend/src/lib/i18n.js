export const LOCALE_STORAGE_KEY = 'yazoo-locale'

export const SUPPORTED_LOCALES = ['fr', 'en', 'ar', 'de']

const messages = {
  fr: {
    common: {
      appName: 'YaZoo',
      tagline: 'Reseau social et marketplace animalier',
      loadingSession: 'Verification de la session...',
      loadingExperience: "Chargement de l'experience...",
      backHome: "Retour a l'accueil",
      login: 'Connexion',
      register: 'Inscription',
      createAccount: 'Creer un compte',
      alreadyAccount: "J'ai deja un compte",
      phone: 'Telephone',
      optionalEmail: 'Email optionnel',
      otpCode: 'Code OTP',
      sendCode: 'Recevoir le code',
      resendCode: 'Renvoyer le code',
      verifyAndLogin: 'Verifier et entrer',
      verifyAndRegister: 'Verifier et creer mon compte',
      name: 'Nom',
      country: 'Pays',
      city: 'Ville',
      bio: 'Bio',
      save: 'Enregistrer',
      cancel: 'Annuler',
      logout: 'Se deconnecter',
      profile: 'Profil',
      feed: 'Feed',
      reservations: 'Reservations',
      history: 'Historique',
      animals: 'Animaux',
      products: 'Produits',
      communities: 'Communautes',
      messages: 'Messages',
      notifications: 'Notifications',
      language: 'Langue',
      french: 'Francais',
      english: 'Anglais',
      arabic: 'Arabe',
      german: 'Allemand',
      nextStep: 'Prochaine etape',
      user: 'Utilisateur',
      verifiedPhone: 'Telephone verifie',
      notProvided: 'Non renseigne',
      notAvailable: 'Indisponible',
      loading: 'Chargement...',
      total: 'Total',
      submitReview: 'Laisser un avis',
      rating: 'Note',
      comment: 'Commentaire',
      reviewPlaceholder: 'Decrivez votre experience de maniere claire et utile.',
      noReviewYet: 'Aucun avis pour le moment.',
      reviewSent: 'Avis envoye.',
      smsDebug: 'Code de test',
      chooseLanguage: 'Choisir la langue',
      startConversation: 'Demarrer la conversation',
      contactLabel: 'Numero ou email du destinataire',
    },
    layout: {
      logoLabel: 'Logo YaZoo',
      adminGlobal: 'Admin global',
      unread: '{count} notification{suffix} non lue{suffix}',
      accountAdmin: 'Compte administrateur',
      accountMember: 'Membre YaZoo',
      menuOpen: 'Ouvrir le menu',
      menuClose: 'Fermer le menu',
      shellNote:
        'Le feed, les marketplaces, les communautes, la messagerie et les notifications sont actives. Le module commandes couvre reservation, livraison, facture, historique et pilotage admin.',
    },
    footer: {
      about:
        'Une plateforme pensee pour partager, vendre, reserver et discuter autour de l univers animalier, avec une experience claire, mobile et lumineuse.',
      navigation: 'Navigation',
      author: 'Auteur',
      authorText:
        'Projet developpe et integre pour YaZoo, avec direction visuelle, experience mobile et architecture full-stack.',
      projectGithub: 'GitHub du projet',
      rights: 'Tous droits reserves.',
      copyright: 'Copyright {year} YaZoo. Projet developpe par Seef590.',
    },
    landing: {
      badge: 'Plateforme douce, utile et solide',
      title: 'Le social animalier, le marketplace et la confiance dans une meme app.',
      description:
        'YaZoo relie communaute, annonces, commandes, messagerie et profil de confiance dans une interface claire et chaleureuse.',
      startNow: 'Commencer maintenant',
      experience: 'Experience',
      responsive: 'Responsive',
      style: 'Style',
      heroCardTitle: 'Une entree claire vers toute la plateforme.',
      heroCardBadge: 'Landing modernisee',
      featuresTitle: 'Une base produit deja riche, dans une presentation plus attirante.',
      featuresText:
        'La nouvelle direction visuelle met en avant la chaleur, la confiance et la lisibilite, sans perdre le cadre professionnel du projet.',
      journeyTitle: 'Une experience plus adorable, confortable et amusante.',
      journeyText:
        'La mise en page reprend un esprit plus doux, avec des sections respirantes et des points d entree plus visibles.',
      entryTitle: "Une landing qui ouvre naturellement vers l'inscription ou la connexion.",
      entryText:
        'Vos visiteurs comprennent mieux la promesse produit et entrent ensuite dans le bon parcours sans friction visuelle.',
    },
    auth: {
      loginTitle: 'Heureux de vous revoir',
      loginText:
        'Connectez-vous avec votre numero de telephone et un code OTP recu par SMS.',
      loginHeroTitle: 'Retrouvez votre espace, vos messages et vos commandes.',
      loginHeroText:
        "Connectez-vous par telephone pour reprendre votre activite exactement la ou vous l'avez laissee.",
      registerTitle: 'Creer mon compte',
      registerText:
        'Le numero de telephone devient votre acces principal, avec email facultatif et verification OTP.',
      registerHeroTitle: 'Entrez dans une plateforme plus simple a aimer et a utiliser.',
      registerHeroText:
        'Creez votre compte avec votre telephone pour publier, vendre, reserver et discuter sur YaZoo.',
      phonePlaceholder: '+2126...',
      emailPlaceholder: 'vous@exemple.com',
      otpPlaceholder: '123456',
      otpHelp: 'Un SMS contenant un code a 6 chiffres sera envoye.',
      registerSuccessHint: "Le premier compte d'une base vide devient admin.",
    },
    profile: {
      publicProfile: 'Profil public',
      profileSpace: 'Mon espace public',
      profileSpaceText: 'Posts et annonces visibles en priorite',
      comfortTitle: 'Confort utilisateur',
      comfortText:
        'Votre formulaire reste masque tant que vous ne cliquez pas sur "Modifier mon profil".',
      identity: 'Identite',
      profileTips: 'Conseils profil',
      editProfile: 'Modifier mon profil',
      closeEdit: 'Fermer la modification',
      openFeed: 'Voir mon feed',
      photo: 'Photo de profil',
      cover: 'Photo de couverture',
      changePhoto: 'Changer la photo',
      changeCover: 'Changer la couverture',
      remove: 'Retirer',
      locationMissing: 'Localisation non renseignee',
      bioPlaceholder:
        'Ajoutez une bio pour raconter votre univers, vos animaux et ce que vous partagez sur YaZoo.',
      editTitle: 'Modifier mon profil',
      editText: 'Mettez a jour votre presentation publique et vos informations de contact.',
      phoneVerified: 'Telephone verifie',
      trustScore: 'Confiance',
      reviewCount: '{count} avis',
    },
    reservations: {
      intro:
        'Le module commandes est actif. Vous pouvez suivre la reservation, la livraison, puis generer la facture finale de chaque commande terminee.',
      center: 'Centre de commandes',
      centerText: 'Suivez vos achats et vos ventes avec livraison et facture.',
      myPurchases: 'Mes achats ({count})',
      mySales: 'Mes ventes ({count})',
      noOrders: 'Aucune reservation dans cette section pour le moment.',
      loading: 'Chargement des reservations...',
      contact: 'Contacter',
      invoice: 'Facture',
      approve: 'Approuver',
      reject: 'Refuser',
      cancel: 'Annuler',
      complete: 'Finaliser + facturer',
      leaveReview: 'Laisser un avis',
      pendingReview: 'Avis obligatoire en attente',
    },
    history: {
      badge: 'Order history',
      title: 'Un historique commandes plus doux pour relire vos achats et vos ventes archivees.',
      text:
        'Les cartes, badges et actions de facture reprennent la nouvelle direction visuelle YaZoo tout en gardant les informations essentielles faciles a lire.',
      archives: 'Archives',
      archivesText: 'Consultez vos achats et ventes archives.',
      empty: 'Aucun historique disponible pour cette section.',
      loading: "Chargement de l'historique...",
      myPurchases: 'Mes achats ({count})',
      mySales: 'Mes ventes ({count})',
      viewInvoice: 'Voir la facture',
      viewListing: "Voir l'annonce",
    },
    messages: {
      badge: 'Messagerie',
      title: 'Une boite de reception plus claire, plus douce et plus agreable a suivre.',
      text:
        'Retrouvez vos conversations privees, demarrez un nouveau contact et suivez vos echanges dans une interface lumineuse.',
      newContact: 'Nouveau contact',
      newConversation: 'Nouvelle conversation',
      startWithContact: 'Entrez un numero ou un email et un premier message pour demarrer.',
      firstMessage: 'Premier message',
      inbox: 'Inbox',
      noConversation: 'Aucune conversation pour le moment.',
      selectConversation: 'Selectionnez une conversation ou creez-en une nouvelle.',
      openConversation: 'Conversation ouverte',
      newMessage: 'Nouveau message',
      send: 'Envoyer',
      you: 'Vous',
      readyToStart: 'Conversation prete a demarrer.',
      noMessageYet: 'Aucun message pour le moment. Envoyez le premier.',
      activeConversation: 'Conversation active',
      unread: 'Non lus',
      opened: 'Ouverte',
      toOpen: 'A ouvrir',
    },
  },
  ar: {
    common: {
      appName: 'YaZoo',
      tagline: 'شبكة اجتماعية ومتجر للحيوانات',
      loadingSession: 'جار التحقق من الجلسة...',
      loadingExperience: 'جار تحميل التجربة...',
      backHome: 'العودة إلى الرئيسية',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      createAccount: 'إنشاء حساب',
      alreadyAccount: 'لدي حساب بالفعل',
      phone: 'الهاتف',
      optionalEmail: 'البريد الإلكتروني اختياري',
      otpCode: 'رمز التحقق',
      sendCode: 'إرسال الرمز',
      resendCode: 'إعادة إرسال الرمز',
      verifyAndLogin: 'تحقق وادخل',
      verifyAndRegister: 'تحقق وأنشئ الحساب',
      name: 'الاسم',
      country: 'البلد',
      city: 'المدينة',
      bio: 'نبذة',
      save: 'حفظ',
      cancel: 'إلغاء',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي',
      feed: 'المنشورات',
      reservations: 'الحجوزات',
      history: 'السجل',
      animals: 'الحيوانات',
      products: 'المنتجات',
      communities: 'المجتمعات',
      messages: 'الرسائل',
      notifications: 'الإشعارات',
      language: 'اللغة',
      french: 'الفرنسية',
      arabic: 'العربية',
      nextStep: 'الخطوة التالية',
      user: 'مستخدم',
      verifiedPhone: 'هاتف موثق',
      notProvided: 'غير متوفر',
      notAvailable: 'غير متاح',
      loading: 'جار التحميل...',
      total: 'المجموع',
      submitReview: 'إرسال تقييم',
      rating: 'التنقيط',
      comment: 'التعليق',
      reviewPlaceholder: 'صف تجربتك بشكل واضح ومفيد.',
      noReviewYet: 'لا يوجد تقييم بعد.',
      reviewSent: 'تم إرسال التقييم.',
      smsDebug: 'رمز الاختبار',
      chooseLanguage: 'اختيار اللغة',
      startConversation: 'بدء المحادثة',
      contactLabel: 'رقم أو بريد المستلم',
    },
    layout: {
      logoLabel: 'شعار YaZoo',
      adminGlobal: 'مدير عام',
      unread: '{count} إشعار{suffix} غير مقروء',
      accountAdmin: 'حساب إداري',
      accountMember: 'عضو في YaZoo',
      menuOpen: 'فتح القائمة',
      menuClose: 'إغلاق القائمة',
      shellNote:
        'المنشورات والمتاجر والمجتمعات والرسائل والإشعارات كلها مفعلة. كما أن وحدة الطلبات تغطي الحجز والتوصيل والفاتورة والسجل ولوحة الإدارة.',
    },
    footer: {
      about:
        'منصة لمشاركة وبيع وحجز ومناقشة كل ما يتعلق بعالم الحيوانات داخل تجربة واضحة ومريحة ومضيئة.',
      navigation: 'التنقل',
      author: 'المطور',
      authorText:
        'تم تطوير المشروع ودمجه لمنصة YaZoo مع عناية بالهوية البصرية وتجربة الهاتف والبنية الكاملة.',
      projectGithub: 'GitHub المشروع',
      rights: 'جميع الحقوق محفوظة.',
      copyright: 'حقوق النشر {year} YaZoo. المشروع من تطوير Seef590.',
    },
    landing: {
      badge: 'منصة مفيدة وهادئة ومتينة',
      title: 'الشبكة الاجتماعية الحيوانية والمتجر والثقة داخل تطبيق واحد.',
      description:
        'YaZoo يجمع المجتمع والإعلانات والطلبات والرسائل وملف الثقة داخل واجهة واضحة ودافئة.',
      startNow: 'ابدأ الآن',
      experience: 'التجربة',
      responsive: 'الاستجابة',
      style: 'الأسلوب',
      heroCardTitle: 'دخول واضح نحو كامل المنصة.',
      heroCardBadge: 'واجهة افتتاحية مطورة',
      featuresTitle: 'قاعدة منتج غنية بالفعل داخل عرض بصري أكثر جاذبية.',
      featuresText:
        'الاتجاه البصري الجديد يبرز الدفء والثقة وسهولة القراءة من دون فقدان الإطار الاحترافي.',
      journeyTitle: 'تجربة ألطف وأكثر راحة ومتعة.',
      journeyText:
        'الصفحة أصبحت أخف بصريا مع مساحات أفضل ونقاط دخول أوضح للمستخدم.',
      entryTitle: 'واجهة افتتاحية تقود طبيعيا نحو التسجيل أو الدخول.',
      entryText:
        'يفهم الزائر الوعد الأساسي للمنتج ثم يدخل مباشرة إلى المسار المناسب دون احتكاك بصري.',
    },
    auth: {
      loginTitle: 'سعداء بعودتك',
      loginText: 'سجّل الدخول برقم هاتفك ورمز OTP يصل عبر الرسائل القصيرة.',
      loginHeroTitle: 'استعد مساحتك ورسائلك وطلباتك.',
      loginHeroText: 'ادخل عبر الهاتف للمتابعة من حيث توقفت داخل YaZoo.',
      registerTitle: 'إنشاء حسابي',
      registerText:
        'أصبح رقم الهاتف وسيلة الدخول الأساسية مع بريد إلكتروني اختياري وتحقق عبر OTP.',
      registerHeroTitle: 'ادخل إلى منصة أسهل وأقرب للمستخدم.',
      registerHeroText:
        'أنشئ حسابك بالهاتف للنشر والبيع والحجز والدردشة داخل YaZoo.',
      phonePlaceholder: '+2126...',
      emailPlaceholder: 'vous@exemple.com',
      otpPlaceholder: '123456',
      otpHelp: 'سيتم إرسال رمز مكون من 6 أرقام عبر الرسائل القصيرة.',
      registerSuccessHint: 'أول حساب داخل قاعدة فارغة يصبح مديرا.',
    },
    profile: {
      publicProfile: 'الملف العام',
      profileSpace: 'مساحتي العامة',
      profileSpaceText: 'المنشورات والإعلانات الظاهرة أولا',
      comfortTitle: 'راحة المستخدم',
      comfortText:
        'يبقى نموذج التعديل مخفيا حتى تضغط على "تعديل الملف الشخصي".',
      identity: 'الهوية',
      profileTips: 'نصائح الملف',
      editProfile: 'تعديل الملف الشخصي',
      closeEdit: 'إغلاق التعديل',
      openFeed: 'عرض منشوراتي',
      photo: 'الصورة الشخصية',
      cover: 'صورة الغلاف',
      changePhoto: 'تغيير الصورة',
      changeCover: 'تغيير الغلاف',
      remove: 'حذف',
      locationMissing: 'الموقع غير مذكور',
      bioPlaceholder: 'أضف نبذة تعرف بعالمك وحيواناتك وما تشاركه في YaZoo.',
      editTitle: 'تعديل الملف الشخصي',
      editText: 'حدّث صورتك العامة وبياناتك الأساسية ووسيلة الثقة.',
      phoneVerified: 'الهاتف موثق',
      trustScore: 'الثقة',
      reviewCount: '{count} تقييم',
    },
    reservations: {
      intro:
        'وحدة الطلبات مفعلة. يمكنك تتبع الحجز والتوصيل ثم إصدار الفاتورة النهائية لكل طلب مكتمل.',
      center: 'مركز الطلبات',
      centerText: 'تابع مشترياتك ومبيعاتك مع التوصيل والفاتورة.',
      myPurchases: 'مشترياتي ({count})',
      mySales: 'مبيعاتي ({count})',
      noOrders: 'لا توجد حجوزات في هذا القسم حاليا.',
      loading: 'جار تحميل الحجوزات...',
      contact: 'تواصل',
      invoice: 'الفاتورة',
      approve: 'قبول',
      reject: 'رفض',
      cancel: 'إلغاء',
      complete: 'إنهاء + فوترة',
      leaveReview: 'أضف تقييما',
      pendingReview: 'تقييم إلزامي قيد الانتظار',
    },
    history: {
      badge: 'سجل الطلبات',
      title: 'سجل ألطف لقراءة مشترياتك ومبيعاتك المؤرشفة.',
      text:
        'تعرض البطاقات والشارات والفاتورة بنفس الاتجاه البصري الجديد مع الحفاظ على وضوح المعلومات.',
      archives: 'الأرشيف',
      archivesText: 'اطلع على مشترياتك ومبيعاتك المؤرشفة.',
      empty: 'لا يوجد سجل متاح في هذا القسم.',
      loading: 'جار تحميل السجل...',
      myPurchases: 'مشترياتي ({count})',
      mySales: 'مبيعاتي ({count})',
      viewInvoice: 'عرض الفاتورة',
      viewListing: 'عرض الإعلان',
    },
    messages: {
      badge: 'الرسائل',
      title: 'صندوق رسائل أوضح وألطف وأسهل متابعة.',
      text:
        'استرجع محادثاتك الخاصة وابدأ تواصلا جديدا داخل واجهة مضيئة ومريحة.',
      newContact: 'جهة اتصال جديدة',
      newConversation: 'محادثة جديدة',
      startWithContact: 'أدخل رقما أو بريدا وأول رسالة لبدء المحادثة.',
      firstMessage: 'الرسالة الأولى',
      inbox: 'صندوق الوارد',
      noConversation: 'لا توجد محادثات حاليا.',
      selectConversation: 'اختر محادثة أو أنشئ واحدة جديدة.',
      openConversation: 'المحادثة المفتوحة',
      newMessage: 'رسالة جديدة',
      send: 'إرسال',
      you: 'أنت',
      readyToStart: 'المحادثة جاهزة للبدء.',
      noMessageYet: 'لا توجد رسائل بعد. أرسل أول رسالة.',
      activeConversation: 'المحادثة النشطة',
      unread: 'غير المقروء',
      opened: 'مفتوحة',
      toOpen: 'بانتظار الفتح',
    },
  },
  en: {
    common: {
      appName: 'YaZoo',
      tagline: 'Social network and marketplace for pet owners',
      loadingSession: 'Checking session...',
      loadingExperience: 'Loading experience...',
      backHome: 'Back home',
      login: 'Log in',
      register: 'Sign up',
      createAccount: 'Create account',
      alreadyAccount: 'I already have an account',
      phone: 'Phone',
      optionalEmail: 'Optional email',
      otpCode: 'OTP code',
      sendCode: 'Get code',
      resendCode: 'Resend code',
      verifyAndLogin: 'Verify and enter',
      verifyAndRegister: 'Verify and create account',
      name: 'Name',
      country: 'Country',
      city: 'City',
      bio: 'Bio',
      save: 'Save',
      cancel: 'Cancel',
      logout: 'Log out',
      profile: 'Profile',
      feed: 'Feed',
      reservations: 'Reservations',
      history: 'History',
      animals: 'Animals',
      products: 'Products',
      communities: 'Communities',
      messages: 'Messages',
      notifications: 'Notifications',
      language: 'Language',
      french: 'French',
      english: 'English',
      arabic: 'Arabic',
      german: 'German',
      nextStep: 'Next step',
      user: 'User',
      verifiedPhone: 'Verified phone',
      notProvided: 'Not provided',
      notAvailable: 'Unavailable',
      loading: 'Loading...',
      total: 'Total',
      submitReview: 'Submit review',
      rating: 'Rating',
      comment: 'Comment',
      reviewPlaceholder: 'Describe your experience clearly and helpfully.',
      noReviewYet: 'No reviews yet.',
      reviewSent: 'Review sent.',
      smsDebug: 'Test code',
      chooseLanguage: 'Choose language',
      startConversation: 'Start conversation',
      contactLabel: 'Recipient phone or email',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    layout: {
      logoLabel: 'YaZoo logo',
      adminGlobal: 'Global admin',
      unread: '{count} unread notification{suffix}',
      accountAdmin: 'Admin account',
      accountMember: 'YaZoo member',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      shellNote:
        'Feed, marketplace, communities, messaging and notifications are active.',
    },
    footer: {
      about:
        'A platform to share, sell, book and chat around the pet world.',
      navigation: 'Navigation',
      author: 'Author',
      authorText:
        'Project developed and integrated for YaZoo with visual direction, mobile experience and full-stack architecture.',
      projectGithub: 'Project GitHub',
      rights: 'All rights reserved.',
      copyright: 'Copyright {year} YaZoo. Project developed by Seef590.',
    },
  },
  de: {
    common: {
      appName: 'YaZoo',
      tagline: 'Soziales Netzwerk und Marktplatz fuer Tierhalter',
      loadingSession: 'Sitzung wird geprueft...',
      loadingExperience: 'Erlebnis wird geladen...',
      backHome: 'Zur Startseite',
      login: 'Anmelden',
      register: 'Registrieren',
      createAccount: 'Konto erstellen',
      alreadyAccount: 'Ich habe bereits ein Konto',
      phone: 'Telefon',
      optionalEmail: 'Optionale E-Mail',
      otpCode: 'OTP-Code',
      sendCode: 'Code erhalten',
      resendCode: 'Code erneut senden',
      verifyAndLogin: 'Pruefen und anmelden',
      verifyAndRegister: 'Pruefen und Konto erstellen',
      name: 'Name',
      country: 'Land',
      city: 'Stadt',
      bio: 'Bio',
      save: 'Speichern',
      cancel: 'Abbrechen',
      logout: 'Abmelden',
      profile: 'Profil',
      feed: 'Feed',
      reservations: 'Reservierungen',
      history: 'Verlauf',
      animals: 'Tiere',
      products: 'Produkte',
      communities: 'Communities',
      messages: 'Nachrichten',
      notifications: 'Benachrichtigungen',
      language: 'Sprache',
      french: 'Franzoesisch',
      arabic: 'Arabisch',
      german: 'Deutsch',
      nextStep: 'Naechster Schritt',
      user: 'Nutzer',
      verifiedPhone: 'Verifiziertes Telefon',
      notProvided: 'Nicht angegeben',
      notAvailable: 'Nicht verfuegbar',
      loading: 'Wird geladen...',
      total: 'Gesamt',
      submitReview: 'Bewertung senden',
      rating: 'Bewertung',
      comment: 'Kommentar',
      reviewPlaceholder: 'Beschreiben Sie Ihre Erfahrung klar und hilfreich.',
      noReviewYet: 'Noch keine Bewertungen.',
      reviewSent: 'Bewertung gesendet.',
      smsDebug: 'Testcode',
      chooseLanguage: 'Sprache waehlen',
      startConversation: 'Konversation starten',
      contactLabel: 'Telefon oder E-Mail des Empfaengers',
      theme: 'Design',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System',
    },
    layout: {
      logoLabel: 'YaZoo Logo',
      adminGlobal: 'Globaler Admin',
      unread: '{count} ungelesene Benachrichtigung{suffix}',
      accountAdmin: 'Administratorkonto',
      accountMember: 'YaZoo Mitglied',
      menuOpen: 'Menue oeffnen',
      menuClose: 'Menue schliessen',
      shellNote:
        'Feed, Marktplatz, Communities, Nachrichten und Benachrichtigungen sind aktiv.',
    },
    footer: {
      about:
        'Eine Plattform zum Teilen, Verkaufen, Reservieren und Diskutieren rund um Tiere.',
      navigation: 'Navigation',
      author: 'Autor',
      authorText:
        'Projekt fuer YaZoo mit visueller Richtung, mobiler Erfahrung und Full-Stack-Architektur.',
      projectGithub: 'Projekt auf GitHub',
      rights: 'Alle Rechte vorbehalten.',
      copyright: 'Copyright {year} YaZoo. Projekt entwickelt von Seef590.',
    },
  },
}

export function getStoredLocale() {
  if (typeof globalThis.localStorage === 'undefined') {
    return 'fr'
  }

  const rawLocale = globalThis.localStorage.getItem(LOCALE_STORAGE_KEY) ?? 'fr'

  return SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : 'fr'
}

export function setStoredLocale(locale) {
  if (typeof globalThis.localStorage === 'undefined') {
    return
  }

  globalThis.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function getCurrentLocale() {
  return getStoredLocale()
}

export function getDirection(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function translate(locale, key, replacements = {}) {
  const dictionary = messages[locale] ?? messages.fr
  const segments = key.split('.')
  let value = dictionary

  for (const segment of segments) {
    value = value?.[segment]
  }

  if (typeof value !== 'string') {
    return key
  }

  return Object.entries(replacements).reduce((result, [replacementKey, replacementValue]) => {
    return result.replaceAll(`{${replacementKey}}`, String(replacementValue))
  }, value)
}

export function getDateLocale(locale) {
  if (locale === 'ar') {
    return 'ar-MA'
  }

  if (locale === 'de') {
    return 'de-DE'
  }

  if (locale === 'en') {
    return 'en-US'
  }

  return 'fr-FR'
}
