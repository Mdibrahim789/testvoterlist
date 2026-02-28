import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  'header.title': { bn: 'ভোটার অনুসন্ধান', en: 'Voter Search' },
  'header.admin': { bn: 'অ্যাডমিন', en: 'Admin' },

  // Search tabs
  'search.title': { bn: 'ভোটার অনুসন্ধান', en: 'Voter Search' },
  'search.voterNo': { bn: 'ভোটার নং', en: 'Voter No' },
  'search.nameDob': { bn: 'নাম/জন্ম তারিখ', en: 'Name/DOB' },
  'search.voterNoPlaceholder': { bn: 'ভোটার নম্বর লিখুন', en: 'Enter voter number' },
  'search.dobPlaceholder': { bn: 'জন্ম তারিখ (DD-MM-YYYY)', en: 'Date of birth (DD-MM-YYYY)' },
  'search.namePlaceholder': { bn: 'নাম (বাংলায়)', en: 'Name (in Bangla)' },
  'search.searching': { bn: 'খুঁজছি...', en: 'Searching...' },
  'search.searchBtn': { bn: 'সার্চ করুন', en: 'Search' },
  'search.searchShort': { bn: 'সার্চ', en: 'Search' },
  'search.reset': { bn: 'রিসেট', en: 'Reset' },

  // Results
  'results.found': { bn: 'টি ফলাফল পাওয়া গেছে', en: ' result(s) found' },
  'results.noData': { bn: 'কোনো তথ্য পাওয়া যায়নি', en: 'No data found' },
  'results.noMatch': { bn: 'আপনার সার্চের সাথে কোনো ভোটার মেলেনি', en: 'No voter matched your search' },

  // Voter card
  'voter.fatherHusband': { bn: 'পিতা/স্বামী', en: 'Father/Husband' },
  'voter.serial': { bn: 'ক্রমিক নং', en: 'Serial No' },
  'voter.dob': { bn: 'জন্ম তারিখ', en: 'Date of Birth' },
  'voter.voterNo': { bn: 'ভোটার নং', en: 'Voter No' },

  // Instructions
  'instructions.title': { bn: 'কিভাবে ভোটার খুঁজবেন?', en: 'How to search for a voter?' },
  'instructions.step1': { bn: 'ভোটারের <strong>জন্ম তারিখ</strong> লিখুন (DD-MM-YYYY ফরম্যাটে)', en: 'Enter the voter\'s <strong>date of birth</strong> (DD-MM-YYYY format)' },
  'instructions.step2': { bn: 'ভোটারের <strong>নামের যেকোনো অংশ</strong> বাংলায় লিখুন', en: 'Enter <strong>any part of the name</strong> in Bangla' },
  'instructions.step3': { bn: '<strong>সার্চ</strong> বাটনে ক্লিক করুন', en: 'Click the <strong>Search</strong> button' },
  'instructions.example': { bn: 'উদাহরণ: জন্ম তারিখ <strong>15-08-1990</strong>, নাম <strong>মোহাম্মদ</strong>', en: 'Example: DOB <strong>15-08-1990</strong>, Name <strong>মোহাম্মদ</strong>' },

  // Constituency & Candidates
  'constituency.seat': { bn: 'আসন', en: 'Constituency' },
  'candidates.title': { bn: 'প্রার্থী তালিকা', en: 'Candidate List' },
  'candidates.serial': { bn: 'ক্রম', en: 'No.' },
  'candidates.name': { bn: 'দাখিলকারীর নাম', en: 'Candidate Name' },
  'candidates.photo': { bn: 'ছবি', en: 'Photo' },
  'candidates.party': { bn: 'রাজনৈতিক দল/স্বতন্ত্র', en: 'Party/Independent' },
  'candidates.symbol': { bn: 'নির্বাচনী প্রতীক', en: 'Election Symbol' },
  'candidates.loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },

  // Errors
  'error.search': { bn: 'সার্চ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', en: 'Search failed. Please try again.' },
  'error.dobOrName': { bn: 'অনুগ্রহ করে জন্ম তারিখ অথবা নাম লিখুন', en: 'Please enter date of birth or name' },

  // Footer
  'footer.copyright': { bn: '© ২০২৫ ভোটার অনুসন্ধান সিস্টেম', en: '© 2025 Voter Search System' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('bn');

  const toggleLang = () => setLang(prev => prev === 'bn' ? 'en' : 'bn');

  const t = (key: string): string => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
