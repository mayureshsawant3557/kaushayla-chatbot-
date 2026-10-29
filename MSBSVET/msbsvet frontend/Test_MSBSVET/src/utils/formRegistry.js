/**
 * formRegistry.js
 * Centralized, reusable registry for MSBSVET portal registration and inquiry forms.
 * Provides stable field mappings, DOM-safe live inspection, React-state autofill,
 * and next-step calculation across Candidate, Staff, Promoting Org, and Institute forms.
 */

export const FORM_REGISTRY = {
    candidate_registration: {
        id: 'candidate_registration',
        routes: ['/candidate/register', '/React/candidate/register'],
        userType: 'Candidate',
        title: {
            en: 'Candidate Registration Form',
            mr: 'उमेदवार नोंदणी फॉर्म'
        },
        sections: [
            { id: 'personal', titleMr: 'वैयक्तिक माहिती', titleEn: 'Personal Information' },
            { id: 'contact', titleMr: 'संपर्क तपशील', titleEn: 'Contact Details' },
            { id: 'education', titleMr: 'शैक्षणिक माहिती', titleEn: 'Education & Trade' }
        ],
        fields: [
            {
                key: 'itiRegistered',
                labelMr: 'यापूर्वी नोंदणी केली आहे का?',
                labelEn: 'Registered Previously?',
                required: true,
                type: 'radio',
                section: 'personal',
                selector: 'input[name="itiRegistered"]',
                promptMr: 'तुम्ही यापूर्वी कोणत्याही ITI मध्ये नोंदणी केली आहे का? (होय / नाही)',
                promptEn: 'Have you previously registered with any ITI? (Yes / No)'
            },
            {
                key: 'firstName',
                labelMr: 'पहिले नाव',
                labelEn: 'First Name',
                required: true,
                type: 'text',
                section: 'personal',
                selector: 'input[name="firstName"], [data-testid="firstName"], #firstName',
                promptMr: 'तुमचे पहिले नाव (First Name) काय आहे?',
                promptEn: 'What is your First Name?'
            },
            {
                key: 'middleName',
                labelMr: 'वडिलांचे / पतीचे नाव',
                labelEn: 'Middle / Father / Husband Name',
                required: false,
                type: 'text',
                section: 'personal',
                selector: 'input[name="middleName"], [data-testid="middleName"], #middleName',
                promptMr: 'वडिलांचे किंवा पतीचे नाव (Middle Name) काय आहे? (नसल्यास Skip करू शकता)',
                promptEn: 'What is your Middle / Father / Husband Name? (or say skip)'
            },
            {
                key: 'lastName',
                labelMr: 'आडनाव',
                labelEn: 'Last Name',
                required: true,
                type: 'text',
                section: 'personal',
                selector: 'input[name="lastName"], [data-testid="lastName"], #lastName',
                promptMr: 'तुमचे आडनाव (Last Name) काय आहे?',
                promptEn: 'What is your Last Name?'
            },
            {
                key: 'dob',
                labelMr: 'जन्मतारीख',
                labelEn: 'Date of Birth',
                required: true,
                type: 'date',
                section: 'personal',
                selector: 'input[name="dob"], [data-testid="dob"], input[placeholder*="YYYY"], input[placeholder*="DD/MM/YYYY"]',
                promptMr: 'तुमची जन्मतारीख काय आहे? (उदा. 15 ऑगस्ट 2002 किंवा 15/08/2002)',
                promptEn: 'What is your Date of Birth? (e.g. 15 August 2002 or 15/08/2002)'
            },
            {
                key: 'gender',
                labelMr: 'लिंग',
                labelEn: 'Gender',
                required: true,
                type: 'select',
                section: 'personal',
                selector: 'select[name="gender"], [data-testid="gender"]',
                promptMr: 'तुमचे लिंग (Gender) काय आहे? (पुरुष / महिला / इतर)',
                promptEn: 'What is your Gender? (Male / Female / Other)'
            },
            {
                key: 'email',
                labelMr: 'ईमेल आयडी',
                labelEn: 'Email Address',
                required: true,
                type: 'email',
                section: 'contact',
                selector: 'input[name="email"], [data-testid="email"]',
                promptMr: 'तुमचा ईमेल आयडी काय आहे?',
                promptEn: 'What is your Email Address?'
            },
            {
                key: 'primaryMobile',
                labelMr: 'मोबाईल नंबर',
                labelEn: 'Primary Mobile Number',
                required: true,
                type: 'number',
                section: 'contact',
                selector: 'input[name="primaryMobile"], [data-testid="primaryMobile"], input[name="mobile"]',
                promptMr: 'तुमचा 10-अंकी प्राथमिक मोबाईल नंबर काय आहे?',
                promptEn: 'What is your 10-digit primary Mobile Number?'
            },
            {
                key: 'qualification',
                labelMr: 'शैक्षणिक पात्रता',
                labelEn: 'Highest Qualification',
                required: false,
                type: 'select',
                section: 'education',
                selector: 'select[name="qualification"], [data-testid="qualification"]',
                promptMr: 'तुमचे सर्वोच्च शिक्षण (Qualification) काय आहे? (उदा. 10th Pass, 12th Pass, ITI, Graduate)',
                promptEn: 'What is your highest qualification? (e.g. 10th Pass, 12th Pass, ITI, Graduate)'
            },
            {
                key: 'coursePreference',
                labelMr: 'कोर्स पसंती',
                labelEn: 'Preferred Course',
                required: false,
                type: 'select',
                section: 'education',
                selector: 'select[name="coursePreference"], [data-testid="coursePreference"]',
                promptMr: 'तुम्हाला कोणत्या कोर्समध्ये प्रवेश घ्यायचा आहे? (उदा. AI, Electrician, COPA, Solar)',
                promptEn: 'Which course are you interested in? (e.g. AI, Electrician, COPA, Solar)'
            }
        ]
    },

    staff_registration: {
        id: 'staff_registration',
        routes: ['/staff/register', '/React/staff/register'],
        userType: 'Staff',
        title: {
            en: 'Staff Registration Form',
            mr: 'कर्मचारी नोंदणी फॉर्म'
        },
        sections: [
            { id: 'personal', titleMr: 'वैयक्तिक माहिती', titleEn: 'Personal Information' },
            { id: 'contact', titleMr: 'संपर्क तपशील', titleEn: 'Contact Details' }
        ],
        fields: [
            {
                key: 'firstName',
                labelMr: 'पहिले नाव',
                labelEn: 'First Name',
                required: true,
                type: 'text',
                section: 'personal',
                selector: 'input[name="firstName"], [data-testid="firstName"], #firstName',
                promptMr: 'कर्मचारीचे पहिले नाव (First Name) काय आहे?',
                promptEn: "What is the staff member's First Name?"
            },
            {
                key: 'middleName',
                labelMr: 'वडिलांचे / पतीचे नाव',
                labelEn: 'Middle / Father / Husband Name',
                required: false,
                type: 'text',
                section: 'personal',
                selector: 'input[name="middleName"], [data-testid="middleName"], #middleName',
                promptMr: 'वडिलांचे किंवा पतीचे नाव (Middle Name) काय आहे?',
                promptEn: "What is the Middle / Father / Husband Name?"
            },
            {
                key: 'lastName',
                labelMr: 'आडनाव',
                labelEn: 'Last Name',
                required: true,
                type: 'text',
                section: 'personal',
                selector: 'input[name="lastName"], [data-testid="lastName"], #lastName',
                promptMr: 'आडनाव (Last Name) काय आहे?',
                promptEn: "What is the Last Name?"
            },
            {
                key: 'dob',
                labelMr: 'जन्मतारीख',
                labelEn: 'Date of Birth',
                required: true,
                type: 'date',
                section: 'personal',
                selector: 'input[name="dob"], [data-testid="dob"], input[placeholder*="YYYY"], input[placeholder*="DD/MM/YYYY"]',
                promptMr: 'जन्मतारीख काय आहे? (DD/MM/YYYY)',
                promptEn: 'What is the Date of Birth? (DD/MM/YYYY)'
            },
            {
                key: 'gender',
                labelMr: 'लिंग',
                labelEn: 'Gender',
                required: true,
                type: 'select',
                section: 'personal',
                selector: 'select[name="gender"], [data-testid="gender"]',
                promptMr: 'लिंग काय आहे? (पुरुष / महिला / इतर)',
                promptEn: 'What is the Gender? (Male / Female / Other)'
            },
            {
                key: 'primaryMobile',
                labelMr: 'मोबाईल नंबर',
                labelEn: 'Mobile Number',
                required: true,
                type: 'number',
                section: 'contact',
                selector: 'input[name="primaryMobile"], [data-testid="primaryMobile"]',
                promptMr: 'कर्मचारीचा मोबाईल नंबर काय आहे?',
                promptEn: "What is the staff member's Mobile Number?"
            },
            {
                key: 'email',
                labelMr: 'ईमेल आयडी',
                labelEn: 'Email Address',
                required: true,
                type: 'email',
                section: 'contact',
                selector: 'input[name="email"], [data-testid="email"]',
                promptMr: 'ईमेल आयडी काय आहे?',
                promptEn: 'What is the Email Address?'
            }
        ]
    },

    promoting_org_registration: {
        id: 'promoting_org_registration',
        routes: [
            '/Public/PromotingOrganizationRegistration',
            '/React/Public/PromotingOrganizationRegistration',
            '/Registration/PromotingOrganizationRegistration'
        ],
        userType: 'Promoting Organization',
        title: {
            en: 'Promoting Organization Registration',
            mr: 'प्रवर्तक संस्था नोंदणी'
        },
        sections: [
            { id: 'org_details', titleMr: 'संस्था तपशील', titleEn: 'Organization Details' },
            { id: 'rep_details', titleMr: 'अधिकृत प्रतिनिधी', titleEn: 'Authorized Representative' }
        ],
        fields: [
            {
                key: 'NameOfPromotingOrganization',
                labelMr: 'प्रवर्तक संस्थेचे नाव',
                labelEn: 'Name of Promoting Organization',
                required: true,
                type: 'text',
                section: 'org_details',
                selector: 'input[name="NameOfPromotingOrganization"], [data-testid="NameOfPromotingOrganization"]',
                promptMr: 'प्रवर्तक संस्थेचे अधिकृत नाव काय आहे?',
                promptEn: 'What is the official Name of the Promoting Organization?'
            },
            {
                key: 'DateOfRegistration',
                labelMr: 'संस्था नोंदणी दिनांक',
                labelEn: 'Date of Registration',
                required: true,
                type: 'date',
                section: 'org_details',
                selector: 'input[name="DateOfRegistration"], [data-testid="DateOfRegistration"]',
                promptMr: 'संस्थेची नोंदणी दिनांक काय आहे?',
                promptEn: 'What is the Date of Registration of the organization?'
            },
            {
                key: 'OrganizatioRegistrationNumber',
                labelMr: 'संस्था नोंदणी क्रमांक / GR नंबर',
                labelEn: 'Organization Registration / GR Number',
                required: true,
                type: 'text',
                section: 'org_details',
                selector: 'input[name="OrganizatioRegistrationNumber"], [data-testid="OrganizatioRegistrationNumber"]',
                promptMr: 'संस्थेचा नोंदणी क्रमांक किंवा GR नंबर काय आहे?',
                promptEn: 'What is the Organization Registration or GR Number?'
            },
            {
                key: 'Phone',
                labelMr: 'संस्थेचा संपर्क फोन नंबर',
                labelEn: 'Organization Contact Phone',
                required: true,
                type: 'number',
                section: 'org_details',
                selector: 'input[name="Phone"], [data-testid="Phone"]',
                promptMr: 'संस्थेचा संपर्क मोबाईल नंबर काय आहे?',
                promptEn: 'What is the organization contact phone number?'
            },
            {
                key: 'Email',
                labelMr: 'संस्थेचा ईमेल आयडी',
                labelEn: 'Organization Email',
                required: true,
                type: 'email',
                section: 'org_details',
                selector: 'input[name="Email"], [data-testid="Email"]',
                promptMr: 'संस्थेचा अधिकृत ईमेल आयडी काय आहे?',
                promptEn: 'What is the official email address of the organization?'
            }
        ]
    },

    institute_registration: {
        id: 'institute_registration',
        routes: ['/institute/register', '/React/institute/register'],
        userType: 'Institute',
        title: {
            en: 'Skill Development Institute (SDI) Registration',
            mr: 'संस्था नोंदणी (SDI)'
        },
        sections: [
            { id: 'inst_details', titleMr: 'संस्था तपशील', titleEn: 'Institute Details' }
        ],
        fields: [
            {
                key: 'proposedName',
                labelMr: 'प्रस्तावित संस्थेचे नाव',
                labelEn: 'Proposed Institute Name',
                required: true,
                type: 'text',
                section: 'inst_details',
                selector: 'input[name="proposedName"], [data-testid="proposedName"]',
                promptMr: 'प्रस्तावित संस्थेचे नाव काय आहे?',
                promptEn: 'What is the proposed Institute Name?'
            }
        ]
    },

    candidate_profile_primary: {
        id: 'candidate_profile_primary',
        stepNumber: 1,
        routes: ['/Candidate/Primary', '/React/Candidate/Primary'],
        userType: 'Candidate',
        title: {
            en: 'Step 1: Personal Details (Primary)',
            mr: 'पायरी १: वैयक्तिक माहिती (प्राथमिक)'
        },
        sections: [
            { id: 'primary_info', titleMr: 'वैयक्तिक माहिती', titleEn: 'Personal Information' }
        ],
        fields: [
            {
                key: 'firstName',
                labelMr: 'पहिले नाव',
                labelEn: 'First Name',
                required: true,
                type: 'text',
                selector: 'input[name="firstName"], [data-testid="firstName"]',
                promptMr: 'तुमचे पहिले नाव (First Name) काय आहे?',
                promptEn: 'What is your First Name?'
            },
            {
                key: 'lastName',
                labelMr: 'आडनाव',
                labelEn: 'Last Name',
                required: true,
                type: 'text',
                selector: 'input[name="lastName"], [data-testid="lastName"]',
                promptMr: 'तुमचे आडनाव (Last Name) काय आहे?',
                promptEn: 'What is your Last Name?'
            },
            {
                key: 'gender',
                labelMr: 'लिंग',
                labelEn: 'Gender',
                required: true,
                type: 'select',
                selector: 'select[name="gender"], [data-testid="gender"]',
                promptMr: 'लिंग काय आहे? (पुरुष / महिला / इतर)',
                promptEn: 'What is your Gender? (Male / Female / Other)'
            },
            {
                key: 'dob',
                labelMr: 'जन्मतारीख',
                labelEn: 'Date of Birth',
                required: true,
                type: 'date',
                selector: 'input[name="dob"], [data-testid="dob"]',
                promptMr: 'जन्मतारीख काय आहे? (DD/MM/YYYY)',
                promptEn: 'What is your Date of Birth? (DD/MM/YYYY)'
            }
        ]
    },

    candidate_profile_address: {
        id: 'candidate_profile_address',
        stepNumber: 2,
        routes: ['/Candidate/Address', '/React/Candidate/Address'],
        userType: 'Candidate',
        title: {
            en: 'Step 2: Address Details',
            mr: 'पायरी २: पत्ता तपशील'
        },
        sections: [
            { id: 'perm_address', titleMr: 'कायमचा पत्ता', titleEn: 'Permanent Address' },
            { id: 'corr_address', titleMr: 'पत्रव्यवहाराचा पत्ता', titleEn: 'Correspondence Address' }
        ],
        fields: [
            {
                key: 'PAddress',
                labelMr: 'कायमचा पत्ता',
                labelEn: 'Permanent Address',
                required: true,
                type: 'text',
                selector: 'textarea[name="PAddress"], input[name="PAddress"], [data-testid="PAddress"]',
                promptMr: 'तुमचा कायमचा पत्ता (घर क्र., गल्ली, परिसर) काय आहे?',
                promptEn: 'What is your Permanent Address (House/Street/Area)?'
            },
            {
                key: 'PStateID',
                labelMr: 'राज्य',
                labelEn: 'State',
                required: true,
                type: 'select',
                selector: 'select[name="PStateID"], [data-testid="state"]',
                promptMr: 'तुमचे राज्य कोणते आहे? (उदा. महाराष्ट्र)',
                promptEn: 'Which state do you reside in? (e.g. Maharashtra)'
            },
            {
                key: 'PDistrictID',
                labelMr: 'जिल्हा',
                labelEn: 'District',
                required: true,
                type: 'select',
                selector: 'select[name="PDistrictID"], [data-testid="district"]',
                promptMr: 'तुमचा जिल्हा कोणता आहे? (उदा. मुंबई, पुणे, ठाणे, नाशिक)',
                promptEn: 'What is your district? (e.g. Mumbai, Pune, Thane)'
            },
            {
                key: 'PTalukaID',
                labelMr: 'तालुका',
                labelEn: 'Taluka',
                required: true,
                type: 'select',
                selector: 'select[name="PTalukaID"], [data-testid="taluka"]',
                promptMr: 'तुमचा तालुका कोणता आहे?',
                promptEn: 'What is your taluka?'
            },
            {
                key: 'PPincode',
                labelMr: 'पिनकोड',
                labelEn: 'Pincode',
                required: true,
                type: 'number',
                selector: 'input[name="PPincode"], [data-testid="PPincode"]',
                promptMr: 'तुमचा 6-अंकी पिनकोड काय आहे?',
                promptEn: 'What is your 6-digit Pincode?'
            }
        ]
    },

    candidate_profile_parent: {
        id: 'candidate_profile_parent',
        stepNumber: 3,
        routes: ['/Candidate/Parent', '/React/Candidate/Parent'],
        userType: 'Candidate',
        title: {
            en: 'Step 3: Parent & Guardian Details',
            mr: 'पायरी ३: पालक तपशील'
        },
        sections: [
            { id: 'parent_info', titleMr: 'पालक माहिती', titleEn: 'Parent Information' }
        ],
        fields: [
            {
                key: 'fatherName',
                labelMr: 'वडिलांचे पूर्ण नाव',
                labelEn: 'Father Full Name',
                required: true,
                type: 'text',
                selector: 'input[name="fatherName"], [data-testid="fatherName"]',
                promptMr: 'वडिलांचे पूर्ण नाव काय आहे?',
                promptEn: "What is your Father's full name?"
            },
            {
                key: 'motherName',
                labelMr: 'आईचे नाव',
                labelEn: 'Mother Name',
                required: true,
                type: 'text',
                selector: 'input[name="motherName"], [data-testid="motherName"]',
                promptMr: 'आईचे नाव काय आहे?',
                promptEn: "What is your Mother's name?"
            }
        ]
    },

    candidate_profile_category: {
        id: 'candidate_profile_category',
        stepNumber: 4,
        routes: ['/Candidate/Category', '/React/Candidate/Category'],
        userType: 'Candidate',
        title: {
            en: 'Step 4: Category & Reservation',
            mr: 'पायरी ४: प्रवर्ग व आरक्षण तपशील'
        },
        sections: [
            { id: 'cat_info', titleMr: 'प्रवर्ग माहिती', titleEn: 'Category Information' }
        ],
        fields: [
            {
                key: 'categoryID',
                labelMr: 'प्रवर्ग (Category)',
                labelEn: 'Category',
                required: true,
                type: 'select',
                selector: 'select[name="categoryID"], [data-testid="category"]',
                promptMr: 'तुमचा सामाजिक प्रवर्ग कोणता आहे? (OPEN, OBC, SC, ST, EWS, VJ/NT)',
                promptEn: 'What is your social category? (OPEN, OBC, SC, ST, EWS, VJ/NT)'
            }
        ]
    },

    candidate_profile_qualification: {
        id: 'candidate_profile_qualification',
        stepNumber: 5,
        routes: ['/Candidate/Qualification', '/React/Candidate/Qualification'],
        userType: 'Candidate',
        title: {
            en: 'Step 5: Educational Qualification',
            mr: 'पायरी ५: शैक्षणिक पात्रता'
        },
        sections: [
            { id: 'edu_info', titleMr: 'शैक्षणिक माहिती', titleEn: 'Education Information' }
        ],
        fields: [
            {
                key: 'qualificationType',
                labelMr: 'शिक्षण पातळी',
                labelEn: 'Qualification Level',
                required: true,
                type: 'select',
                selector: 'select[name="qualificationType"], [data-testid="qualification"]',
                promptMr: 'शैक्षणिक पात्रता कोणती आहे? (10th Pass, 12th Pass, ITI, Diploma, Graduate)',
                promptEn: 'What is your qualification level? (10th, 12th, ITI, Diploma, Graduate)'
            }
        ]
    },

    candidate_profile_training: {
        id: 'candidate_profile_training',
        stepNumber: 6,
        routes: ['/Candidate/Training', '/React/Candidate/Training'],
        userType: 'Candidate',
        title: {
            en: 'Step 6: Previous Training Details',
            mr: 'पायरी ६: प्रशिक्षण तपशील'
        },
        sections: [
            { id: 'train_info', titleMr: 'प्रशिक्षण माहिती', titleEn: 'Training Information' }
        ],
        fields: []
    },

    candidate_profile_additional: {
        id: 'candidate_profile_additional',
        stepNumber: 7,
        routes: ['/Candidate/Additional', '/React/Candidate/Additional'],
        userType: 'Candidate',
        title: {
            en: 'Step 7: Additional Details',
            mr: 'पायरी ७: अतिरिक्त माहिती'
        },
        sections: [
            { id: 'add_info', titleMr: 'अतिरिक्त तपशील', titleEn: 'Additional Information' }
        ],
        fields: []
    },

    candidate_profile_bank: {
        id: 'candidate_profile_bank',
        stepNumber: 8,
        routes: ['/Candidate/Bank', '/React/Candidate/Bank'],
        userType: 'Candidate',
        title: {
            en: 'Step 8: Bank Account Details',
            mr: 'पायरी ८: बँक तपशील'
        },
        sections: [
            { id: 'bank_info', titleMr: 'बँक तपशील', titleEn: 'Bank Account Information' }
        ],
        fields: [
            {
                key: 'accountNumber',
                labelMr: 'खाते क्रमांक',
                labelEn: 'Account Number',
                required: true,
                type: 'text',
                selector: 'input[name="accountNumber"], [data-testid="accountNumber"]',
                promptMr: 'तुमचा बँक खाते क्रमांक काय आहे?',
                promptEn: 'What is your Bank Account Number?'
            },
            {
                key: 'ifscCode',
                labelMr: 'IFSC कोड',
                labelEn: 'IFSC Code',
                required: true,
                type: 'text',
                selector: 'input[name="ifscCode"], [data-testid="ifscCode"]',
                promptMr: 'बँकेचा IFSC कोड काय आहे?',
                promptEn: 'What is the Bank IFSC Code?'
            }
        ]
    },

    candidate_profile_work: {
        id: 'candidate_profile_work',
        stepNumber: 9,
        routes: ['/Candidate/WorkExperience', '/React/Candidate/WorkExperience'],
        userType: 'Candidate',
        title: {
            en: 'Step 9: Work Experience',
            mr: 'पायरी ९: कामाचा अनुभव'
        },
        sections: [
            { id: 'work_info', titleMr: 'अनुभव तपशील', titleEn: 'Experience Details' }
        ],
        fields: []
    },

    candidate_profile_lock: {
        id: 'candidate_profile_lock',
        stepNumber: 10,
        routes: ['/Candidate/LockApplicationForm', '/React/Candidate/LockApplicationForm'],
        userType: 'Candidate',
        title: {
            en: 'Step 10: Verify & Lock Application Form',
            mr: 'पायरी १०: अर्ज पडताळणी व फॉर्म लॉक करा'
        },
        sections: [
            { id: 'lock_info', titleMr: 'अर्ज लॉक', titleEn: 'Lock Profile' }
        ],
        fields: []
    }
};

/**
 * Get the registered form definition matching the given pathname.
 */
export function getActiveForm(pathname) {
    if (!pathname) return null;
    const cleanPath = pathname.replace(/\/+$/, '').toLowerCase();
    for (const formKey of Object.keys(FORM_REGISTRY)) {
        const form = FORM_REGISTRY[formKey];
        if (form.routes.some(r => {
            const cleanR = r.replace(/\/+$/, '').toLowerCase();
            return cleanPath === cleanR || cleanPath.endsWith(cleanR);
        })) {
            return form;
        }
    }
    return null;
}

/**
 * Safely inspect the live DOM for the given form definition.
 * Never reads or exposes passwords, OTPs, or Aadhaar numbers.
 */
export function inspectLiveForm(formDef) {
    if (!formDef || !formDef.fields) {
        return {
            form_id: null,
            user_type: 'General',
            title: typeof document !== 'undefined' ? document.title : 'MSBSVET Portal',
            title_mr: 'MSBSVET पोर्टल',
            active_section: null,
            fields: { filled: [], empty: [], invalid: [], focused: null },
            required_count: 0,
            completed_required_count: 0,
            optional_count: 0,
            completed_optional_count: 0,
            visible_labels: [],
            values_safe: {}
        };
    }

    const filled = [];
    const empty = [];
    const invalid = [];
    const visible_labels = [];
    const values_safe = {};
    let focused = null;

    const requiredFields = formDef.fields.filter(f => f.required);
    const optionalFields = formDef.fields.filter(f => !f.required);

    if (typeof document === 'undefined') {
        return {
            form_id: formDef.id,
            user_type: formDef.userType,
            title: formDef.title.en,
            title_mr: formDef.title.mr,
            active_section: formDef.sections[0]?.id || null,
            fields: { filled: [], empty: formDef.fields.map(f => f.key), invalid: [], focused: null },
            required_count: requiredFields.length,
            completed_required_count: 0,
            optional_count: optionalFields.length,
            completed_optional_count: 0,
            visible_labels: formDef.fields.map(f => f.labelEn),
            values_safe: {}
        };
    }

    for (const field of formDef.fields) {
        let el = null;
        try {
            el = document.querySelector(field.selector);
        } catch (e) {
            // Fallback to name or id query
            el = document.querySelector(`[name="${field.key}"]`) || document.getElementById(field.key);
        }

        visible_labels.push(field.labelEn);

        if (el) {
            let rawVal = '';
            if (field.type === 'radio' || el.type === 'radio' || field.key === 'itiRegistered') {
                const checkedRadio = document.querySelector(`input[name="${field.key}"]:checked`);
                rawVal = checkedRadio ? String(checkedRadio.value).trim() : '';
            } else if (el.hasAttribute && el.hasAttribute('data-value') && el.getAttribute('data-value')) {
                rawVal = String(el.getAttribute('data-value')).trim();
            } else if (el.querySelector && el.querySelector('[data-value]') && el.querySelector('[data-value]').getAttribute('data-value')) {
                rawVal = String(el.querySelector('[data-value]').getAttribute('data-value')).trim();
            } else {
                rawVal = el.value !== undefined ? String(el.value).trim() : '';
            }
            if (document.activeElement === el) {
                focused = field.key;
            }

            // Check field validity based on format rules & DOM validation state
            let isFormatValid = true;
            if (rawVal.length > 0) {
                if (field.type === 'email' && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(rawVal)) {
                    isFormatValid = false;
                } else if (field.type === 'number' && field.key.toLowerCase().includes('mobile') && !/^[6-9]\d{9}$/.test(rawVal.replace(/\D/g, ''))) {
                    isFormatValid = false;
                } else if (field.type === 'date' && !/^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/.test(rawVal)) {
                    isFormatValid = false;
                }
            }

            // Check if element has invalid/error styling or aria attributes
            const isAriaInvalid = el.getAttribute('aria-invalid') === 'true';
            const hasErrorClass = el.className && typeof el.className === 'string' && el.className.includes('border-red');
            const hasErrorSibling = el.parentElement?.querySelector('.text-red-500') !== null && Boolean(el.parentElement?.querySelector('.text-red-500')?.textContent?.trim());

            if (!isFormatValid || isAriaInvalid || (hasErrorClass && !rawVal) || hasErrorSibling) {
                invalid.push(field.key);
            }

            if (rawVal.length > 0) {
                filled.push(field.key);
                // Safe non-sensitive values only
                if (!['password', 'otp', 'aadhaarNo'].includes(field.key)) {
                    values_safe[field.key] = rawVal;
                }
            } else {
                empty.push(field.key);
            }
        } else {
            empty.push(field.key);
        }
    }

    const completedRequired = requiredFields.filter(f => filled.includes(f.key) && !invalid.includes(f.key));
    const completedOptional = optionalFields.filter(f => filled.includes(f.key) && !invalid.includes(f.key));

    return {
        form_id: formDef.id,
        user_type: formDef.userType,
        title: formDef.title.en,
        title_mr: formDef.title.mr,
        active_section: formDef.sections[0]?.id || null,
        fields: {
            filled,
            empty,
            invalid,
            focused
        },
        required_count: requiredFields.length,
        completed_required_count: completedRequired.length,
        optional_count: optionalFields.length,
        completed_optional_count: completedOptional.length,
        visible_labels,
        values_safe
    };
}

/**
 * Update real React-controlled form elements in the DOM.
 * Invokes native prototype value setters and dispatches 'input' and 'change' events.
 * Also broadcasts the 'msbsvet:autofill' CustomEvent for React component state handlers.
 */
export function applyAutofill(formDef, values) {
    if (!values || typeof values !== 'object') return { updatedKeys: [] };

    const updatedKeys = [];
    const fieldsToDispatch = {};

    for (const [key, rawVal] of Object.entries(values)) {
        if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') continue;
        const val = String(rawVal).trim();

        // Security safeguard: Never accept passwords, OTPs, or Aadhaar numbers into chat autofill
        if (['password', 'securityAnswer', 'otp', 'currentOtp', 'aadhaarNo'].includes(key)) {
            continue;
        }

        fieldsToDispatch[key] = val;

        if (typeof document !== 'undefined') {
            const fieldDef = formDef?.fields?.find(f => f.key === key);
            let el = null;
            if (fieldDef?.selector) {
                try { el = document.querySelector(fieldDef.selector); } catch (e) { }
            }
            if (!el) {
                el = document.querySelector(`input[name="${key}"], select[name="${key}"], [data-testid="${key}"], #${key}`);
            }

            if (fieldDef?.type === 'radio' || (el && el.type === 'radio') || key === 'itiRegistered') {
                const radioToSelect = document.querySelector(`input[name="${key}"][value="${val}"]`) || el;
                if (radioToSelect) {
                    try {
                        radioToSelect.checked = true;
                        radioToSelect.click();
                        radioToSelect.dispatchEvent(new Event('input', { bubbles: true }));
                        radioToSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        updatedKeys.push(key);
                    } catch (e) { }
                }
            } else if (el) {
                try {
                    const prototype = el instanceof HTMLSelectElement
                        ? window.HTMLSelectElement.prototype
                        : window.HTMLInputElement.prototype;
                    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                    if (descriptor && descriptor.set) {
                        descriptor.set.call(el, val);
                    } else {
                        el.value = val;
                    }

                    // Dispatch bubbling input and change events so React triggers onChange handler
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    updatedKeys.push(key);
                } catch (err) {
                    console.warn(`applyAutofill DOM error for ${key}:`, err);
                }
            } else {
                updatedKeys.push(key);
            }
        } else {
            updatedKeys.push(key);
        }
    }

    // Always dispatch global custom event for React components (Candidate.jsx, Staff.jsx, PromotingOrg)
    if (typeof window !== 'undefined' && Object.keys(fieldsToDispatch).length > 0) {
        window.dispatchEvent(new CustomEvent('msbsvet:autofill', { detail: fieldsToDispatch }));
    }

    return { updatedKeys, values: fieldsToDispatch };
}

/**
 * Generate actionable next-step guidance for "Pudhe kay karu?" or form-filling queries
 * based on live form inspection rather than generic RAG text.
 */
export function getNextStepGuidance(formDef, liveState, language = 'mr') {
    if (!formDef) {
        return language === 'mr'
            ? "तुम्हाला कोणत्या प्रकारची नोंदणी करायची आहे — Candidate, Staff, Institute की Promoting Organization?"
            : "Which registration would you like to complete — Candidate, Staff, Institute, or Promoting Organization?";
    }

    const emptyFields = liveState?.fields?.empty || [];
    const filledFields = liveState?.fields?.filled || [];
    const nextMissingDef = formDef.fields.find(f => f.required && emptyFields.includes(f.key));

    const filledLabels = filledFields
        .map(k => {
            const f = formDef.fields.find(fd => fd.key === k);
            return f ? (language === 'mr' ? f.labelMr : f.labelEn) : k;
        })
        .filter(Boolean);

    if (nextMissingDef) {
        if (filledLabels.length > 0) {
            return language === 'mr'
                ? `सध्या तुम्ही ${formDef.title.mr} भरत आहात. आपण (${filledLabels.slice(0, 3).join(', ')}) भरले आहे. ✅ पुढील आवश्यक पायरी म्हणजे: ${nextMissingDef.promptMr}`
                : `You are currently filling the ${formDef.title.en}. You have completed (${filledLabels.slice(0, 3).join(', ')}). ✅ Next step: ${nextMissingDef.promptEn}`;
        }
        return language === 'mr'
            ? `सध्या तुम्ही ${formDef.title.mr} वर आहात. पहिली पायरी म्हणजे: ${nextMissingDef.promptMr}`
            : `You are currently on the ${formDef.title.en}. To begin: ${nextMissingDef.promptEn}`;
    }

    // All required fields filled
    return language === 'mr'
        ? `सर्व आवश्यक फील्ड भरले आहेत! ✅ कृपया स्क्रीनवरील माहिती तपासा. मोबाईल पडताळणी (Verify OTP) करून फॉर्म स्वतः सबमिट करा.`
        : `All required fields are completed! ✅ Please review the details on screen, complete OTP verification, and click Submit.`;
}
