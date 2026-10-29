import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
        // Optional: Reload to refresh all components
        // window.location.reload();
    };
    
};

export default LanguageSwitcher;