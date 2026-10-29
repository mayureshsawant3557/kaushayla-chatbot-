import React, { useState, useEffect, useContext, useRef } from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from "../Context/ThemeContext";
import { GetContactOfficeList } from '../../Endpoints_All/Administration/admin';
import publicAgent from '../../lib/api/publicAgent';
import PostGrievance from '../../assets/PostGrievance.png';
import SearchGrievance from '../../assets/SearchGrievance.png';
import Swal from 'sweetalert2';
import { useMemo } from "react";
// Import the date helper functions
import {
    getLokshahiDivasDates,
    replaceWithMarathiNumbers
} from '../../utils/dateHelpers';
import GrievanceForm from './GrievanceForm';
import TrackGrievance from './TrackGrievance';

// Custom Dropdown Component
const CustomSelect = ({ options, value, onChange, placeholder, getLocalizedText, labelKey = 'District', labelKeyMar = 'DistrictMarathi' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.ID?.toString() === value?.toString());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-gray-300 rounded-sm p-2 text-sm bg-white text-left flex justify-between items-center hover:bg-gray-50"
                style={{ position: 'relative' }}
            >
                <span className="truncate">
                    {selectedOption 
                        ? getLocalizedText(selectedOption[labelKey], selectedOption[labelKeyMar])
                        : placeholder}
                </span>
                <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {isOpen && (
                <div 
                    className="absolute w-full mt-1 border border-gray-300 rounded-sm bg-white shadow-lg max-h-60 overflow-auto z-[10000]"
                    style={{ 
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 10000
                    }}
                >
                    <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                        onClick={() => {
                            onChange({ target: { value: '' } });
                            setIsOpen(false);
                        }}
                    >
                        -- {placeholder} --
                    </div>
                    {options.map((option) => (
                        <div
                            key={option.ID}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                                onChange({ target: { value: option.ID.toString() } });
                                setIsOpen(false);
                            }}
                        >
                            {getLocalizedText(option[labelKey], option[labelKeyMar])}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContactUs = () => {
    const { color } = useContext(ThemeContext);
    const { t, i18n } = useTranslation('contact');
    const [activeTab, setActiveTab] = useState('headOffice');
    const [contactOffices, setContactOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [headOffice, setHeadOffice] = useState(null);
    const [regionalOffices, setRegionalOffices] = useState([]);
    const [districtOffices, setDistrictOffices] = useState([]);

    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [faqList, setFaqList] = useState([]);
    const [faqLoading, setFaqLoading] = useState(false);
    const [faqError, setFaqError] = useState("");
    const [showGrievanceForm, setShowGrievanceForm] = useState(false);
    const [showTrackGrievance, setShowTrackGrievance] = useState(false);
    const [formData, setFormData] = useState({
        profileID: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        mobileNo: '',
        grievance: '',
        document: null
    });

    // Calculate categories from faqList
    const categories = [...new Set(faqList.map(f => f.FAQCategory))];

    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchText, setSearchText] = useState("");
    const [filteredFaqs, setFilteredFaqs] = useState([]);

    // Add state for Lokshahi Divas dates
    const [lokshahiDates, setLokshahiDates] = useState(null);

    useEffect(() => {
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) setActiveTab(savedTab);
        fetchContactOffices();

        // Calculate Lokshahi Divas dates
        const dates = getLokshahiDivasDates();
        setLokshahiDates(dates);
        fetchFAQList();
    }, []);


    // Handle language change
    useEffect(() => {
        if (faqList.length > 0) {
            const updatedFaqs = faqList.map(faq => ({
                ...faq,
                Question: i18n.language === 'mr'
                    ? (faq.QuestionMarathi || faq.QuestionEnglish)
                    : (faq.QuestionEnglish || faq.QuestionMarathi),
                Answer: i18n.language === 'mr'
                    ? (faq.AnswerMarathi || faq.AnswerEnglish)
                    : (faq.AnswerEnglish || faq.AnswerMarathi)
            }));
            setFaqList(updatedFaqs);
            setFilteredFaqs(updatedFaqs);
        }
    }, [i18n.language]);

    useEffect(() => {
        if (lokshahiDates) {
            setLokshahiDates({ ...lokshahiDates });
        }
    }, [i18n.language]);

    useEffect(() => {
        if (contactOffices && contactOffices.length > 0) {

            const headOfficeData = contactOffices.find(office => office.ContactUsType === "Head Office");
            const regionalOfficesData = contactOffices.filter(office => office.ContactUsType === "Regional Office");
            const districtOfficesData = contactOffices.filter(office => office.ContactUsType === "District Office");


            setHeadOffice(headOfficeData || null);
            setRegionalOffices(regionalOfficesData);
            setDistrictOffices(districtOfficesData);
        }
    }, [contactOffices]);
    
    useEffect(() => {
    }, [i18n.language, t]);

    const fetchContactOffices = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await publicAgent.get(GetContactOfficeList);

            const responseData = response?.data;

            if (responseData?.Status === "Success" && responseData?.Data) {
                const data = responseData.Data;

                if (data && data.length > 0) {
                    setContactOffices(data);
                } else {
                    setError("No contact office data found");
                    setContactOffices([]);
                }
            } else {
                setError("Invalid data format received");
                setContactOffices([]);
            }

        } catch (err) {
            setError("Failed to load contact information");
            setContactOffices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFAQList = async () => {
        setFaqLoading(true);
        setFaqError("");

        try {
            const response = await publicAgent.get(
                `/api/ManageFAQ/GetFAQList?RegionID=1`
            );

            const responseData = response?.data;

            if (responseData?.Status === "Success" && responseData?.Data) {
                const faqData = responseData.Data;

                // Process the data to separate English and Marathi
                const processedData = faqData.map(faq => {
                    // Split Question (format: "English<br />Marathi")
                    const questionParts = faq.Question ? faq.Question.split('<br />') : ['', ''];
                    // Split Answer (format: "English<br />Marathi")
                    const answerParts = faq.Answer ? faq.Answer.split('<br />') : ['', ''];

                    return {
                        ...faq,
                        // Store both language versions separately
                        QuestionEnglish: questionParts[0]?.trim() || '',
                        QuestionMarathi: questionParts[1]?.trim() || questionParts[0]?.trim() || '',
                        AnswerEnglish: answerParts[0]?.trim() || '',
                        AnswerMarathi: answerParts[1]?.trim() || answerParts[0]?.trim() || '',
                        // Set current language based on i18n
                        Question: i18n.language === 'mr'
                            ? (questionParts[1]?.trim() || questionParts[0]?.trim() || '')
                            : (questionParts[0]?.trim() || ''),
                        Answer: i18n.language === 'mr'
                            ? (answerParts[1]?.trim() || answerParts[0]?.trim() || '')
                            : (answerParts[0]?.trim() || '')
                    };
                });

                // Log the categories
                const extractedCategories = [...new Set(processedData.map(f => f.FAQCategory))];

                setFaqList(processedData);
                setFilteredFaqs(processedData);
            } else {
                setFaqList([]);
                setFilteredFaqs([]);
                setFaqError("No FAQ data found");
            }

        } catch (err) {
            setFaqError("Failed to load FAQ list");
            setFaqList([]);
            setFilteredFaqs([]);
        } finally {
            setFaqLoading(false);
        }
    };
    
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        localStorage.setItem('activeTab', tabName);
        if (tabName === "faq" && faqList.length === 0) {
            fetchFAQList();
        }
    };



    const handleFaqSearch = () => {
        let results = faqList;

        if (selectedCategory) {
            results = results.filter(
                faq => faq.FAQCategory === selectedCategory
            );
        }

        if (searchText.trim() !== "") {
            const searchLower = searchText.toLowerCase();
            results = results.filter(faq =>
                faq.Question.toLowerCase().includes(searchLower)
            );
        }

        setFilteredFaqs(results);
    };
    // Add reset filters function
    const handleResetFilters = () => {
        setSelectedCategory("");
        setSearchText("");
        setFilteredFaqs(faqList);
    };

    const handleGrievanceSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await agent.post('/api/grievance/submit', formData);
            if (response.data.Status === 'Success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `Grievance submitted successfully. Your Grievance No: ${response.data.GrievanceNo}`,
                    confirmButtonColor: color.replace('bg-', '#')
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit grievance. Please try again.',
                confirmButtonColor: color.replace('bg-', '#')
            });
        }
    };

    const getLocalizedText = (en, mr) => {
        if (!en && !mr) return '';
        return i18n.language === 'mr' ? (mr || en) : (en || mr);
    };

    const tabs = useMemo(() => [
        { id: 'headOffice', label: t('Head_Office') },
        { id: 'regionalOffice', label: t('Regional_Office') },
        { id: 'districtOffice', label: t('District_Office') },
        { id: 'lokshahiDivas', label: t('Lokshahi_Divas') },
        { id: 'visitingHours', label: t('Visiting_Hours') },
        { id: 'faq', label: t('Frequently_Asked_Question') },
        { id: 'grievance', label: t('Grievance_Redressal') }
    ], [i18n.language, t]);

    if (loading) {
        return (
            <div className="relative w-full p-3 sm:p-4 md:p-6">
                <fieldset className="mb-6 rounded-sm border border-gray-300 bg-white p-4 shadow-lg">
                    <legend className={`flex ${color} items-center text-base sm:text-lg font-semibold text-white p-2 rounded-sm`}>
                        <FileText className="mr-2 text-white w-4 h-4 sm:w-5 sm:h-5" />
                        {t('Contact_Us')}
                    </legend>
                    <div className="p-3 text-center">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }

    return (
        <div className="relative w-full p-3 sm:p-4 md:p-6">
            <fieldset className="mb-6 rounded-sm border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color} items-center text-base sm:text-lg font-semibold text-white p-2 rounded-sm`}>
                    <FileText className="mr-2 text-white w-4 h-4 sm:w-5 sm:h-5" />
                    {t('Contact_Us')}
                </legend>

                <div className="p-3">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <nav className="mb-3">
                        <div className="flex flex-wrap border-b border-blue-900">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? `${color} text-white border-b-2 border-blue-500`
                                        : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent'
                                        }`}
                                    onClick={() => handleTabChange(tab.id)}
                                    type="button"
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="border border-gray-200 bg-gray-50 p-3 sm:p-4 rounded-sm" style={{ overflow: 'visible' }}>
                        {/* Head Office */}
                        {activeTab === 'headOffice' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <div className="bg-white p-4 rounded-sm border border-gray-200">
                                        <h6 className="text-base sm:text-lg font-bold mb-3">
                                            {t('Maharashtra_State_Board_of_Skill_Vocational_Education_and_Training')}
                                        </h6>

                                        {headOffice ? (
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <strong>{t('Address')}:</strong>
                                                    <span className="ms-2" dangerouslySetInnerHTML={{
                                                        __html: getLocalizedText(headOffice.Address, headOffice.AddressMarathi)
                                                    }} />
                                                </div>

                                                {headOffice.GeoLocation && (
                                                    <div>
                                                        <strong>{t('Location')}:</strong>
                                                        <a href={headOffice.GeoLocation} target="_blank" rel="noopener noreferrer" className="ms-2 text-blue-600 hover:underline">
                                                            {t('View_on_Map')}
                                                        </a>
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>{t('Phone_No')}:</strong>
                                                    <span className="ms-2">{getLocalizedText(headOffice.PhoneNo, headOffice.PhoneNoMarathi)}</span>
                                                </div>

                                                {headOffice.HelplineNumber && (
                                                    <div>
                                                        <strong>{t('Helpline_No')}:</strong>
                                                        <span className="ms-2">{getLocalizedText(headOffice.HelplineNumber, headOffice.HelplineNumberMarathi)}</span>
                                                    </div>
                                                )}

                                                {headOffice.Website && (
                                                    <div>
                                                        <strong>{t('Website')}:</strong>
                                                        <a href={`https://${headOffice.Website}`} target="_blank" rel="noopener noreferrer" className="ms-2 text-blue-600 hover:underline">
                                                            {getLocalizedText(headOffice.Website, headOffice.WebsiteMarathi)}
                                                        </a>
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>{t('Email')}:</strong>
                                                    <a href={`mailto:${headOffice.Emailid}`} className="ms-2 text-blue-600 hover:underline">
                                                        {getLocalizedText(headOffice.Emailid, headOffice.EmailidMarathi)}
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-center py-4">
                                                {t('No head office data available')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="bg-white p-2 rounded-sm border border-gray-200 h-full">
                                        {headOffice?.GeoLocationUrl ? (
                                            <iframe
                                                src={headOffice.GeoLocationUrl}
                                                width="100%"
                                                height="300"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                className="rounded-sm"
                                                title="Office Location"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                {t('Map not available')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Regional Office */}
                        {activeTab === 'regionalOffice' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <div className="bg-white p-4 rounded-sm border border-gray-200">
                                        <h6 className="text-base sm:text-lg font-bold mb-3">{t('Regional_Office')}</h6>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-2">{t('Select Regional Office')}</label>
                                            <CustomSelect
                                                options={regionalOffices}
                                                value={selectedRegion}
                                                onChange={(e) => setSelectedRegion(e.target.value)}
                                                placeholder={t('Select')}
                                                getLocalizedText={getLocalizedText}
                                                labelKey="Region"
                                                labelKeyMar="RegionMarathi"
                                            />
                                        </div>

                                        {selectedRegion && (() => {
                                            const office = regionalOffices.find(o => o.ID.toString() === selectedRegion);
                                            return office ? (
                                                <div className="space-y-2 text-sm">

                                                    {office.JointDirectorName && (
                                                        <div>
                                                            <strong>{t('Joint Director')}:</strong>
                                                            <span className="ms-2">{getLocalizedText(office.JointDirectorName, office.JointDirectorNameMarathi)}</span>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{t('Address')}:</strong>
                                                        <span className="ms-2" dangerouslySetInnerHTML={{
                                                            __html: getLocalizedText(office.Address, office.AddressMarathi)
                                                        }} />
                                                    </div>

                                                    {office.GeoLocation && (
                                                        <div>
                                                            <strong>{t('Location')}:</strong>
                                                            <a href={office.GeoLocation} target="_blank" rel="noopener noreferrer" className="ms-2 text-blue-600 hover:underline">
                                                                {t('View_on_Map')}
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{t('Phone_No')}:</strong>
                                                        <span className="ms-2">{getLocalizedText(office.PhoneNo, office.PhoneNoMarathi)}</span>
                                                    </div>

                                                    {office.HelplineNumber && (
                                                        <div>
                                                            <strong>{t('Helpline_No')}:</strong>
                                                            <span className="ms-2">{getLocalizedText(office.HelplineNumber, office.HelplineNumberMarathi)}</span>
                                                        </div>
                                                    )}

                                                    {office.Website && (
                                                        <div>
                                                            <strong>{t('Website')}:</strong>
                                                            <a href={`https://${office.Website}`} target="_blank" rel="noopener noreferrer" className="ms-2 text-blue-600 hover:underline">
                                                                {getLocalizedText(office.Website, office.WebsiteMarathi)}
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{t('Email')}:</strong>
                                                        <a href={`mailto:${office.Emailid}`} className="ms-2 text-blue-600 hover:underline">
                                                            {getLocalizedText(office.Emailid, office.EmailidMarathi)}
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <div className="bg-white p-2 rounded-sm border border-gray-200 h-full">
                                        {selectedRegion ? (() => {
                                            const office = regionalOffices.find(o => o.ID.toString() === selectedRegion);
                                            return office?.GeoLocationUrl ? (
                                                <iframe src={office.GeoLocationUrl} width="100%" height="300" style={{ border: 0 }} loading="lazy" className="rounded-sm" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">{t('Map not available')}</div>
                                            );
                                        })() : (
                                            <div className="flex items-center justify-center h-full text-gray-500">{t('Select an office to view map')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* District Office */}
                        {activeTab === 'districtOffice' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <div className="bg-white p-4 rounded-sm border border-gray-200">
                                        <h6 className="text-base sm:text-lg font-bold mb-3">{t('District_Office')}</h6>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-2">{t('Select District Office')}</label>
                                            <CustomSelect
                                                options={districtOffices}
                                                value={selectedDistrict}
                                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                                placeholder={t('Select')}
                                                getLocalizedText={getLocalizedText}
                                                labelKey="District"
                                                labelKeyMar="DistrictMarathi"
                                            />
                                        </div>

                                        {selectedDistrict && (() => {
                                            const office = districtOffices.find(o => o.ID.toString() === selectedDistrict);
                                            return office ? (
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <strong>{t('Address')}:</strong>
                                                        <span className="ms-2" dangerouslySetInnerHTML={{
                                                            __html: getLocalizedText(office.Address, office.AddressMarathi)
                                                        }} />
                                                    </div>

                                                    {office.GeoLocation && (
                                                        <div>
                                                            <strong>{t('Location')}:</strong>
                                                            <a href={office.GeoLocation} target="_blank" rel="noopener noreferrer" className="ms-2 text-blue-600 hover:underline">
                                                                {t('View_on_Map')}
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{t('Phone_No')}:</strong>
                                                        <span className="ms-2">{getLocalizedText(office.PhoneNo, office.PhoneNoMarathi)}</span>
                                                    </div>

                                                    {office.HelplineNumber && (
                                                        <div>
                                                            <strong>{t('Helpline_No')}:</strong>
                                                            <span className="ms-2">{getLocalizedText(office.HelplineNumber, office.HelplineNumberMarathi)}</span>
                                                        </div>
                                                    )}

                                                    {office.Website && (
                                                        <div>
                                                            <strong>{t('Website')}:</strong>
                                                            <a href={`https://${office.Website}`} target="_blank" rel="noopener noreferrer" className="ms-2 text-blue-600 hover:underline">
                                                                {getLocalizedText(office.Website, office.WebsiteMarathi)}
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{t('Email')}:</strong>
                                                        <a href={`mailto:${office.Emailid}`} className="ms-2 text-blue-600 hover:underline">
                                                            {getLocalizedText(office.Emailid, office.EmailidMarathi)}
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <div className="bg-white p-2 rounded-sm border border-gray-200 h-full">
                                        {selectedDistrict ? (() => {
                                            const office = districtOffices.find(o => o.ID.toString() === selectedDistrict);
                                            return office?.GeoLocationUrl ? (
                                                <iframe src={office.GeoLocationUrl} width="100%" height="300" style={{ border: 0 }} loading="lazy" className="rounded-sm" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">{t('Map not available')}</div>
                                            );
                                        })() : (
                                            <div className="flex items-center justify-center h-full text-gray-500">{t('Select an office to view map')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* UPDATED: Lokshahi Divas Section with Dynamic Dates */}
                        {activeTab === 'lokshahiDivas' && lokshahiDates && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-sm border border-gray-200">
                                    <h6 className="font-bold mb-3">{t('Head Office Lokshahi Divas')}</h6>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>{t('Time')}:</strong>
                                            <span className="ms-2">11:00 AM to 12:00 Noon</span>
                                        </div>
                                        <div>
                                            <strong>{t('Date')}:</strong>
                                            <span className="ms-2">
                                                {i18n.language === 'mr'
                                                    ? replaceWithMarathiNumbers(lokshahiDates.headOfficeDate)
                                                    : lokshahiDates.headOfficeDate}
                                            </span>
                                            <span className="ms-2 text-xs text-gray-500">
                                                ({t('Fourth Thursday of Every Month')})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-sm border border-gray-200">
                                    <h6 className="font-bold mb-3">{t('Virtual Lokshahi Divas')}</h6>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>{t('Time')}:</strong>
                                            <span className="ms-2">10:00 AM to 11:00 AM</span>
                                        </div>
                                        <div>
                                            <strong>{t('Date')}:</strong>
                                            <span className="ms-2">
                                                {i18n.language === 'mr'
                                                    ? replaceWithMarathiNumbers(lokshahiDates.virtualDate)
                                                    : lokshahiDates.virtualDate}
                                            </span>
                                            <span className="ms-2 text-xs text-gray-500">
                                                ({t('Fourth Thursday of Every Month')})
                                            </span>
                                        </div>
                                        <div>
                                            <strong>{t('VC Link')}:</strong>
                                            <a
                                                href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_YWQ3NDUyNWMtMGUwMi00MzEzLWFkYjgtZjg0MTYwYWE2MmMy%40thread.v2/0?context=%7b%22Tid%22%3a%220e33ea86-e6ec-4be8-a40e-02a587d16926%22%2c%22Oid%22%3a%229be84fae-e31e-4ed2-8096-a8eda82db24c%22%7d"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ms-2 text-blue-600 hover:underline"
                                            >
                                                {t('Click Here to Join')}
                                            </a>
                                        </div>
                                        <div>
                                            <strong>{t('VC Application')}:</strong>
                                            <span className="ms-2">Microsoft Teams Meeting</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visiting Hours */}
                        {activeTab === 'visitingHours' && (
                            <div className="bg-white p-4 rounded-sm border border-gray-200">
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <strong>{t('Working Days')}:</strong>
                                        <div className="ms-4 mt-1">
                                            <div>11.00 am to 12.00 noon</div>
                                            <div>03.00 pm to 04.00 pm</div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <strong>{t('Note')}:</strong>
                                        <div className="ms-4 mt-2">
                                            <p className="mb-2">{t('Before visiting Board Office for any queries try these options')}</p>
                                            <ul className="list-disc ms-5 space-y-1">
                                                <li>{t('Read Frequently Asked Question')}</li>
                                                <li>{t('Use Grievance Redressal service')}</li>
                                                <li>{t('Contact Board Helpline No. 93212 35321')}</li>
                                                <li>{t('Contact respective District Vocational Education and Training Office. Address and contact details are available under Helpdesk')}</li>
                                                <li>{t('Contact respective Regional Office Address and contact details are available under Helpdesk')}</li>
                                                <li>{t('Attend Lokshahi Divas physically or virtually')}</li>
                                            </ul>
                                            <p className="mt-3 font-medium">
                                                {t('Kindly use above services to resolve your queries. This may avoid travelling to Board Office.')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FAQ Section - UPDATED with loading state and better UX */}
                        {activeTab === 'faq' && (
                            <div className="bg-white p-4 rounded-sm border border-gray-200">
                                {faqLoading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                                        <p className="mt-2 text-gray-600">{t('Loading FAQs...')}</p>
                                    </div>
                                ) : faqError ? (
                                    <div className="text-center py-8 text-red-600">
                                        {faqError}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-6 flex flex-col items-center">

                                            {/* Inputs Row */}
                                            <div className="flex flex-col md:flex-row gap-6">

                                                {/* Category */}
                                                <div className="w-[420px]">
                                                    <label className="block text-sm font-medium mb-2">
                                                        {t('Category')}
                                                    </label>
                                                    <select
                                                        className="w-full border border-gray-400 px-3 h-10 text-sm bg-white"
                                                        value={selectedCategory}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                    >
                                                        <option value="">{t('ALL')}</option>
                                                        {categories.map((cat, index) => (
                                                            <option key={index} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Search */}
                                                <div className="w-[420px]">
                                                    <label className="block text-sm font-medium mb-2">
                                                        {t('Search')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-400 px-3 h-10 text-sm bg-white"
                                                        value={searchText}
                                                        onChange={(e) => setSearchText(e.target.value)}
                                                        placeholder={t('Search...')}
                                                    />
                                                </div>

                                            </div>

                                            {/* Button */}
                                            <div className="mt-4">
                                                <button
                                                    onClick={handleFaqSearch}
                                                    className="px-10 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition"
                                                >
                                                    {t('Search')}
                                                </button>
                                            </div>

                                        </div>

                                        {/* FAQ Accordion */}
                                        <div className="mt-4">

                                            {filteredFaqs.length === 0 && (
                                                <div className="text-center text-gray-500 py-8">
                                                    {faqList.length === 0
                                                        ? t('No FAQs available. Please check back later.')
                                                        : t('No FAQs match your search criteria')}
                                                </div>
                                            )}

                                            <div className="border border-gray-300">

                                                {filteredFaqs.map((faq, index) => (
                                                    <details key={faq.FAQID || index} className="group border-b border-gray-300 last:border-b-0">

                                                        {/* Question Row */}
                                                        <summary className="list-none cursor-pointer px-6 py-4 flex justify-between items-center 
                                                            bg-[#7f889c] text-white text-[15px] font-medium">

                                                            <span>
                                                                Q{index + 1}. {faq.Question}
                                                            </span>

                                                            {/* Right Arrow */}
                                                            <span className="transition-transform duration-300 group-open:rotate-180 text-lg">
                                                                ▼
                                                            </span>
                                                        </summary>

                                                        {/* Answer */}
                                                        <div
                                                            className="bg-white text-black px-6 py-4 text-sm"
                                                            dangerouslySetInnerHTML={{ __html: faq.Answer }}
                                                        />

                                                    </details>
                                                ))}

                                            </div>

                                            {filteredFaqs.length > 0 && (
                                                <div className="text-sm text-gray-500 mt-2">
                                                    {t('Showing')} {filteredFaqs.length} {t('of')} {faqList.length} {t('FAQs')}
                                                </div>
                                            )}

                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Grievance Section - UPDATED with TrackGrievance integration */}
                        {activeTab === 'grievance' && (
                            <div className="bg-white p-4">
                                {!showGrievanceForm && !showTrackGrievance ? (
                                    <div>
                                        {/* Icons Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center py-4">
                                            {/* Post Grievance */}
                                            <div className="text-center">
                                                <img
                                                    src={PostGrievance}
                                                    alt="post grievance"
                                                    className="w-16 h-16 mx-auto mb-3 cursor-pointer hover:opacity-80"
                                                    onClick={() => setShowGrievanceForm(true)}
                                                />
                                                <button
                                                    onClick={() => setShowGrievanceForm(true)}
                                                    className="bg-yellow-400 text-black px-6 py-2 rounded-sm font-semibold hover:bg-yellow-500 min-w-[150px]"
                                                >
                                                    {t('Post Grievance')}
                                                </button>
                                            </div>

                                            {/* Track Grievance */}
                                            <div className="text-center">
                                                <img
                                                    src={SearchGrievance}
                                                    alt="track grievance"
                                                    className="w-16 h-16 mx-auto mb-3 cursor-pointer hover:opacity-80"
                                                    onClick={() => setShowTrackGrievance(true)}
                                                />
                                                <button
                                                    onClick={() => setShowTrackGrievance(true)}
                                                    className="bg-blue-400 text-black px-6 py-2 rounded-sm font-semibold hover:bg-blue-500 min-w-[150px]"
                                                >
                                                    {t('Track Grievance')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : showGrievanceForm ? (
                                    <GrievanceForm
                                        onBack={() => {
                                            setShowGrievanceForm(false);
                                        }}
                                        color={color}
                                    />
                                ) : showTrackGrievance ? (
                                    <TrackGrievance
                                        onBack={() => setShowTrackGrievance(false)}
                                        color={color}
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default ContactUs;