/**
 * @file src/lib/i18n/types.ts
 * @description Core TypeScript contracts and schemas for the Internationalization (i18n) engine.
 * 
 * DEVELOPER USAGE NOTE:
 * - Defines supported locales ('en', 'ar', 'bn') and text directionalities ('ltr', 'rtl').
 * - Defines the comprehensive TranslationDictionary contract ensuring compile-time parity
 *   across all language dictionaries.
 * - Human-crafted: avoids generic or auto-generated type soups; explicit domain grouping.
 */

export type Locale = "en" | "ar" | "bn";

export type Direction = "ltr" | "rtl";

export interface LocaleMetadata {
  code: Locale;
  name: string;
  nativeName: string;
  dir: Direction;
  script: string;
  symbol: string;
}

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    history: string;
    founders: string;
    leadership: string;
    calendar: string;
    gallery: string;
    resources: string;
    publications: string;
    news: string;
    contact: string;
    joinClub: string;
    adminPortal: string;
  };
  common: {
    search: string;
    filter: string;
    all: string;
    viewDetails: string;
    readMore: string;
    download: string;
    close: string;
    back: string;
    submit: string;
    save: string;
    cancel: string;
    loading: string;
    empty: string;
    success: string;
    error: string;
    warning: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    systemTheme: string;
    next: string;
    previous: string;
    page: string;
    of: string;
    referenceNumber: string;
    email: string;
    phone: string;
    status: string;
    date: string;
    location: string;
  };
  home: {
    heroBadge: string;
    heroHeadline: string;
    heroSubheadline: string;
    explorePrograms: string;
    membershipCTA: string;
    academicYear: string;
    corePillarsHeading: string;
    preservationNote: string;
  };
  about: {
    title: string;
    subtitle: string;
    mission: string;
    vision: string;
    values: string;
    constitution: string;
    bylaws: string;
    downloadCharter: string;
  };
  history: {
    title: string;
    subtitle: string;
    genesis: string;
    timeline: string;
    preservationArticle: string;
  };
  leadership: {
    title: string;
    subtitle: string;
    currentCouncil: string;
    historicalTerms: string;
    termSelector: string;
    officerRoster: string;
  };
  events: {
    title: string;
    subtitle: string;
    upcoming: string;
    pastArchive: string;
    registerNow: string;
    registrationClosed: string;
    capacityNotice: string;
    cancelledAlert: string;
    postponedAlert: string;
    seatsRemaining: string;
    seatsFull: string;
  };
  resources: {
    title: string;
    subtitle: string;
    levels: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    downloadGuide: string;
    totalDownloads: string;
  };
  publications: {
    title: string;
    subtitle: string;
    periodicals: string;
    rollOfHonor: string;
    volume: string;
    issue: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    albumsCount: string;
    photos: string;
    videos: string;
    viewAlbum: string;
    closeLightbox: string;
  };
  membership: {
    title: string;
    subtitle: string;
    applyTab: string;
    trackTab: string;
    eligibilityTitle: string;
    submitApplication: string;
    checkStatus: string;
    statusResultTitle: string;
  };
  contact: {
    title: string;
    subtitle: string;
    getInTouch: string;
    sendMessage: string;
    officeHours: string;
    inquiryNotice: string;
    locationTitle: string;
  };
  admin: {
    dashboard: string;
    commandCenter: string;
    users: string;
    settings: string;
    auditLogs: string;
    backups: string;
    profile: string;
    logout: string;
    signedInAs: string;
  };
}

export type TranslationKey = keyof TranslationDictionary;
