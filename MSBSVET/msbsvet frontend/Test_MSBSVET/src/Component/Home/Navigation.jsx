import { useState, useRef, useEffect, useContext } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ThemeContext } from "../Context/ThemeContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GetMenu } from "../../Endpoints_All/Menu/menu";
import { IsStaffFormLocked, IsCandidateFormLocked } from "../../Endpoints_All/Base/formLock";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useLoading } from "../../Hooks/useLoading";
import { useStepValidation } from "../../hooks/useStepValidation";
import { useAuth } from "../../Hooks/AuthContext";
import Swal from 'sweetalert2';
import publicAgent from "../../lib/api/publicAgent";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
const Navigation = () => {
    const { t, i18n } = useTranslation();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navRef = useRef(null);
    const { color } = useContext(ThemeContext);
    const [menuItems, setMenuItems] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isFormLocked, setIsFormLocked] = useState(false);

    const { isLoggedIn, userInfo } = useAuth();
    const location = useLocation();

    const fullID = userInfo?.UserLoginID || "0";
    const userID = userInfo?.userID || 0; 
    const userType = userInfo?.UserType;
    const dashboardPath = userInfo?.DashBoardPathReact;
    const userTypeID = userInfo?.UserTypeID || 0;

    const { startLoading, stopLoading } = useLoading();
    const {
        currentStepId,
        canAccessStep,
        allProgressSections,
        isLoading: stepLoading,
        formType,
        isStaff
    } = useStepValidation();

    // ✅ Translate label function - converts label to translation key
    const translateLabel = (label) => {
        if (!label) return '';
        
        // If label already has underscores, use as is, otherwise replace spaces with underscores
        let translationKey = label.includes('_') ? label : label.replace(/ /g, '_');
        
        // Remove any special characters except underscore
        translationKey = translationKey.replace(/[^a-zA-Z0-9_]/g, '');
        
        // Get translation, fallback to original label if not found
        const translated = t(translationKey, { defaultValue: label });
        
        return translated;
    };

    const checkFormLockStatus = async () => {
        if (!userID || !isLoggedIn) {
            setIsFormLocked(false);
            return false;
        }

        try {
            let apiUrl;
            let paramName;

            if (isStaff) {
                apiUrl = IsStaffFormLocked;
                paramName = 'StaffID';
            } else {
                apiUrl = IsCandidateFormLocked;
                paramName = 'CandidateID';
            }

            const response = await publicAgent.get(apiUrl, {
                params: { [paramName]: userID }
            });

            if (response.data && response.data.Status === "Success") {
                const lockStatus = response.data.Data === true;
                setIsFormLocked(lockStatus);
                return lockStatus;
            } else {
                setIsFormLocked(false);
                return false;
            }
        } catch (error) {
            setIsFormLocked(false);
            return false;
        }
    };

    const getStepNumberFromRoute = (route) => {
        if (!route || !allProgressSections) return null;

        const section = allProgressSections.find(section =>
            route.includes(section.route) ||
            route.toLowerCase().includes(section.id.toLowerCase()) ||
            section.route.includes(route)
        );

        return section ? section.number : null;
    };

    const isMenuItemAccessible = (menuItem) => {
        if (!isLoggedIn || !userID) return true;
        if (isFormLocked) return true;

        if (menuItem.dropdown && menuItem.dropdownItems) {
            return menuItem.dropdownItems.some(child => isMenuItemAccessible(child));
        }

        const stepNumber = getStepNumberFromRoute(menuItem.link);
        if (stepNumber === null) return true;

        return canAccessStep(stepNumber);
    };

    const handleLegacyNavigation = async (legacyUrl) => {
        const legacyToken = sessionStorage.getItem("legacyToken");

        if (userType === 'institute' && legacyToken) {
            try {
                startLoading();
                const legacyApiUrl = `/api/legacy/validateToken?token=${encodeURIComponent(legacyToken)}&url=${encodeURIComponent(legacyUrl)}`;

                const res = await publicAgent.get(legacyApiUrl);

                if (res.data && res.data.success) {
                    window.location.href = `${legacyUrl}?token=${encodeURIComponent(legacyToken)}`;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: t('Access_Denied'),
                        text: t('Invalid_Token'),
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: t('Navigation_Error'),
                    text: t('Legacy_Navigation_Failed'),
                });
            } finally {
                stopLoading();
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: t('Unauthorized'),
                text: t('Legacy_Access_Denied'),
            });
        }
    };

    const handleMenuItemClick = (menuItem, event) => {
        const legacyUrlPattern = /legacy|webform|oldsystem/i;

        if (userType === 'institute' && legacyUrlPattern.test(menuItem.link)) {
            event.preventDefault();
            handleLegacyNavigation(menuItem.link);
            return;
        }

        if (!isLoggedIn || !userID) {
            handleItemClick();
            return;
        }

        if (isFormLocked) {
            handleItemClick();
            return;
        }

        const stepNumber = getStepNumberFromRoute(menuItem.link);
        if (stepNumber === null) {
            handleItemClick();
            return;
        }

        if (!canAccessStep(stepNumber)) {
            event.preventDefault();

            const currentStepSection = allProgressSections.find(s => s.number === currentStepId);
            const currentStepLabel = currentStepSection ? currentStepSection.label : 'Unknown';

            Swal.fire({
                icon: 'warning',
                title: t('Step_Not_Allowed'),
                text: t('Step_Access_Limit', { step: currentStepId, label: currentStepLabel }),
            });
            return;
        }

        handleItemClick();
    };

    const transformMenuData = (apiData) => {
        if (!Array.isArray(apiData) || apiData.length === 0) {
            return [];
        }

        const topLevelItems = apiData
            .filter(item => item.ParentMenuID === 0 || item.ParentMenuID === null)
            .sort((a, b) => (a.SeqNo || 0) - (b.SeqNo || 0));

        const transformedMenu = topLevelItems.map(topItem => {
            const children = apiData
                .filter(item => item.ParentMenuID === topItem.MenuID)
                .sort((a, b) => (a.SeqNo || 0) - (b.SeqNo || 0));

            return {
                label: translateLabel(topItem.LinkName || 'Unnamed'),
                originalLabel: topItem.LinkName,
                link: topItem.LinkURLReact === '#' || !topItem.LinkURLReact ? '/' : topItem.LinkURLReact,
                orderClass: topItem.CSSClass || '',
                dropdown: children.length > 0,
                dropdownItems: children.map(child => ({
                    label: translateLabel(child.LinkName || 'Unnamed'),
                    originalLabel: child.LinkName,
                    link: child.LinkURLReact || '/'
                }))
            };
        });

        return transformedMenu;
    };

    const fetchMenuData = async () => {
        startLoading();

        const actualUserTypeID = isLoggedIn ? (userTypeID || 0) : 0;
        const actualUserID = isLoggedIn ? (userID || 0) : 0;
        
        const fetchUrl = `${GetMenu}?RegionID=1&UserTypeID=${actualUserTypeID}&UserLoginID=${fullID}`;

        try {
            const response = await publicAgent.get(fetchUrl);
            
            let menuData = [];

            if (response.data && response.data.Status === "Success" && Array.isArray(response.data.Data)) {
                menuData = transformMenuData(response.data.Data);
            } else if (Array.isArray(response.data)) {
                menuData = transformMenuData(response.data);
            } else {
                menuData = [];
            }

            setMenuItems(menuData || []);
        } catch (error) {
            setMenuItems([]);
        } finally {
            stopLoading();
        }
    };

    // Re-fetch menu when language changes
    useEffect(() => {
        if (i18n.language) {
            fetchMenuData();
        }
    }, [i18n.language]);

    useEffect(() => {
        fetchMenuData();

        if (isLoggedIn && userID) {
            checkFormLockStatus();
        } else {
            setIsFormLocked(false);
        }
    }, [isLoggedIn, userID, userTypeID, location.pathname]);

    useEffect(() => {
        if (isLoggedIn && userID) {
            checkFormLockStatus();
        }
    }, [userID, isStaff, isLoggedIn]);

    const handleMouseEnter = (index) => {
        setActiveDropdown(index);
    };

    const handleMouseLeave = () => {
        setActiveDropdown(null);
    };

    const handleClickOutside = (event) => {
        if (navRef.current && !navRef.current.contains(event.target)) {
            setActiveDropdown(null);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleMobileDropdown = (index) => {
        setActiveDropdown((prev) => (prev === index ? null : index));
    };

    const handleItemClick = () => {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
    };

    const getMenuItemStyling = (menuItem) => {
        if (!isLoggedIn || !userID || isFormLocked) {
            return "flex items-center px-3 py-2 text-sm font-medium hover:text-blue-200";
        }

        const isAccessible = isMenuItemAccessible(menuItem);
        const baseClasses = "flex items-center px-3 py-2 text-sm font-medium";

        if (isAccessible) {
            return `${baseClasses} hover:text-blue-200 cursor-pointer`;
        } else {
            return `${baseClasses} opacity-50 cursor-not-allowed text-gray-300`;
        }
    };

    const getMobileMenuItemStyling = (menuItem) => {
        if (!isLoggedIn || !userID || isFormLocked) {
            return "block w-full px-4 py-2 text-left text-sm hover:bg-gray-300";
        }

        const isAccessible = isMenuItemAccessible(menuItem);
        const baseClasses = "block w-full px-4 py-2 text-left text-sm";

        if (isAccessible) {
            return `${baseClasses} hover:bg-gray-300 cursor-pointer`;
        } else {
            return `${baseClasses} opacity-50 cursor-not-allowed text-gray-400`;
        }
    };

    return (
        // z-index lowered from z-50 -> z-40: this <nav> is `position: sticky`,
        // which was previously stacking above the app's global loading
        // overlay, so the nav/header stayed visible and clickable while a
        // page-level loader was showing. Global overlays typically render
        // at a very high z-index (e.g. z-[100] or z-[9999]); keeping this
        // nav below that threshold lets the overlay correctly cover it.
        // The dropdown panel below is dropped from z-[60] -> z-50 to match,
        // so it still layers above the nav bar itself.
        <nav
            className={`${color} text-white sticky top-0 z-40 shadow-md`}
            ref={navRef}
        >
            <div className="mx-auto max-w-10xl">
                <div className="flex h-12 items-center justify-between">
                    {/* Desktop Menu */}
                    <div className="hidden space-x-4 md:flex">
                        {isLoggedIn && dashboardPath && (
                            <div className="relative">
                                <button className="flex items-center px-3 py-2 text-sm font-medium hover:text-blue-200">
                                    <Link to={dashboardPath}>{t('Dashboard')}</Link>
                                </button>
                            </div>
                        )}

                        {Array.isArray(menuItems) && menuItems.map((item, index) => (
                            <div
                                key={index}
                                className={`relative ${item.orderClass || ""}`}
                                onMouseEnter={() => item.dropdown && handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {item.dropdown ? (
                                    <button
                                        className={getMenuItemStyling(item)}
                                        onClick={() => handleMouseEnter(index)}
                                        disabled={!isMenuItemAccessible(item)}
                                    >
                                        {item.label}
                                        <ExpandMoreIcon className="ml-1" style={{ fontSize: "1rem" }} />
                                    </button>
                                ) : (
                                    <button
                                        className={getMenuItemStyling(item)}
                                        disabled={!isMenuItemAccessible(item)}
                                    >
                                        <Link
                                            to={item.link}
                                            onClick={(e) => handleMenuItemClick(item, e)}
                                        >
                                            {item.label}
                                        </Link>
                                    </button>
                                )}
                                {item.dropdown && activeDropdown === index && (
                                    // z-index dropped from z-[60] -> z-50 to match the
                                    // nav's own reduced z-40 stacking context — this still
                                    // wins against other content inside the nav bar and
                                    // sits directly above it, while staying under the
                                    // global loading overlay.
                                    <div className="absolute w-max bg-white py-1 text-black shadow-lg z-50">
                                        {item.dropdownItems && Array.isArray(item.dropdownItems) && item.dropdownItems.map((dropdownItem, idx) => {
                                            const isDropdownAccessible = isMenuItemAccessible(dropdownItem);
                                            return (
                                                <Link
                                                    key={idx}
                                                    to={dropdownItem.link}
                                                    className={`block px-4 py-1 text-sm hover:bg-gray-300 hover:text-black ${isDropdownAccessible ? '' : 'opacity-50 cursor-not-allowed text-gray-400'
                                                        }`}
                                                    onClick={(e) => handleMenuItemClick(dropdownItem, e)}
                                                >
                                                    {dropdownItem.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Language Switcher - Desktop */}
                    <div className="hidden md:block">
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center ml-5 md:hidden">
                        <button onClick={toggleMobileMenu} aria-label={t('Toggle_Menu')}>
                            {mobileMenuOpen ? (
                                <CloseIcon style={{ fontSize: 30 }} />
                            ) : (
                                <MenuIcon style={{ fontSize: 30 }} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="bg-white py-2 text-black shadow-lg md:hidden">
                    {isLoggedIn && dashboardPath && (
                        <div>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-300"
                                onClick={handleItemClick}
                            >
                                <Link to={dashboardPath}>{t('Dashboard')}</Link>
                            </button>
                        </div>
                    )}

                    {Array.isArray(menuItems) && menuItems.map((item, index) => (
                        <div key={index}>
                            {item.dropdown ? (
                                <button
                                    className={getMobileMenuItemStyling(item)}
                                    onClick={() => toggleMobileDropdown(index)}
                                    disabled={!isMenuItemAccessible(item)}
                                >
                                    {item.label}
                                    <ExpandMoreIcon
                                        className="ml-1 inline"
                                        style={{ fontSize: "1rem" }}
                                    />
                                </button>
                            ) : (
                                <button
                                    className={getMobileMenuItemStyling(item)}
                                    onClick={(e) => handleMenuItemClick(item, e)}
                                    disabled={!isMenuItemAccessible(item)}
                                >
                                    <Link to={item.link}>{item.label}</Link>
                                </button>
                            )}
                            {item.dropdown && activeDropdown === index && (
                                <div className="bg-gray-100 py-1">
                                    {item.dropdownItems && Array.isArray(item.dropdownItems) && item.dropdownItems.map((dropdownItem, idx) => {
                                        const isDropdownAccessible = isMenuItemAccessible(dropdownItem);
                                        return (
                                            <Link
                                                key={idx}
                                                to={dropdownItem.link}
                                                className={`block px-4 py-2 text-sm hover:bg-gray-300 ${isDropdownAccessible ? '' : 'opacity-50 cursor-not-allowed text-gray-400'
                                                    }`}
                                                onClick={(e) => handleMenuItemClick(dropdownItem, e)}
                                            >
                                                {dropdownItem.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Language Switcher - Mobile */}
                    <div className="border-t mt-2 pt-2 px-4">
                        <LanguageSwitcher />
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;