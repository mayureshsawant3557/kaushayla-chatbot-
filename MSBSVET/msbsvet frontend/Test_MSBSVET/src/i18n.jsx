import i18n from "i18next";

import { initReactI18next } from "react-i18next";

import translationEN from "./LangTranslation/en/Translation.en.json";
import translationMR from "./LangTranslation/mr/Translation.mr.json";
import promotorOrgRegistrationEN from "./LangTranslation/en/promotorOrgRegistration.en.json";
import promotorOrgRegistrationMR from "./LangTranslation/mr/promotorOrgRegistration.mr.json";
import contactEN from "./LangTranslation/en/contact.en.json";
import contactMR from "./LangTranslation/mr/contact.mr.json";


// currentLang null असेल तर 'en' वापरा
const currentLang = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translationEN,
      promotorOrgRegistration: promotorOrgRegistrationEN,
      contact: contactEN
    },
    mr: {
      translation: translationMR,
      promotorOrgRegistration: promotorOrgRegistrationMR,
      contact: contactMR
    },
  },
  fallbackLng: 'en',  // 
  lng: currentLang,    // 
  ns: ["translation", "promotorOrgRegistration", "contact"],
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});
export default i18n;
