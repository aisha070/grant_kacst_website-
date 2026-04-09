/* ================================================================
   KACST Dashboard — Application Logic
   Requires: config.js loaded before this file.
   ================================================================

   CONFIRMED GOOGLE SHEET COLUMN STRUCTURES:
     stats    → label (big number) | value (Arabic description text)
     about    → key | value | value2
     programs → id, cat, src, name, financial_support,
                target, services, url, hasFinancial, isNew, isClosed
     settings → key | value

   EMAIL editable from Google Sheet:
     about tab → row: key=header_email, value=your@email.com
   ================================================================ */

// ── STATE ────────────────────────────────────────────────────────
var PROGRAMS = [];
var govOpen  = false;

// ── FALLBACK DATA (shown instantly before sheet loads) ────────────
var P_FALLBACK = [
  {id:1,cat:'ntdp',src:'NTDP',n:'تمكين رواد الأعمال في مجال التقنية (Boost)',fin:'مكافأة 20,000 ريال بعد 6 أشهر + 36,000 ريال بعد 12 شهراً + 30,000 ريال بديل ESOP بعد 18 شهراً',t:'رواد الأعمال السعوديون في شركات تقنية ناشئة مسجلة على منشآت-تك',svc:'ورش عمل تفاعلية، دعم من الشركاء، ربط بخبراء فنيين',url:'https://ntdp.gov.sa/tamkeen',f:true,nw:false,cl:false},
  {id:2,cat:'ntdp',src:'NTDP',n:'دعم الشركات التقنية الصغيرة والمتوسطة (Tech Crew)',fin:'دعم رواتب 18 شهراً — حتى 5 موظفين (متناهية الصغر: 3 موظفين)',t:'شركات التقنية الصغيرة والمتوسطة في السعودية',svc:'دعم تغطية رواتب الكفاءات التقنية الوطنية وتحسين التنافسية',url:'https://ntdp.gov.sa/techcrew',f:true,nw:false,cl:true},
  {id:3,cat:'ntdp',src:'NTDP + KAUST',n:'تسريع الابتكار في التقنيات العميقة (Next Era)',fin:'دعم حتى 70% من تكاليف المشروع (رواتب، معدات، برامج، IP)',t:'شركات ناشئة في التقنيات العميقة: AI، IoT، طائرات بدون طيار',svc:'برامج تدريبية وتوجيهية، شبكات تواصل مع مستثمرين',url:'https://ntdp.gov.sa/nextera',f:true,nw:false,cl:true},
  {id:4,cat:'ntdp',src:'NTDP',n:'النموذج الأولي القابل للتطبيق (MVPlab)',fin:'حوافز مالية 150,000 ريال على 4 دفعات عند إتمام مهام محددة',t:'رواد أعمال أكملوا مرحلة MVP أو دراسة الجدوى (18+ سنة)',svc:'استشارات قانونية وإدارية، مساحات عمل مبتكرة، ورش عمل عملية',url:'https://ntdp.gov.sa/mvplab',f:true,nw:false,cl:true},
  {id:5,cat:'ntdp',src:'NTDP',n:'الحوسبة السحابية والـ GPU (Transform+)',fin:'متناهية: 70% بحد 300K | صغيرة: 60% بحد 500K | متوسطة: 50% بحد 800K ريال',t:'شركات ناشئة وصغيرة ومتوسطة تسعى لتبني الحوسبة السحابية أو GPU',svc:'تمكين من موارد GPU/HPC لدعم تطبيقات الذكاء الاصطناعي',url:'https://ntdp.gov.sa/transform',f:true,nw:false,cl:true},
  {id:6,cat:'ntdp',src:'NTDP',n:'تمكين الشركات التقنية المحلية (Connect)',fin:'دعم 50% من تكلفة إثبات إمكانية التنفيذ (PoC) بحد أقصى 740,000 ريال',t:'الشركات التقنية المحلية متناهية الصغر والصغيرة والمتوسطة',svc:'خلق فرص تعاون بين الجهات الكبيرة والشركات التقنية الصغيرة',url:'https://ntdp.gov.sa/connect',f:true,nw:false,cl:true},
  {id:7,cat:'ntdp',src:'NTDP',n:'تمكين الابتكار والريادة في الذكاء الاصطناعي (AIM)',fin:'دعم رواتب: متناهية 2 موظف، صغيرة 3، متوسطة 5 + تمويل مشاريع AI',t:'الباحثون، المواهب التقنية، الشركات الناشئة في AI',svc:'بنية تحتية R&D، تنمية المواهب، تحديات الصناعة والبيانات',url:'https://ntdp.gov.sa/aim',f:true,nw:false,cl:true},
  {id:8,cat:'ntdp',src:'NTDP + STV',n:'تمويل مبتكر للشركات الناشئة التقنية (STV)',fin:'تمويل عبر صندوق STV بأدوات دين مبتكرة أو استثمارات لمدة تصل إلى 5 سنوات',t:'الشركات الناشئة في مرحلة Series A أو أعلى مع إثبات نمو',svc:'استشارات مالية وإدارية، دعم التوسع للأسواق الجديدة',url:'https://ntdp.gov.sa/venture-dept',f:true,nw:false,cl:false},
  {id:9,cat:'ntdp',src:'NTDP + بنك التنمية الاجتماعية',n:'حلول تمويلية (LendTech)',fin:'قروض ميسرة: متناهية حتى 2M | صغيرة حتى 5M | متوسطة حتى 8.5M ريال',t:'شركات تقنية مسجلة في السعودية، عمر 6 أشهر+',svc:'تسهيلات الوصول لبرامج التمويل الحكومي، آليات سداد ميسرة',url:'https://ntdp.gov.sa/lendtech',f:true,nw:false,cl:false},
  {id:10,cat:'ntdp',src:'NTDP (كفالة)',n:'تمكين نمو التكنولوجيا من خلال ضمان التمويل',fin:'ضمان يغطي حتى 90% من مبلغ القرض — من 100,000 حتى 15,000,000 ريال',t:'الشركات التقنية متناهية الصغر والصغيرة والمتوسطة',svc:'استشارات، تسهيلات للوصول للتمويل عبر بوابة التمويل',url:'https://ntdp.gov.sa/loan-guarantee',f:true,nw:false,cl:false},
  {id:11,cat:'ntdp',src:'NTDP',n:'برنامج Saudi Unicorns',fin:'ربط بصناديق استثمارية وفرص تمويل + دعم إعداد العروض الاستثمارية',t:'الشركات التقنية ذات النمو السريع نحو القيمة المليارية',svc:'إرشاد من خبراء عالميين، مسارات Growth Track و Scaling Track',url:'https://ntdp.gov.sa/saudi-unicorn',f:true,nw:true,cl:false},
  {id:12,cat:'ntdp',src:'NTDP',n:'مسرّعة Attliq (أطلق)',fin:'فرص تمويل استثماري تصل إلى 375,000 ريال + خطاب احتضان',t:'رواد الأعمال في مراحل مبكرة، الشركات الناشئة في مرحلة الفكرة أو MVP',svc:'تعلم افتراضي + Mini Hackathon + تسريع مكثف + Demo Day',url:'https://www.attliq.com/',f:true,nw:true,cl:false},
  {id:13,cat:'industry',src:'وزارة الصناعة والثروة المعدنية',n:'مبادرة حاضنات ومسرعات الأعمال الصناعية (نُمو)',fin:'دعم مالي اختياري للشركات الصناعية الناشئة ضمن برامج المسرّعات',t:'رواد الأعمال والشركات الناشئة والمؤسسات الصغيرة في القطاع الصناعي',svc:'إرشاد من خبراء الصناعة، تدريب، ربط بمستثمرين، مختبرات نماذج أولية',url:'https://www.mim.gov.sa/',f:true,nw:false,cl:false},
  {id:14,cat:'industry',src:'وزارة الصناعة والثروة المعدنية',n:'حاضنة الاستكشاف التعديني (نُثري)',fin:'دعم مالي لأنشطة الاستكشاف وتقليل تكلفة دخول السوق التعديني',t:'شركات تعدين ناشئة سعودية أقل من 250 موظف',svc:'تحليل بيانات جيولوجية، دعم فني، إرشاد من خبراء',url:'https://www.mim.gov.sa/',f:true,nw:false,cl:false},
  {id:15,cat:'industry',src:'وزارة الصناعة / الصندوق الصناعي',n:'مبادرة المصانع الواعدة — التمويل الميسر',fin:'تمويل حتى 50% من تكلفة المشروع + 20% دفعة مقدمة + سماح 24 شهراً',t:'رواد الأعمال الخريجون من حاضنات صناعية',svc:'تسهيل إجراءات دخول القطاع الصناعي وتسريع دراسة الطلبات',url:'https://www.sidf.gov.sa/',f:true,nw:false,cl:false},
  {id:18,cat:'industry',src:'وزارة الصناعة والثروة المعدنية',n:'مبادرة برنامج مصانع المستقبل (Industry 4.0)',fin:'تمكين من حلول تمويلية عبر صندوق التنمية الصناعي بعد التقييم',t:'المصانع القائمة الراغبة بتبني تقنيات الثورة الصناعية الرابعة',svc:'تشخيص الوضع الحالي، خطة تطوير مخصصة لرفع الأتمتة والتحول الرقمي',url:'https://industry.sa/',f:false,nw:false,cl:false},
  {id:20,cat:'smebank',src:'بنك المنشآت الصغيرة والمتوسطة',n:'برنامج التمويل بالوكالة',fin:'تمويلات تشغيلية وتوسيعية مرنة عبر منصات التمويل غير البنكي',t:'المنشآت الصغيرة والمتوسطة، متناهية الصغر، الشركات الناشئة',svc:'إجراءات أبسط وأسرع من التمويل البنكي التقليدي',url:'https://smebank.gov.sa/',f:true,nw:true,cl:false},
  {id:21,cat:'smebank',src:'بنك المنشآت الصغيرة والمتوسطة',n:'برنامج شركات التمويل (NBFI)',fin:'تمويلات تشغيلية وتوسيعية قصيرة ومتوسطة الأجل',t:'المنشآت الصغيرة والمتوسطة ومتناهية الصغر',svc:'بدائل تمويل سريعة لدعم متطلبات رأس المال العامل',url:'https://smebank.gov.sa/',f:true,nw:true,cl:false},
  {id:22,cat:'municipalities',src:'وزارة البلديات والإسكان',n:'مبادرة البناء الحديث',fin:'تمويل مزودي تقنيات البناء الحديث وحوافز للمصانع والمستثمرين',t:'مزودو أساليب البناء الحديث',svc:'تأهيل مزودين، تدريب وورش عمل هندسية، تسهيل شراكات',url:'https://mc.momah.gov.sa/',f:true,nw:false,cl:false},
  {id:23,cat:'modon',src:'مدن + الصندوق الصناعي السعودي',n:'مصنع وقرض صناعي / أرض وقرض صناعي',fin:'تمويل يصل لـ 75% من تكاليف المشروع + سداد حتى 20 سنة',t:'المستثمرون المحليون والدوليون في مشاريع صناعية بالمملكة',svc:'تخصيص مصنع جاهز (700م²+) أو أرض صناعية مع توحيد الإجراءات',url:'https://modon.gov.sa/',f:true,nw:false,cl:false},
  {id:24,cat:'monshaat',src:'منشآت',n:'جدير — خدمة التأهيل المسبق',fin:'خصومات تصل لـ 25% على رسوم التمويل + إعفاء من رسوم إدارية',t:'المنشآت متناهية الصغر والصغيرة والمتوسطة',svc:'شهادة تأهيل إلكترونية معتمدة من سدايا',url:'https://www.monshaat.gov.sa/',f:true,nw:false,cl:false},
  {id:25,cat:'monshaat',src:'منشآت',n:'برنامج دعم المنشآت (مراكز الدعم)',fin:'لا تمويل مباشر — يسهّل الوصول والإحالة لجهات تمويلية مناسبة',t:'رواد الأعمال، أصحاب المنشآت الصغيرة والمتوسطة',svc:'استشارات متخصصة، إرشاد، شبكات أعمال',url:'https://www.monshaat.gov.sa/',f:false,nw:false,cl:false},
  {id:26,cat:'monshaat',src:'منشآت',n:'مسرعات أعمال المشاريع الناشئة الجامعية',fin:'منح مالية للمشاريع الناشئة المشاركة + ربط بمستثمرين',t:'طلاب السنتين الأخيرتين وخريجو آخر سنتين',svc:'ورش عمل، إرشاد، مساحات عمل، خدمات مالية ومحاسبية وقانونية',url:'https://www.monshaat.gov.sa/',f:true,nw:false,cl:false},
  {id:28,cat:'monshaat',src:'منشآت',n:'برنامج مسرعات الأعمال',fin:'منح مالية لدعم المشاريع + وصول للمستثمرين مقابل حصة ملكية',t:'أصحاب الشركات الناشئة وأصحاب نماذج العمل الأولية',svc:'مساحات عمل، استشارات، تدريب مكثف 3-6 أشهر',url:'https://monshaat.gov.sa/ar/acc',f:true,nw:false,cl:false},
  {id:33,cat:'sdb',src:'بنك التنمية الاجتماعية',n:'تمويل التميز',fin:'تمويل حتى 4M ريال، سماح سنتين، مدة تمويل 8 سنوات',t:'المنشآت الصغيرة والمتوسطة في قطاعات مستهدفة',svc:'تمويل توسع ورأس مال عامل ومصاريف رأسمالية',url:'https://www.sdb.gov.sa/',f:true,nw:false,cl:false},
  {id:34,cat:'exports',src:'هيئة تنمية الصادرات السعودية',n:'نظرة عامة على حوافز الصادرات',fin:'منظومة حوافز تصديرية متوافقة مع لوائح WTO',t:'منشآت مسجلة تمارس نشاطاً تصديرياً (6 أشهر نشاط+)',svc:'تشمل جميع الحوافز — الموافقة المسبقة مطلوبة',url:'https://www.saudiexports.gov.sa/',f:true,nw:false,cl:false},
  {id:39,cat:'exports',src:'هيئة تنمية الصادرات السعودية',n:'المشاركة الفردية في المعارض الدولية',fin:'تعويض 65% بحد 400,000 ريال/طلب وأقصى 1,000,000 ريال/سنة',t:'المصدرون السعوديون المسجلون لدى الهيئة',svc:'رسوم إيجار الجناح أو مساحة العرض',url:'https://portal.saudiexports.gov.sa/',f:true,nw:false,cl:false},
  {id:44,cat:'tourism',src:'صندوق التنمية السياحي',n:'برنامج شركات التمويل السياحي',fin:'حتى 15,000,000 ريال عبر شركات تمويل مرخصة من SAMA',t:'المنشآت السياحية متناهية الصغر والصغيرة والمتوسطة',svc:'حلول تمويل مرنة بأسعار تنافسية',url:'https://www.tdf.gov.sa/',f:true,nw:false,cl:false},
  {id:47,cat:'tourism',src:'صندوق التنمية السياحي',n:'برنامج منصات التقنية المالية السياحية',fin:'10,000–2,000,000 ريال (متناهية: حتى 500K | صغيرة: حتى 2M)',t:'المنشآت السياحية متناهية الصغر والصغيرة',svc:'تمويل الفواتير وأوامر الشراء، رأس المال العامل',url:'https://www.tdf.gov.sa/',f:true,nw:false,cl:false},
  {id:49,cat:'universities',src:'جامعة الملك سعود',n:'مركز حاضنات ومسرعات الأعمال (خطى)',fin:'استشارات مالية وإدارية، دراسات جدوى، دعم وصول لجهات تمويل',t:'رواد الأعمال من طلاب جامعة الملك سعود',svc:'مكاتب مجهزة، دعم تقني وذكاء اصطناعي، دعم تسويقي',url:'https://bi.ksu.edu.sa/',f:false,nw:false,cl:false},
  {id:50,cat:'universities',src:'KAUST + SABB',n:'مسرعة تقدم (Taqadam)',fin:'دعم غير مسترد حتى 40,000 دولار + تمويل إضافي 100,000 دولار للمتميزين',t:'رواد الأعمال وأصحاب الشركات الناشئة — دولياً ومحلياً',svc:'إرشاد فردي من خبراء، ورش عمل، شبكات مستثمرين — 6 أشهر',url:'https://taqadam.kaust.edu.sa/',f:true,nw:false,cl:false},
  {id:51,cat:'universities',src:'KAUST',n:'برنامج ScaleX (Soft-Landing عالمي)',fin:'يغطي تكاليف السفر والإقامة لممثلين اثنين + ربط بمستثمرين',t:'شركات ناشئة تقنية دولية في Series B+ للسوق السعودي',svc:'8 أشهر — ورش حضورية وافتراضية، دعم تنظيمي وتجريبي',url:'https://scalex.kaust.edu.sa/',f:false,nw:false,cl:false},
  {id:52,cat:'universities',src:'KFUPM — مركز DTV',n:'Venture Building (KFUPM)',fin:'تمويل يصل لـ 200,000 ريال سعودي للتطوير المبكر',t:'أعضاء هيئة تدريس وطلاب وباحثو KFUPM',svc:'تطوير مشترك للمنتج، استراتيجية GTM، إرشاد تقني وتجاري',url:'https://dtv.sa/programs/venture-building',f:true,nw:true,cl:false},
  {id:55,cat:'nonprofit',src:'MIT Enterprise Forum KSA',n:'مسابقة StartSmart Saudi',fin:'جوائز نقدية إجمالية 355,000 ريال + فرص لقاء مستثمرين',t:'رواد الأعمال والشركات الناشئة وأصحاب مشاريع الأثر الاجتماعي',svc:'تدريب من خبراء، إرشاد، تواصل مع مستثمرين — 3 مسارات',url:'https://www.startsmartsaudi.com/ar',f:true,nw:false,cl:false},
  {id:56,cat:'nonprofit',src:'صندوق الأمير سلطان التنموي',n:'مركز بيادر',fin:'دعم مالي مستمر للمشاريع المتميزة',t:'رواد الأعمال السعوديون في القطاعات التقنية والفنية',svc:'احتضان ودعم تسويقي واستشاري، معمل الأفكار والمواهب',url:'https://psdf.org.sa/',f:true,nw:false,cl:false},
  {id:57,cat:'nonprofit',src:'مسك',n:'مسرعة مسك (12 أسبوع)',fin:'لا تطلب حصة ملكية — Demo Day أمام مستثمرين فعليين في الرياض',t:'الشركات التقنية الناشئة في مراحلها المبكرة داخل أو قرب السوق السعودي',svc:'تدريب في التطوير والتسويق وجمع التمويل، إرشاد فردي',url:'https://hub.misk.org.sa/ar/programs/entrepreneurship/misk-accelerator/',f:false,nw:false,cl:false},
  {id:58,cat:'nonprofit',src:'Community Jameel',n:'Jameel Deeptech Initiative 2025',fin:'جوائز مالية تصل لـ 2,250,000 ريال + منح للفرق الفائزة',t:'الفرق البحثية ورواد الأعمال في العلوم والهندسة والطب',svc:'تدريب متخصص، دعم تقني وتجاري، ربط بمستثمرين',url:'https://deeptech.startsmartsaudi.com/',f:true,nw:true,cl:false},
  {id:59,cat:'private',src:'سابك',n:'مبادرة نساند',fin:'كفالة قروض 80-95% (موافقة 7 أيام)، شراكات بنكية 200M ريال',t:'المستثمرون في قطاع الصناعة المرتبطة بسلاسل قيمة سابك',svc:'بوابة الفرص (انتماء)، تطوير قدرات (مؤهل)، دعم شامل (داعم)',url:'https://www.sabic.com/ar/nusaned',f:true,nw:false,cl:false},
  {id:60,cat:'private',src:'أرامكو السعودية',n:'واعد فنتشرز',fin:'استثمار رأسمالي حتى 20M دولار/شركة من صندوق 500M دولار',t:'الشركات التقنية الناشئة في المملكة',svc:'احتضان 12 شهراً (توجيه، مكاتب، تدريب)، دعم ما بعد الاستثمار',url:'https://www.waed.net/',f:true,nw:false,cl:false},
  {id:61,cat:'private',src:'مجموعة STC',n:'InspireU',fin:'منحة غير مستردة حتى 100,000 ريال + خدمات من شركاء بقيمة 600,000 ريال',t:'رواد الأعمال والشركات الناشئة في مرحلة Pre-Seed/Seed في التقنية الرقمية',svc:'مساحات عمل 24/7، تدريب من خبراء سيليكون فالي، إرشاد — 6 أشهر',url:'https://www.stc.com/content/stcgroupwebsite/sa/en/inspire-u/apply-now.html',f:true,nw:false,cl:false},
  {id:63,cat:'private',src:'فلك (Falak Investment Hub)',n:'مسرّعة فلك (Falak)',fin:'استثمار يصل لـ 5,000,000 ريال في 10 شركات مختارة/دورة',t:'الشركات الناشئة التقنية بعد مرحلة النموذج الأولي والجاهزة للنمو',svc:'4 أشهر: شهر تأهيلي + 3 أشهر تسريع مكثف، ربط بملائكيين',url:'https://flagship.falak.sa/',f:true,nw:false,cl:false},
  {id:65,cat:'private',src:'CyberME Venture Studio',n:'استوديو بناء الشركات الناشئة (CyberME)',fin:'شراكة تأسيسية + تمويل متدرج بحسب مراحل النمو',t:'أصحاب أفكار في الأمن السيبراني، FinTech، AI، اللوجستيات',svc:'بناء المنتج (UX/UI)، ملاءمة السوق، دعم قانوني ومحاسبي',url:'https://www.cyberme.studio/',f:true,nw:true,cl:false},
  {id:66,cat:'private',src:'Qualcomm + أرامكو + STIA',n:'صمم في السعودية بالذكاء الاصطناعي (DISAI)',fin:'منح مشاركة للمشاريع المختارة + تعويضات براءات الاختراع',t:'الشركات الناشئة السعودية في AI وIoT والاتصالات',svc:'إرشاد تقني من خبراء Qualcomm وأرامكو، ورش AI/IoT',url:'https://www.qualcomm.com/company/locations/saudi-arabia/design-in-saudi-arabia',f:true,nw:true,cl:false},
  {id:70,cat:'health',src:'KAIMRC',n:'واحة التقنية الحيوية الطبية — تمويل إثبات المفهوم',fin:'تمويل أنشطة التطوير لمدة 12-24 شهراً على مراحل',t:'الباحثون التابعون لـ KAIMRC مع ملكية فكرية مسجلة',svc:'دعم تقني للنماذج الأولية، توجيه استراتيجي، استشارات IP',url:'https://kaimrc.med.sa/',f:true,nw:false,cl:false},
  {id:71,cat:'health',src:'Saudi Biotechnology Accelerator',n:'Biotechnology Venture Readiness Program 2025',fin:'تجهيز المشروع للاستثمار وربط بمستثمرين في مجال Biotech',t:'المبتكرون في Biotech والأدوية والأجهزة الطبية',svc:'9 أسابيع هجين، 11 جلسة إرشاد فردي 1:1',url:'https://saudi-accelerator.com/',f:false,nw:false,cl:false},
  {id:72,cat:'health',src:'British Council',n:'UK-KSA Research Collaborations Grant',fin:'تمويل يصل لـ £80,000 لمدة سنتين',t:'الجامعات ومراكز الأبحاث — فريق UK + فريق KSA',svc:'دعم تأسيس التعاون البحثي الدولي في Resilient Planet / Healthy People',url:'https://myresearchconnect.com/',f:true,nw:true,cl:false},
  {id:76,cat:'global',src:'HKSTP هونغ كونغ',n:'برنامج الابتكار في هونغ كونغ (HKSTP Global Connect)',fin:'منحة 100,000 دولار هونغ كونغي لتسهيل الانتقال والعمليات',t:'الشركات الناشئة من Seed إلى ما قبل Series A للتوسع في آسيا',svc:'ربط بشركاء محليين، وصول لمستثمرين، ورش TechTalks',url:'https://www.hkstp.org/',f:true,nw:false,cl:false},
  {id:79,cat:'global',src:'TikTok + Blossom Accelerator',n:'برنامج تمكين الشركات الصغيرة والمتوسطة (SME Empowerment)',fin:'تمويل 200,000 دولار بدون حقوق ملكية للفائزين الثلاثة الأوائل',t:'الشركات الناشئة المبكرة في المملكة بقيادة نسائية',svc:'3 أشهر في الرياض — إرشاد، شبكة مؤسسين ومستثمرين',url:'https://blossom.sa/tiktok/',f:true,nw:false,cl:false},
  {id:80,cat:'global',src:'Microsoft',n:'Microsoft for Startups Founders Hub',fin:'أرصدة Azure حتى 150,000 دولار + GitHub Enterprise + أدوات AI',t:'الشركات الناشئة في المراحل المبكرة',svc:'إرشاد تقني من خبراء Microsoft، دعم معماري AI',url:'https://portal.startups.microsoft.com/signup',f:true,nw:true,cl:false},
  {id:81,cat:'global',src:'Amazon Web Services',n:'AWS Activate',fin:'Founders: $1K–$5K | Portfolio: $10K–$100K | Gen AI 2026: $200K–$300K',t:'الشركات الناشئة في جميع المراحل مع تركيز على Generative AI',svc:'أرصدة AWS التشغيلية، Amazon Bedrock، إرشاد تقني ودعم معماري',url:'https://aws.amazon.com/startups',f:true,nw:true,cl:false}
];

// ── HTML ESCAPE ───────────────────────────────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── GOOGLE SHEETS FETCH ───────────────────────────────────────────
function sheetUrl(tabName) {
  return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID
    + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(tabName)
    + '&t=' + Date.now();
}

async function fetchSheet(tabName) {
  try {
    var res = await fetch(sheetUrl(tabName), { cache: 'no-store' });
    if (!res.ok) { console.warn('[KACST] Tab "' + tabName + '" HTTP ' + res.status); return null; }
    var raw = await res.text();
    var first = raw.indexOf('{'), last = raw.lastIndexOf('}');
    if (first === -1 || last <= first) { console.warn('[KACST] Tab "' + tabName + '" — no JSON'); return null; }
    var data = JSON.parse(raw.substring(first, last + 1));
    if (!data.table || !data.table.rows || !data.table.rows.length) {
      console.warn('[KACST] Tab "' + tabName + '" — empty (check tab name & public sharing)');
      return null;
    }
    var cols = (data.table.cols || []).map(function(c){ return (c.label||c.id||'').toLowerCase().trim(); });
    console.log('[KACST] "' + tabName + '" — ' + data.table.rows.length + ' rows | [' + cols.join(', ') + ']');
    return data.table.rows
      .filter(function(r){ return r.c && r.c.some(function(c){ return c && c.v !== null && c.v !== ''; }); })
      .map(function(r){
        var o = {};
        (r.c||[]).forEach(function(c,i){ if(cols[i]) o[cols[i]] = (c && c.v !== null) ? c.v : ''; });
        return o;
      });
  } catch(e) { console.error('[KACST] Tab "' + tabName + '":', e); return null; }
}

async function fetchAllData() {
  var res = await Promise.all([
    fetchSheet(TAB.stats), fetchSheet(TAB.about),
    fetchSheet(TAB.programs), fetchSheet(TAB.settings)
  ]);
  console.table({
    stats: res[0] ? res[0].length + ' rows' : 'failed',
    about: res[1] ? res[1].length + ' rows' : 'failed',
    programs: res[2] ? res[2].length + ' rows' : 'failed',
    settings: res[3] ? res[3].length + ' rows' : 'failed'
  });
  return { statsRows: res[0], aboutRows: res[1], programRows: res[2], settingsRows: res[3] };
}

// ── RENDER STATS ──────────────────────────────────────────────────
// Sheet columns: label = big number | value = Arabic label text
function renderStats(rows) {
  if (!rows || !rows.length) return;
  rows.slice(0, 4).forEach(function(r, i) {
    var keys = Object.keys(r);
    var num = r.label !== undefined && r.label !== '' ? r.label : (r[keys[0]] || '');
    var lbl = r.value !== undefined && r.value !== '' ? r.value : (r[keys[1]] || '');
    var nEl = document.getElementById('stat-n' + (i+1));
    var lEl = document.getElementById('stat-l' + (i+1));
    if (nEl && num !== '') nEl.innerHTML = String(num);
    if (lEl && lbl !== '') lEl.innerHTML = String(lbl);
  });
}

// ── RENDER ABOUT ──────────────────────────────────────────────────
// Sheet columns: key | value | value2
// Supported keys: nabtha, obj_1…obj_6, kpi_1_label, kpi_1_current,
//   kpi_1_target, header_title, header_dept, header_email, header_update
function renderAbout(rows) {
  if (!rows || !rows.length) return;
  var cfg = {};
  rows.forEach(function(r){ if (r.key) cfg[String(r.key).toLowerCase().trim()] = r; });
  function v(k)  { return cfg[k] ? String(cfg[k].value  || '') : ''; }
  function v2(k) { return cfg[k] ? String(cfg[k].value2 || '') : ''; }

  // نبذة
  var nabtha = v('nabtha') || v('description') || v('about');
  if (nabtha) {
    var nb = document.getElementById('nabtha-box');
    if (nb) {
      var ps = nabtha.split(/\n+/).filter(Boolean);
      nb.innerHTML = ps.length ? ps.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('') : '<p>' + esc(nabtha) + '</p>';
    }
  }

  // أهداف
  var og = document.getElementById('objectives-grid');
  var objCss = ['c1','c2','c3','c4','c5','c6'];
  if (og) {
    var objs = [];
    for (var oi = 1; oi <= 6; oi++) {
      var ot = v('obj_' + oi) || v('objective_' + oi) || v('goal_' + oi);
      if (ot) objs.push({ n: oi, t: ot, css: objCss[oi-1] });
    }
    if (objs.length) {
      og.innerHTML = objs.map(function(o){
        return '<div class="obj-card"><div class="obj-num ' + o.css + '">' + o.n + '</div>'
             + '<div class="obj-text">' + esc(o.t) + '</div></div>';
      }).join('');
    }
  }

  // مؤشرات الأداء (3 فقط)
  var kw = document.getElementById('kpi-indicators');
  var kbadge = ['b1','b2','b3'];
  var ktgt   = ['target-b1','target-b2','target-b3'];
  if (kw) {
    var krows = [];
    for (var ki = 1; ki <= 3; ki++) {
      var klbl = v('kpi_' + ki + '_label')   || v('ind_' + ki + '_label');
      var kcur = v('kpi_' + ki + '_current') || v('ind_' + ki + '_current');
      var ktval = v('kpi_' + ki + '_target') || v('ind_' + ki + '_target')
               || v2('kpi_' + ki + '_current');
      if (klbl) krows.push({ n: ki, lbl: klbl, cur: kcur || '—', tgt: ktval || '—' });
    }
    if (krows.length) {
      kw.innerHTML = krows.map(function(k){
        var pad = k.n < 10 ? '0' + k.n : String(k.n);
        return '<div class="kpi-card">'
          + '<div class="kpi-badge ' + kbadge[k.n-1] + '">' + pad + '</div>'
          + '<div class="kpi-lbl">' + esc(k.lbl) + '</div>'
          + '<div class="kpi-vals">'
          + '<div class="val-box current"><div class="vn">' + esc(k.cur) + '</div><div class="vl">الحالي</div></div>'
          + '<div class="val-box ' + ktgt[k.n-1] + '"><div class="vn">' + esc(k.tgt) + '</div><div class="vl">المستهدف</div></div>'
          + '</div></div>';
      }).join('');
    }
  }

  // Header overrides
  var ht = v('header_title') || v('initiative_name');
  if (ht) { var hte = document.getElementById('h-initiative'); if (hte) hte.textContent = ht; }
  var hd = v('header_dept'), he = v('header_email');
  if (hd) {
    var hde = document.getElementById('h-dept');
    if (hde) hde.innerHTML = esc(hd)
      + (he ? ' · <a href="mailto:' + esc(he) + '" style="color:rgba(255,255,255,.6);text-decoration:none;">' + esc(he) + '</a>' : '');
  }
  var hu = v('header_update') || v('last_update');
  if (hu) { var hme = document.getElementById('h-meta'); if (hme) hme.textContent = 'آخر تحديث: ' + hu; }
}

// ── RENDER PROGRAMS ───────────────────────────────────────────────
function parsePrograms(rows) {
  function toBool(x) {
    if (x === true || x === 1) return true;
    if (x === false || x === 0) return false;
    return ['true','1','yes'].indexOf(String(x).trim().toLowerCase()) !== -1;
  }
  return rows.map(function(r){
    return {
      id:  +(r.id  || 0),
      cat: String(r.cat  || r.category      || '').trim(),
      src: String(r.src  || r.source || r.entity || '').trim(),
      n:   String(r.name || r.n || r.program_name  || '').trim(),
      fin: String(r.financial_support || r.fin || r.funding || '').trim(),
      t:   String(r.target || r.t || r.target_audience || '').trim(),
      svc: String(r.services || r.svc || '').trim(),
      url: String(r.url  || r.link || '#').trim(),
      f:   toBool(r.hasfinancial || r.has_financial || r.f),
      nw:  toBool(r.isnew        || r.is_new        || r.nw),
      cl:  toBool(r.isclosed     || r.is_closed     || r.cl)
    };
  }).filter(function(p){ return p.id > 0 && p.cat; });
}

function renderPrograms(rows) {
  if (!rows || !rows.length) return;
  var parsed = parsePrograms(rows);
  if (!parsed.length) return;
  PROGRAMS = parsed;
  updateBadges();
  // Re-render visible category if one is open
  var wrap = document.getElementById('prog-wrap');
  if (wrap && wrap.style.display === 'block') {
    var as = document.querySelector('.sub-btn.active');
    var ae = document.querySelector('.entity-card.active:not(#gov-card)');
    if (as) {
      var m1 = as.getAttribute('onclick').match(/'([^']+)'/);
      if (m1) showProg(m1[1], as.querySelector('.sb-name').textContent);
    } else if (ae) {
      var m2 = ae.getAttribute('onclick').match(/'([^']+)'/);
      if (m2) showProg(m2[1], ae.querySelector('.e-name').textContent);
    }
  }
}

// ── APPLY THEME ───────────────────────────────────────────────────
// Sheet columns: key | value
// Supported keys: primary_color, secondary_color, accent_color,
//   background_color, text_color, card_radius, font_family, shadow, logo_url
function applyTheme(rows) {
  if (!rows || !rows.length) return;
  var cfg = {};
  rows.forEach(function(r){ if (r.key) cfg[String(r.key).toLowerCase().trim()] = String(r.value || ''); });
  var root = document.documentElement;
  function sv(cssVar, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (cfg[keys[i]]) { root.style.setProperty(cssVar, cfg[keys[i]]); return; }
    }
  }
  sv('--primary',     ['primary_color',    'primary']);
  sv('--secondary',   ['secondary_color',  'secondary']);
  sv('--accent',      ['accent_color',     'accent']);
  sv('--bg',          ['background_color', 'bg_color']);
  sv('--text',        ['text_color',       'text']);
  sv('--card-radius', ['card_radius',      'border_radius', 'radius']);
  sv('--font',        ['font_family',      'font']);
  sv('--shadow',      ['shadow',           'box_shadow']);
  if (cfg.logo_url) {
    var img = document.getElementById('kacst-logo');
    if (img) img.src = cfg.logo_url;
  }
}

// ── BADGE COUNTS ──────────────────────────────────────────────────
function updateBadges() {
  var cats = { universities:'badge-universities', nonprofit:'badge-nonprofit',
               private:'badge-private', health:'badge-health', global:'badge-global' };
  Object.keys(cats).forEach(function(cat){
    var el = document.getElementById(cats[cat]);
    var n  = PROGRAMS.filter(function(p){ return p.cat === cat; }).length;
    if (el) el.textContent = n + ' برامج';
  });
  var govCats = ['ntdp','industry','smebank','municipalities','modon','monshaat','exports','tourism','sdb'];
  var govN = new Set(PROGRAMS.filter(function(p){ return govCats.indexOf(p.cat) !== -1; }).map(function(p){ return p.cat; })).size;
  var gb = document.getElementById('gov-badge');
  if (gb) gb.textContent = govN + ' جهات';
}

// ── STATUS BAR ────────────────────────────────────────────────────
function setStatus(type, msg) {
  var dot = document.getElementById('status-dot');
  var txt = document.getElementById('status-msg');
  if (dot) { dot.className = 'status-dot'; if (type) dot.classList.add(type); }
  if (txt) txt.textContent = msg;
}

// ── MAIN REFRESH ─────────────────────────────────────────────────
async function refreshAll() {
  var btn = document.getElementById('btn-update');
  var ico = document.getElementById('btn-icon');
  var txt = document.getElementById('btn-text');
  if (btn) btn.classList.add('loading');
  if (ico) ico.innerHTML = '<span class="spin">↻</span>';
  if (txt) txt.textContent = 'جارٍ التحديث…';
  setStatus('', 'جارٍ الاتصال بـ Google Sheets…');
  try {
    var d = await fetchAllData();
    var live = 0;
    if (d.settingsRows && d.settingsRows.length) { applyTheme(d.settingsRows);    live++; }
    if (d.statsRows    && d.statsRows.length)    { renderStats(d.statsRows);      live++; }
    if (d.aboutRows    && d.aboutRows.length)    { renderAbout(d.aboutRows);      live++; }
    if (d.programRows  && d.programRows.length)  { renderPrograms(d.programRows); live++; }
    var now = new Date().toLocaleString('ar-SA', { hour:'2-digit', minute:'2-digit' });
    if (live > 0) {
      setStatus('live', 'بيانات حية — ' + live + ' من 4 جداول — ' + now);
      var hm = document.getElementById('h-meta');
      if (hm && (hm.textContent.indexOf('جارٍ') !== -1 || hm.textContent === ''))
        hm.textContent = 'آخر تحديث: ' + new Date().toLocaleDateString('ar-SA');
    } else {
      setStatus('fallback', 'تعذّر الاتصال بالشيت — يتم عرض البيانات الاحتياطية');
    }
  } catch (e) {
    console.error('[KACST]', e);
    setStatus('error', 'خطأ: ' + e.message);
  } finally {
    if (btn) btn.classList.remove('loading');
    if (ico) ico.textContent = '↻';
    if (txt) txt.textContent = 'تحديث البيانات';
  }
}

// ── TABS ──────────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b){   b.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tab-btn-' + tab).classList.add('active');
}

// ── ENTITY NAVIGATION ─────────────────────────────────────────────
function toggleGov(el) {
  govOpen = !govOpen;
  document.getElementById('gov-sub').classList.toggle('show', govOpen);
  el.classList.toggle('gov-open', govOpen);
  if (!govOpen) {
    document.querySelectorAll('.sub-btn').forEach(function(b){ b.classList.remove('active'); });
    hideProg();
  }
}
function selectGov(cat, label, btn) {
  document.querySelectorAll('.sub-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  showProg(cat, label);
}
function selectCat(cat, label, el) {
  govOpen = false;
  document.getElementById('gov-sub').classList.remove('show');
  document.getElementById('gov-card').classList.remove('gov-open');
  document.querySelectorAll('.sub-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.entity-card').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  showProg(cat, label);
}

// ── PROGRAMS DISPLAY ──────────────────────────────────────────────
function showProg(cat, label) {
  var list = PROGRAMS.filter(function(p){ return p.cat === cat; });
  closeDet();
  var wrap = document.getElementById('prog-wrap');
  wrap.style.display = 'block';
  document.getElementById('prog-title').textContent = 'برامج ' + label;
  document.getElementById('prog-count').textContent = list.length + ' برنامج';
  document.getElementById('progs').innerHTML = list.map(function(p){
    var cls = p.cl ? ' cl' : p.nw ? ' nw' : '';
    return '<div class="pc' + cls + '">'
      + '<div class="pc-stripe"></div>'
      + '<div class="pc-top">'
      + '<div class="psrc">' + esc(p.src) + '</div>'
      + '<a class="plink" href="' + esc(p.url) + '" target="_blank" rel="noopener">زيارة الموقع ↗</a>'
      + '</div>'
      + '<div class="pname" onclick="showDet(' + p.id + ')">' + esc(p.n) + '</div>'
      + '<div class="ptags">'
      + (p.cl ? '<span class="tag tc">مغلق</span>'       : '')
      + (p.nw ? '<span class="tag tnw">جديد</span>'      : '')
      + (p.f  ? '<span class="tag tf">دعم مالي</span>'   : '<span class="tag tn">خدمات</span>')
      + '</div></div>';
  }).join('');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function hideProg() {
  document.getElementById('prog-wrap').style.display = 'none';
  closeDet();
}
function showDet(id) {
  var p = PROGRAMS.find(function(x){ return x.id === id; });
  if (!p) return;
  document.getElementById('d-name').textContent = p.n + (p.cl ? ' — مغلق حالياً' : '');
  var dl = document.getElementById('d-link');
  dl.href = /^https?:\/\//i.test(p.url) ? p.url : '#';
  document.getElementById('d-src').textContent = p.src;
  document.getElementById('d-tgt').textContent = p.t;
  document.getElementById('d-fin').textContent = p.fin;
  document.getElementById('d-svc').textContent = p.svc;
  document.getElementById('det').classList.add('show');
  document.getElementById('det').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function closeDet() {
  document.getElementById('det').classList.remove('show');
}

// ── INIT ──────────────────────────────────────────────────────────
(async function init() {
  PROGRAMS = P_FALLBACK.slice();  // show fallback data instantly
  updateBadges();
  setStatus('', 'جارٍ التحميل…');
  await refreshAll();             // then fetch live data from Google Sheets
})();
