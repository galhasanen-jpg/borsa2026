export interface Stock {
  symbol: string;
  name: string;
  nameEn: string;
  sector: string;
  sectorEn: string;
}

export const egxStocks: Stock[] = [
  // البنوك
  { symbol: 'COMI.CA', name: 'البنك التجاري الدولي', nameEn: 'CIB', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'QNBE.CA', name: 'بنك قطر الوطني', nameEn: 'QNB Egypt', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'HDBK.CA', name: 'بنك التعمير والإسكان', nameEn: 'Housing Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'CIEB.CA', name: 'كريدي أجريكول', nameEn: 'Credit Agricole', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'ADIB.CA', name: 'أبوظبي الإسلامي', nameEn: 'ADIB Egypt', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'FAIT.CA', name: 'فيصل الإسلامي', nameEn: 'Faisal Islamic Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'CANA.CA', name: 'بنك قناة السويس', nameEn: 'Canal Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'ALEXB.CA', name: 'بنك الإسكندرية', nameEn: 'Bank of Alexandria', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'ABBA.CA', name: 'البركة بنك', nameEn: 'Al Baraka Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'ATQA.CA', name: 'التوفيق للتأجير', nameEn: 'Al Tawfeek Leasing', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'BNKE.CA', name: 'بنك مصر', nameEn: 'Bank Misr', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'ENBA.CA', name: 'البنك الأهلي المصري', nameEn: 'National Bank of Egypt', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'MIDB.CA', name: 'بنك الاستثمار المتوسط', nameEn: 'MID Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'MFBD.CA', name: 'بنك التمويل المصري', nameEn: 'Egyptian Finance Bank', sector: 'البنوك', sectorEn: 'Banks' },

  // العقارات
  { symbol: 'TMGH.CA', name: 'طلعت مصطفى', nameEn: 'TMG', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'PHDC.CA', name: 'بالم هيلز', nameEn: 'Palm Hills', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'MNHD.CA', name: 'مدينة نصر للإسكان', nameEn: 'MNHD', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'EMFD.CA', name: 'إعمار مصر', nameEn: 'Emaar Egypt', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'OCDI.CA', name: 'سوديك', nameEn: 'SODIC', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'ORHD.CA', name: 'أوراسكوم للتطوير', nameEn: 'Orascom Development', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'EHDR.CA', name: 'مصر الجديدة للإسكان', nameEn: 'Heliopolis Housing', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'ISWP.CA', name: 'مصر إيطاليا للعقارات', nameEn: 'Egypt Italy RE', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'AMER.CA', name: 'أمر جروب', nameEn: 'Amer Group', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'HELI.CA', name: 'هيليوبوليس للإسكان', nameEn: 'Heliopolis Housing', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'MPCI.CA', name: 'مصر فارس للمقاولات', nameEn: 'Misr Fares', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'ISMAILIA.CA', name: 'الإسماعيلية للاستثمار', nameEn: 'Ismailia Investment', sector: 'العقارات', sectorEn: 'Real Estate' },

  // الاتصالات
  { symbol: 'ETEL.CA', name: 'المصرية للاتصالات', nameEn: 'Telecom Egypt', sector: 'الاتصالات', sectorEn: 'Telecom' },
  { symbol: 'VFCO.CA', name: 'فودافون مصر', nameEn: 'Vodafone Egypt', sector: 'الاتصالات', sectorEn: 'Telecom' },

  // التكنولوجيا المالية
  { symbol: 'EFIH.CA', name: 'إي فاينانس', nameEn: 'E-Finance', sector: 'التكنولوجيا المالية', sectorEn: 'Fintech' },
  { symbol: 'FWRY.CA', name: 'فوري', nameEn: 'Fawry', sector: 'التكنولوجيا المالية', sectorEn: 'Fintech' },

  // التكنولوجيا
  { symbol: 'RAYA.CA', name: 'راية القابضة', nameEn: 'Raya Holding', sector: 'التكنولوجيا', sectorEn: 'Technology' },
  { symbol: 'ITHS.CA', name: 'آي تيك للبرمجيات', nameEn: 'ITech', sector: 'التكنولوجيا', sectorEn: 'Technology' },
  { symbol: 'ORWE.CA', name: 'أوراسكوم للإعلام', nameEn: 'Orascom Media', sector: 'التكنولوجيا', sectorEn: 'Technology' },

  // الصناعة والمعادن
  { symbol: 'SWDY.CA', name: 'السويدي إلكتريك', nameEn: 'Swedy Electric', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'IRON.CA', name: 'الحديد والصلب', nameEn: 'Iron & Steel', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'EGAL.CA', name: 'مصر للألمنيوم', nameEn: 'Egypt Aluminium', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ESRS.CA', name: 'عز للصلب', nameEn: 'Ezz Steel', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'SKPC.CA', name: 'سيدبك', nameEn: 'Sidi Kerir', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'SINAI.CA', name: 'اسمنت سيناء', nameEn: 'Sinai Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ARCC.CA', name: 'اسمنت العربية', nameEn: 'Arabian Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ACGC.CA', name: 'اسمنت أكروبولي', nameEn: 'Acropolis Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ELCO.CA', name: 'إيليكو للصناعات', nameEn: 'Elco Industries', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'SWVL.CA', name: 'سويفل', nameEn: 'Swvl', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'UNIP.CA', name: 'يونيباك للورق', nameEn: 'Unipack', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ECAP.CA', name: 'المصرية للتعبئة', nameEn: 'Egypt Packaging', sector: 'الصناعة', sectorEn: 'Industry' },

  // الإنشاء والمقاولات
  { symbol: 'ORAS.CA', name: 'أوراسكوم للإنشاء', nameEn: 'Orascom Construction', sector: 'الإنشاء', sectorEn: 'Construction' },
  { symbol: 'ACRO.CA', name: 'أكرو مصر', nameEn: 'Acrow Misr', sector: 'الإنشاء', sectorEn: 'Construction' },
  { symbol: 'EGAS.CA', name: 'غاز مصر', nameEn: 'Gas Egypt', sector: 'الإنشاء', sectorEn: 'Construction' },
  { symbol: 'GTHE.CA', name: 'جاتكو', nameEn: 'GATCO', sector: 'الإنشاء', sectorEn: 'Construction' },

  // الأسمدة والكيماويات
  { symbol: 'MFPC.CA', name: 'موبكو', nameEn: 'MOPCO', sector: 'الأسمدة', sectorEn: 'Fertilizers' },
  { symbol: 'ABUK.CA', name: 'أبو قير للأسمدة', nameEn: 'Abu Qir Fertilizers', sector: 'الأسمدة', sectorEn: 'Fertilizers' },
  { symbol: 'EFIC.CA', name: 'مصر للأسمدة', nameEn: 'Egypt Fertilizers', sector: 'الأسمدة', sectorEn: 'Fertilizers' },
  { symbol: 'KIMA.CA', name: 'كيما للأسمدة', nameEn: 'Kima', sector: 'الأسمدة', sectorEn: 'Fertilizers' },

  // البترول والطاقة
  { symbol: 'AMOC.CA', name: 'الإسكندرية لتكرير البترول', nameEn: 'AMOC', sector: 'البترول', sectorEn: 'Oil & Gas' },
  { symbol: 'SCOM.CA', name: 'سيدي كرير للبتروكيماويات', nameEn: 'Sidi Kerir Petrochem', sector: 'البترول', sectorEn: 'Oil & Gas' },
  { symbol: 'EGAL.CA', name: 'إيجاز للبترول', nameEn: 'Egaz', sector: 'البترول', sectorEn: 'Oil & Gas' },

  // الغذاء والشراب
  { symbol: 'JUFO.CA', name: 'جهينة', nameEn: 'Juhayna', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'EFID.CA', name: 'إيديتا', nameEn: 'Edita', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'DOMTY.CA', name: 'دومتي', nameEn: 'Domty', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'POUL.CA', name: 'القاهرة للدواجن', nameEn: 'Cairo Poultry', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'SUGR.CA', name: 'مصر للسكر', nameEn: 'Egypt Sugar', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'CAIFL.CA', name: 'القاهرة للدقيق', nameEn: 'Cairo Flour', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'ALEXFL.CA', name: 'الإسكندرية للدقيق', nameEn: 'Alexandria Flour', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'AIVC.CA', name: 'أجواء للصناعات الغذائية', nameEn: 'Ajwa Foods', sector: 'الغذاء', sectorEn: 'Food & Beverage' },

  // التبغ
  { symbol: 'EAST.CA', name: 'الشرقية للدخان', nameEn: 'Eastern Tobacco', sector: 'التبغ', sectorEn: 'Tobacco' },

  // الموانئ والنقل
  { symbol: 'ALCN.CA', name: 'الإسكندرية للحاويات', nameEn: 'Alexandria Containers', sector: 'الموانئ', sectorEn: 'Ports' },
  { symbol: 'EGTS.CA', name: 'مصر للنقل', nameEn: 'Egypt Transport', sector: 'الموانئ', sectorEn: 'Ports' },
  { symbol: 'DPAE.CA', name: 'موانئ أبوظبي مصر', nameEn: 'DP World Egypt', sector: 'الموانئ', sectorEn: 'Ports' },

  // الخدمات المالية
  { symbol: 'HRHO.CA', name: 'EFG هيرميس', nameEn: 'EFG Hermes', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'GBCO.CA', name: 'GB Corp', nameEn: 'GB Corp', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'CIBD.CA', name: 'سي آي كابيتال', nameEn: 'CI Capital', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'BSEC.CA', name: 'بلتون المالية', nameEn: 'Beltone Financial', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'CORPLEASE.CA', name: 'كوربليز', nameEn: 'Corplease', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'NSGB.CA', name: 'الشركة المصرية للتمويل', nameEn: 'Egyptian Finance', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },

  // التأمين
  { symbol: 'AICP.CA', name: 'مصر للتأمين', nameEn: 'Misr Insurance', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'MOHE.CA', name: 'ميثاق للتأمين', nameEn: 'Methaq Insurance', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'GENI.CA', name: 'المصرية العامة للتأمين', nameEn: 'General Insurance Egypt', sector: 'التأمين', sectorEn: 'Insurance' },

  // الدواء والرعاية الصحية
  { symbol: 'ISPH.CA', name: 'سينوفارم مصر', nameEn: 'Sinopharm Egypt', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'PHAR.CA', name: 'المصرية للأدوية', nameEn: 'Egyptian Pharma', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'ELAB.CA', name: 'مصر للمستحضرات', nameEn: 'Egy Lab', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'ADPH.CA', name: 'أدفانسد للأدوية', nameEn: 'Advanced Pharma', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'MHPC.CA', name: 'ممفيس للأدوية', nameEn: 'Memphis Pharma', sector: 'الدواء', sectorEn: 'Pharma' },

  // السياحة والفنادق
  { symbol: 'EGCH.CA', name: 'مصر للفنادق', nameEn: 'Egypt Hotels', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'EGTS.CA', name: 'المصرية للسياحة', nameEn: 'Egyptian Tourism', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'PIOH.CA', name: 'بيراميدز للفنادق', nameEn: 'Pyramids Hotels', sector: 'السياحة', sectorEn: 'Tourism' },

  // الطاقة المتجددة
  { symbol: 'SWDY.CA', name: 'السويدي للطاقة', nameEn: 'Swedy Energy', sector: 'الطاقة', sectorEn: 'Energy' },
  { symbol: 'INFA.CA', name: 'إنفرا للطاقة', nameEn: 'Infra Energy', sector: 'الطاقة', sectorEn: 'Energy' },

  // التعليم
  { symbol: 'CIRA.CA', name: 'سيرا للتعليم', nameEn: 'CIRA Education', sector: 'التعليم', sectorEn: 'Education' },
  { symbol: 'ESGE.CA', name: 'المصرية للتعليم', nameEn: 'Egyptian Education', sector: 'التعليم', sectorEn: 'Education' },

  // الملابس والنسيج
  { symbol: 'SPIN.CA', name: 'مصر للغزل والنسيج', nameEn: 'Egypt Spinning', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'INMA.CA', name: 'إنما للنسيج', nameEn: 'Inma Textiles', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'ALEX.CA', name: 'الإسكندرية للأقطان', nameEn: 'Alexandria Cotton', sector: 'النسيج', sectorEn: 'Textiles' },
// المزيد من البنوك
  { symbol: 'MASH.CA', name: 'مشرق بنك', nameEn: 'Mashreq Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'EDBE.CA', name: 'بنك التنمية الصناعية', nameEn: 'Industrial Development Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'UBAI.CA', name: 'بنك الاتحاد الإماراتي', nameEn: 'Union National Bank', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'HSBC.CA', name: 'بنك HSBC مصر', nameEn: 'HSBC Egypt', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'BLOM.CA', name: 'بنك بلوم مصر', nameEn: 'Blom Bank Egypt', sector: 'البنوك', sectorEn: 'Banks' },
  { symbol: 'AIBK.CA', name: 'البنك العربي الدولي', nameEn: 'Arab International Bank', sector: 'البنوك', sectorEn: 'Banks' },

  // المزيد من العقارات
  { symbol: 'TORA.CA', name: 'توراس للعقارات', nameEn: 'Toras Real Estate', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'MENA.CA', name: 'مينا للتطوير', nameEn: 'Mena Development', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'ROXI.CA', name: 'روكسي للعقارات', nameEn: 'Roxi Real Estate', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'ELKA.CA', name: 'القاهرة للإسكان', nameEn: 'Cairo Housing', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'GIZA.CA', name: 'الجيزة للتطوير', nameEn: 'Giza Development', sector: 'العقارات', sectorEn: 'Real Estate' },

  // المزيد من الصناعة
  { symbol: 'EIPD.CA', name: 'المصرية للصناعات', nameEn: 'Egyptian Industries', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'PSIN.CA', name: 'بيراميدز للصناعة', nameEn: 'Pyramids Industry', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ALEX.CA', name: 'الإسكندرية للصناعة', nameEn: 'Alexandria Industry', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ECMS.CA', name: 'مصر للإسمنت', nameEn: 'Egypt Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'SUEZ.CA', name: 'اسمنت السويس', nameEn: 'Suez Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'PORA.CA', name: 'بورتلاند للإسمنت', nameEn: 'Portland Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'BENI.CA', name: 'اسمنت بني سويف', nameEn: 'Beni Suef Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'SOUTH.CA', name: 'اسمنت جنوب الوادي', nameEn: 'South Valley Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'TORT.CA', name: 'اسمنت طره', nameEn: 'Torah Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'NILE.CA', name: 'اسمنت النيل', nameEn: 'Nile Cement', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'EGCO.CA', name: 'المصرية للزجاج', nameEn: 'Egyptian Glass', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'GLAS.CA', name: 'العربية للزجاج', nameEn: 'Arabian Glass', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'PLAS.CA', name: 'مصر للبلاستيك', nameEn: 'Egypt Plastic', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'EGPL.CA', name: 'مصر للكيماويات', nameEn: 'Egypt Chemicals', sector: 'الصناعة', sectorEn: 'Industry' },

  // المزيد من الغذاء
  { symbol: 'NFGC.CA', name: 'نبيلة للغذاء', nameEn: 'Nabilah Food', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'MINC.CA', name: 'مينا للصناعات الغذائية', nameEn: 'Mena Food', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'GGCC.CA', name: 'الحبوب والغلال', nameEn: 'Grains & Cereals', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'MSFR.CA', name: 'مصر للمخبوزات', nameEn: 'Egypt Bakeries', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'COLA.CA', name: 'مصر للمشروبات', nameEn: 'Egypt Beverages', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'WTKN.CA', name: 'ووتكن للمشروبات', nameEn: 'Wataniya Beverages', sector: 'الغذاء', sectorEn: 'Food & Beverage' },

  // المزيد من الدواء
  { symbol: 'EGPI.CA', name: 'المصرية للصناعات الدوائية', nameEn: 'Egyptian Pharma Industries', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'MEDC.CA', name: 'ميدكو للأدوية', nameEn: 'Medco Pharma', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'MINA.CA', name: 'مينا للأدوية', nameEn: 'Mina Pharma', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'CCHE.CA', name: 'القاهرة للكيماويات', nameEn: 'Cairo Chemicals', sector: 'الدواء', sectorEn: 'Pharma' },

  // المزيد من الخدمات المالية
  { symbol: 'FIBE.CA', name: 'فايب للتمويل', nameEn: 'Fibe Finance', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'NSGB.CA', name: 'الشركة المصرية للتمويل', nameEn: 'Egyptian Finance', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'CORPLEASE.CA', name: 'كوربليز', nameEn: 'Corplease', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'EACF.CA', name: 'المصرية لتمويل السيارات', nameEn: 'Egypt Auto Finance', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'MFCI.CA', name: 'المصرية للتمويل الاستهلاكي', nameEn: 'Misr Consumer Finance', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },

  // المزيد من التأمين
  { symbol: 'GENI.CA', name: 'المصرية العامة للتأمين', nameEn: 'General Insurance Egypt', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'EGIC.CA', name: 'المجموعة المصرية للتأمين', nameEn: 'Egyptian Insurance Group', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'TAKI.CA', name: 'تكافل مصر', nameEn: 'Takaful Egypt', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'WAFA.CA', name: 'وفاء للتأمين', nameEn: 'Wafa Insurance', sector: 'التأمين', sectorEn: 'Insurance' },

  // المزيد من السياحة
  { symbol: 'EGTS.CA', name: 'المصرية للسياحة', nameEn: 'Egyptian Tourism', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'SHRM.CA', name: 'شرم الشيخ للسياحة', nameEn: 'Sharm Tourism', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'HURG.CA', name: 'الغردقة للسياحة', nameEn: 'Hurghada Tourism', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'NILE2.CA', name: 'النيل للسياحة', nameEn: 'Nile Tourism', sector: 'السياحة', sectorEn: 'Tourism' },

  // المزيد من التعليم
  { symbol: 'ESGE.CA', name: 'المصرية للتعليم', nameEn: 'Egyptian Education', sector: 'التعليم', sectorEn: 'Education' },
  { symbol: 'NCLE.CA', name: 'نيل للتعليم', nameEn: 'Nile Education', sector: 'التعليم', sectorEn: 'Education' },

  // النسيج والملابس
  { symbol: 'SPIN.CA', name: 'مصر للغزل والنسيج', nameEn: 'Egypt Spinning', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'INMA.CA', name: 'إنما للنسيج', nameEn: 'Inma Textiles', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'ALEXC.CA', name: 'الإسكندرية للأقطان', nameEn: 'Alexandria Cotton', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'NILE3.CA', name: 'النيل للغزل', nameEn: 'Nile Spinning', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'DELTA.CA', name: 'دلتا للنسيج', nameEn: 'Delta Textiles', sector: 'النسيج', sectorEn: 'Textiles' },

  // الطاقة المتجددة
  { symbol: 'INFA.CA', name: 'إنفرا للطاقة', nameEn: 'Infra Energy', sector: 'الطاقة', sectorEn: 'Energy' },
  { symbol: 'NREA.CA', name: 'الطاقة المتجددة', nameEn: 'Renewable Energy', sector: 'الطاقة', sectorEn: 'Energy' },
  { symbol: 'SOLA.CA', name: 'سولار مصر', nameEn: 'Solar Egypt', sector: 'الطاقة', sectorEn: 'Energy' },

  // الرعاية الصحية
  { symbol: 'CLFC.CA', name: 'كلفك للرعاية الصحية', nameEn: 'Cleopatra Hospitals', sector: 'الرعاية الصحية', sectorEn: 'Healthcare' },
  { symbol: 'MNFH.CA', name: 'المنيفة للمستشفيات', nameEn: 'Mnifa Hospitals', sector: 'الرعاية الصحية', sectorEn: 'Healthcare' },
  { symbol: 'NCGL.CA', name: 'النيل للمستشفيات', nameEn: 'Nile Hospitals', sector: 'الرعاية الصحية', sectorEn: 'Healthcare' },
  { symbol: 'DENT.CA', name: 'مصر لطب الأسنان', nameEn: 'Egypt Dental', sector: 'الرعاية الصحية', sectorEn: 'Healthcare' },

  // الزراعة
  { symbol: 'AGRO.CA', name: 'مصر للزراعة', nameEn: 'Egypt Agriculture', sector: 'الزراعة', sectorEn: 'Agriculture' },
  { symbol: 'NILE4.CA', name: 'النيل للزراعة', nameEn: 'Nile Agriculture', sector: 'الزراعة', sectorEn: 'Agriculture' },
  { symbol: 'DELT2.CA', name: 'دلتا للزراعة', nameEn: 'Delta Agriculture', sector: 'الزراعة', sectorEn: 'Agriculture' },
// المزيد من الصناعة
  { symbol: 'ELCO.CA', name: 'إيليكو', nameEn: 'Elco', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'UNIP.CA', name: 'يونيباك للورق والتعبئة', nameEn: 'Unipack', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ESRS.CA', name: 'عز للصلب', nameEn: 'Ezz Steel', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'ACRO.CA', name: 'أكرو مصر', nameEn: 'Acrow Misr', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'PSIN.CA', name: 'بيراميدز للصناعة', nameEn: 'Pyramids Industry', sector: 'الصناعة', sectorEn: 'Industry' },
  { symbol: 'MNHD.CA', name: 'مدينة نصر للإسكان', nameEn: 'MNHD', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'AMER.CA', name: 'أمر جروب', nameEn: 'Amer Group', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'ISWP.CA', name: 'مصر إيطاليا للعقارات', nameEn: 'Egypt Italy RE', sector: 'العقارات', sectorEn: 'Real Estate' },
  { symbol: 'SUGR.CA', name: 'مصر للسكر', nameEn: 'Egypt Sugar', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'ALEXFL.CA', name: 'الإسكندرية للدقيق', nameEn: 'Alexandria Flour', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'CAIFL.CA', name: 'القاهرة للدقيق', nameEn: 'Cairo Flour', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'AIVC.CA', name: 'أجواء للصناعات الغذائية', nameEn: 'Ajwa Foods', sector: 'الغذاء', sectorEn: 'Food & Beverage' },
  { symbol: 'SPIN.CA', name: 'مصر للغزل والنسيج', nameEn: 'Egypt Spinning', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'DELTA.CA', name: 'دلتا للنسيج', nameEn: 'Delta Textiles', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'INMA.CA', name: 'إنما للنسيج', nameEn: 'Inma Textiles', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'ALEXC.CA', name: 'الإسكندرية للأقطان', nameEn: 'Alexandria Cotton', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'NILE.CA', name: 'النيل للغزل', nameEn: 'Nile Spinning', sector: 'النسيج', sectorEn: 'Textiles' },
  { symbol: 'MOHE.CA', name: 'ميثاق للتأمين', nameEn: 'Methaq Insurance', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'AICP.CA', name: 'مصر للتأمين', nameEn: 'Misr Insurance', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'GENI.CA', name: 'المصرية العامة للتأمين', nameEn: 'General Insurance', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'TAKI.CA', name: 'تكافل مصر', nameEn: 'Takaful Egypt', sector: 'التأمين', sectorEn: 'Insurance' },
  { symbol: 'EGAS.CA', name: 'غاز مصر', nameEn: 'Gas Egypt', sector: 'الطاقة', sectorEn: 'Energy' },
  { symbol: 'INFA.CA', name: 'إنفرا للطاقة', nameEn: 'Infra Energy', sector: 'الطاقة', sectorEn: 'Energy' },
  { symbol: 'AGRO.CA', name: 'مصر للزراعة', nameEn: 'Egypt Agriculture', sector: 'الزراعة', sectorEn: 'Agriculture' },
  { symbol: 'PIOH.CA', name: 'بيراميدز للفنادق', nameEn: 'Pyramids Hotels', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'SHRM.CA', name: 'شرم الشيخ للسياحة', nameEn: 'Sharm Tourism', sector: 'السياحة', sectorEn: 'Tourism' },
  { symbol: 'ESGE.CA', name: 'المصرية للتعليم', nameEn: 'Egyptian Education', sector: 'التعليم', sectorEn: 'Education' },
  { symbol: 'NCLE.CA', name: 'نيل للتعليم', nameEn: 'Nile Education', sector: 'التعليم', sectorEn: 'Education' },
  { symbol: 'ADPH.CA', name: 'أدفانسد للأدوية', nameEn: 'Advanced Pharma', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'MHPC.CA', name: 'ممفيس للأدوية', nameEn: 'Memphis Pharma', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'ELAB.CA', name: 'مصر للمستحضرات', nameEn: 'Egy Lab', sector: 'الدواء', sectorEn: 'Pharma' },
  { symbol: 'DPAE.CA', name: 'موانئ أبوظبي مصر', nameEn: 'DP World Egypt', sector: 'الموانئ', sectorEn: 'Ports' },
  { symbol: 'GBCO.CA', name: 'جي بي كورب', nameEn: 'GB Corp', sector: 'الخدمات المالية', sectorEn: 'Financial Services' },
  { symbol: 'TORT.CA', name: 'اسمنت طره', nameEn: 'Torah Cement', sector: 'الإسمنت', sectorEn: 'Cement' },
  { symbol: 'SUEZ.CA', name: 'اسمنت السويس', nameEn: 'Suez Cement', sector: 'الإسمنت', sectorEn: 'Cement' },
  { symbol: 'BENI.CA', name: 'اسمنت بني سويف', nameEn: 'Beni Suef Cement', sector: 'الإسمنت', sectorEn: 'Cement' },
  { symbol: 'SOUTH.CA', name: 'اسمنت جنوب الوادي', nameEn: 'South Valley Cement', sector: 'الإسمنت', sectorEn: 'Cement' },
  { symbol: 'NILE2.CA', name: 'اسمنت النيل', nameEn: 'Nile Cement', sector: 'الإسمنت', sectorEn: 'Cement' },
  { symbol: 'KIMA.CA', name: 'كيما للأسمدة', nameEn: 'Kima', sector: 'الأسمدة', sectorEn: 'Fertilizers' },
  { symbol: 'GTHE.CA', name: 'جاتكو', nameEn: 'GATCO', sector: 'الإنشاء', sectorEn: 'Construction' },
  { symbol: 'IEMS.CA', name: 'المصرية للمشروعات', nameEn: 'Egyptian Projects', sector: 'الإنشاء', sectorEn: 'Construction' },
];

export const sectors = [...new Set(egxStocks.map(s => s.sector))];
export const sectorsEn = [...new Set(egxStocks.map(s => s.sectorEn))];