import { useTranslation } from "react-i18next";
import { ThemeContext } from "../Context/ThemeContext";
import React, { useContext, useEffect, useState } from "react";
import {
  FileText,
  Globe,
  ShieldCheck,
  Lock,
  Copyright,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  MapPin,
  Mail,
  Headset,
  Info,
  IndianRupee,
  XCircle,
  ArrowUp,
} from "lucide-react";

const Disclaimer = () => {
  const { t } = useTranslation();
  const { color } = useContext(ThemeContext);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      title: t("Website Usage Terms"),
      icon: <Globe className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "This website is owned, hosted and maintained by Maharashtra State Board of Skill, Vocational Education and Training (MSBSVET), established under the Maharashtra State Board of Skill, Vocational Education and Training Act, 2021 (Mah. Act No. IX of 2022).",
        ),
        t(
          "By accessing or using this website, the user agrees to be bound by the terms and conditions given in this Policy Page and by all applicable laws and regulations.",
        ),
        t(
          "If the user does not agree with any of these terms, the user should not use this website.",
        ),
      ],
    },
    {
      title: t("Privacy Policy"),
      icon: <ShieldCheck className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "The website does not automatically collect personal information that can identify a user individually, such as name, mobile number or email address, unless the user voluntarily provides it through forms (registration, feedback, admissions, grievances etc.).",
        ),
        t(
          "When personal information is requested, the purpose of collection (e.g. user registration, admission processing, communication, grievance redressal) is clearly indicated, and the data is used only for that lawful purpose and for related statutory and administrative requirements of MSBSVET and Government of Maharashtra.",
        ),
        t(
          "MSBSVET does not sell, lease or share any personally identifiable information provided on this website to any private third party; such information may be shared only with authorized government departments/boards or service providers on a need to know basis for delivering online services, as per applicable Acts, Rules and Government Resolutions.",
        ),
        t(
          "The site may log technical information such as IP address, browser type, operating system, date and time of visit and pages visited, for security, audit and usage analytics, without attempting to link this data to individual identities, except in cases of suspected security incident or misuse.",
        ),
      ],
    },
    {
      title: t("Security Practices"),
      icon: <Lock className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "Reasonable security practices and procedures, including role based access control, strong authentication, encrypted transmission (HTTPS) and secure server configuration, are adopted to protect information from loss, misuse, unauthorized access, disclosure, alteration and destruction in line with Government of India and Government of Maharashtra guidelines.",
        ),
        t(
          "Where MSBSVET applications collect sensitive personal data (e.g. Aadhaar based details, category documents), such data is stored in secure environments, access is restricted to authorized officials/boards, and retention is limited to the period necessary for statutory and administrative purposes.",
        ),
        t(
          "Users are advised not to share their login IDs, passwords, OTPs or other authentication credentials with anyone, and to log out properly after completing transactions on shared computers or networks.",
        ),
        t(
          "In case of any suspected breach, misuse of login, or unauthorized access, the user should immediately inform MSBSVET through the official contact details provided on the website so that appropriate remedial action can be initiated.",
        ),
      ],
    },
    {
      title: t("Copyright and Content Usage"),
      icon: <Copyright className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "Unless otherwise stated, all content on this website, including text, logos, icons, graphics, photographs, documents, audio visual material and software, is the intellectual property of MSBSVET and/or Government of Maharashtra and is protected under applicable copyright and intellectual property laws.",
        ),
        t(
          "Content may be downloaded or printed without modification for personal, academic or non commercial official use with due acknowledgement to MSBSVET; any reproduction, republication, commercial use, framing or distribution of website content requires prior written permission of MSBSVET.",
        ),
        t(
          "Any third party content, trademarks, logos or links appearing on this website remain the property of their respective owners and are used only for informational or functional purposes with permission or under applicable fair use provisions.",
        ),
        t(
          "Users must ensure that they do not upload, transmit or share any content through MSBSVET systems that infringes copyright, violates applicable laws, or contains defamatory, obscene or otherwise prohibited material; MSBSVET reserves the right to remove such content and take appropriate action.",
        ),
      ],
    },
    {
      title: t("External Links and Third Party Sites"),
      icon: <ExternalLink className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "This website may provide links to other government portals, affiliated institutions, payment gateways, recruitment/admission portals, grievance portals or third party services for the convenience of users.",
        ),
        t(
          "MSBSVET is not responsible for the content, reliability, availability or privacy practices of such external websites and does not necessarily endorse the views expressed therein; users are advised to review the privacy and security policies of those sites separately.",
        ),
        t(
          "The presence of a link on this site should not be assumed as an endorsement of any kind, and MSBSVET cannot guarantee that these links will always be functional or free from malware.",
        ),
        t(
          "Any transactions or interactions carried out by users on external linked sites are strictly between the user and the concerned third party, and MSBSVET shall not be liable for any loss or damage arising out of such use.",
        ),
      ],
    },
    {
      title: t("Disclaimer and Limitation of Liability"),
      icon: <AlertTriangle className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "While every effort is made to ensure that the information hosted on this website is accurate, updated and complete, MSBSVET does not guarantee the correctness, completeness or currency of the information and accepts no responsibility for any errors, omissions or typographical mistakes.",
        ),
        t(
          "In case of any discrepancy between information on the website and official Acts, Rules, Notifications, Government Resolutions, Circulars or printed documents, the latter shall prevail as the authentic version.",
        ),
        t(
          "MSBSVET, its officers, employees and service providers shall not be liable for any direct, indirect, incidental or consequential loss, damage or expense arising out of use of this website, inability to use the website, reliance on the information provided, or any technical failure, interruption, error, virus or security incident.",
        ),
        t(
          "Users are advised to verify critical information (such as examination schedules, admission rules, fee structures, affiliation status of institutes and recognition of courses) from official notifications published on the website or as may be notified through other authorized channels.",
        ),
      ],
    },
    {
      title: t("Refund Policy"),
      icon: <IndianRupee className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "The fees paid through the portal are generally non-refundable and non-transferable once the payment has been successfully completed.",
        ),
        t(
          "In case of a failed or unsuccessful transaction, where the amount has been debited from the user's bank account but the transaction status is not updated on the portal, the amount will be verified and refunded to the original payment source, subject to confirmation from the payment gateway/bank.",
        ),
        t(
          "Refunds, wherever applicable, will be processed after successful verification and may take 7–10 working days to reflect in the user's bank account, depending on the concerned bank/payment service provider.",
        ),
        t(
          "Users are advised to ensure that all details are correct before making the payment. The department/institute will not be responsible for any payment made due to incorrect information entered by the user.",
        ),
      ],
    },
    {
      title: t("Cancellation Policy"),
      icon: <XCircle className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "Fees paid towards registration, application, inspection, or other applicable services are generally non-refundable and non-transferable, except in cases where a refund is specifically approved by the concerned authority.",
        ),
        t(
          "In case of a duplicate payment, failed transaction, or technical error resulting in an amount being debited from the user's account without successful completion of the transaction, the case will be verified with the payment gateway/bank and processed as per the applicable refund policy.",
        ),
        t(
          "Users are advised to carefully verify all information before submitting the application and making payment. Once the application is submitted and payment is completed, no cancellation request will ordinarily be entertained.",
        ),
      ],
    },
    {
      title: t("Changes to Policy and Contact"),
      icon: <RefreshCw className="w-6 h-6 text-[#004a8d]" />,
      items: [
        t(
          "MSBSVET reserves the right to modify, update or amend this Website Policy at any time without prior notice, and such changes will be effective from the date they are posted on the website.",
        ),
        t(
          "Continued use of the website after any such changes are made shall constitute the user's acceptance of the revised policy.",
        ),
        t(
          "Users may also refer to the Maharashtra State Board of Skill, Vocational Education and Training Act, 2021 and related Rules/Notifications available on the website for statutory provisions governing the Board's functions and powers.",
        ),
      ],
    },
  ];

  // Track the app nav's real rendered height instead of guessing with a
  // timeout. ResizeObserver keeps this correct even if the nav's height
  // changes later (e.g. wraps to two lines, or its menu loads late).
  useEffect(() => {
    const headerEl = document.querySelector("[data-app-header]");
    if (!headerEl) return undefined;

    const update = () =>
      setHeaderOffset(headerEl.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(headerEl);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(window.scrollY, 0),
        Math.max(total, 0),
      );
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Switching sections swaps the visible content in place — no page
  // scrolling is triggered.
  const selectSection = (idx) => {
    setActiveSection(idx);
  };

  return (
    <div
      className="relative w-full pt-1 pb-10 bg-gray-50 min-h-screen"
      id="printdivcontent"
    >
      {/* Reading-progress indicator. Fixed to the viewport, purely decorative. */}
      <div
        className={`fixed left-0 z-30 h-[3px] transition-[width] duration-150 ease-out ${color || "bg-slate-500"}`}
        style={{ width: `${progress}%`, top: headerOffset }}
        aria-hidden="true"
      />

      {/* On-this-page section menu — horizontal, sticky to the top, wraps to show everything */}
      <div
        className="sticky z-20 max-w-7xl mx-auto px-4 md:px-0 mb-6"
        style={{ top: headerOffset }}
      >
        <nav className="rounded-xl border border-gray-300 bg-white shadow-md p-3">
          <ul className="flex flex-wrap items-center gap-2">
            {sections.map((section, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => selectSection(idx)}
                  className={`text-xs rounded-lg px-3 py-2 transition-colors ${
                    activeSection === idx
                      ? `${color || "bg-slate-500"} text-white font-semibold`
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
            <li className="pl-2 ml-2 border-l border-gray-200">
              <button
                type="button"
                onClick={() => selectSection("contact")}
                className={`text-xs rounded-lg px-3 py-2 transition-colors ${
                  activeSection === "contact"
                    ? `${color || "bg-slate-500"} text-white font-semibold`
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t("Contact Information")}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto relative px-4 md:px-0">
        <div className="w-full rounded-xl border border-gray-300 bg-white shadow-md pb-10 px-4 md:px-10">
          <div className="-mt-5 mb-8 ml-8 inline-block">
            <div
              className={`flex items-center gap-2 px-4 py-2 text-white font-bold rounded-lg shadow-md ${color || "bg-slate-500"}`}
            >
              <FileText size={18} />
              <span>{t("Disclaimer and Policies")}</span>
            </div>
          </div>

          <div className="space-y-10">
            {activeSection === "contact" ? (
              <>
                {/* Yellow Contact Container */}
                <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50/50 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4 text-[#004a8d]">
                    <PhoneCall className="w-6 h-6" />
                    <h3 className="text-xl font-bold">
                      {t("Contact Information")}
                    </h3>
                  </div>

                  <p className="text-gray-800 font-bold mb-4">
                    {t(
                      "For any queries, feedback or clarifications related to this policy or the use of this website, users may contact:",
                    )}
                  </p>

                  <div className="space-y-3 text-gray-700">
                    <div className="flex gap-2">
                      <MapPin
                        size={18}
                        className="mt-1 text-gray-600 shrink-0"
                      />
                      <div>
                        <span className="font-bold">{t("Address:")}</span>
                        <p>
                          {t(
                            "Maharashtra State Board of Skill, Vocational Education and Training",
                          )}
                        </p>
                        <p>{t("4th Floor, Centre of Excellence Building")}</p>
                        <p>{t("Government ITI, Mithagar Road")}</p>
                        <p>{t("Mulund (East), Mumbai – 400081")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-gray-600 shrink-0" />
                      <p>
                        <span className="font-bold">{t("Email:")}</span>{" "}
                        {t("Available on the official website")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Headset size={18} className="text-gray-600 shrink-0" />
                      <p>
                        <span className="font-bold">{t("Helpline:")}</span>{" "}
                        {t("Available on the official website")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blue Last Updated Bar */}
                <div className="flex items-center gap-3 bg-blue-50 border-l-4 border-[#004a8d] p-4 rounded-r-md">
                  <Info size={20} className="text-gray-800 shrink-0" />
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-bold">{t("Last Updated:")}</span>{" "}
                    {t("January 2026")} |{" "}
                    {t(
                      "This policy is subject to change without prior notice. Please check this page regularly for updates.",
                    )}
                  </p>
                </div>
              </>
            ) : (
              (() => {
                const section = sections[activeSection];
                return (
                  <div className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6">
                      {section.icon}
                      <h2 className="text-xl md:text-2xl font-bold text-[#004a8d]">
                        {section.title}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {section.items.map((text, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-4">
                          <span className="mt-1.5 text-xs text-gray-400">
                            {"\u25A2"}
                          </span>
                          <p className="text-gray-500 leading-relaxed text-sm ">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label={t("Scroll to top")}
        className={`fixed bottom-28 right-6 z-30 flex items-center justify-center w-11 h-11 rounded-full text-white shadow-lg transition-all duration-300 ${
          color || "bg-slate-500"
        } ${
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default Disclaimer;
