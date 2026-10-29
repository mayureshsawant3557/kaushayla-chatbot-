import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../Context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Users, UserCheck, CalendarDays, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import W3CValidatorBadges from "./W3CValidatorBadges";
import { GetVisitorStatistics } from "../../Endpoints_All/Base/Courses";
import agent from "../../lib/api/agent";

const Footer = () => {
  const { color } = useContext(ThemeContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [statistics, setStatistics] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    lastUpdatedDate: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getVisitorStatistics();
  }, []);

  const formattedDate = time.toLocaleDateString("en-GB").replace(/\//g, "-");

  const scrollToTopNavigate = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const getVisitorStatistics = async () => {
  try {
    const response = await agent.get(GetVisitorStatistics);



    if (response?.data?.Status=='Success') {
      const data = response.data.Data[0];

      setStatistics({
        totalVisitors: data.TotalVisitors,
        todayVisitors: data.TodayVisitors,
        lastUpdatedDate: data.LastUpdatedDate,
      });
    }
  } catch (error) {
    console.error("Error fetching visitor statistics:", error);
  }
};

  return (
    <footer className={`w-full ${color} text-white py-6 px-6 md:px-12 font-sans border-t border-white/10`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* Column 1: Government Titles and Branding */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <p className="text-sm uppercase mb-1 opacity-70 font-semibold">
                {t("Government_of_Maharashtra")}
              </p>
              <h2 className="text-base font-medium leading-snug opacity-90 mb-0.5">
                {t("Skill_Employment_Entrepreneurship_and_Innovation_Department")}
              </h2>
              <h1 className="text-lg font-bold leading-tight tracking-tight">
                {t("Maharashtra_State_Board_of_Skill_Vocational_Education_and_Training")}
              </h1>
            </div>

            {/* Social Links */}
            <div className="flex gap-2.5 pt-0.5">
              <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-1.5 rounded-lg cursor-pointer hover:scale-110 transition-all shadow-md">
                <Instagram size={18} />
              </div>
              <div className="bg-[#1877F2] p-1.5 rounded-lg cursor-pointer hover:scale-110 transition-all shadow-md">
                <Facebook size={18} fill="white" strokeWidth={0} />
              </div>
              <a href="https://wa.me/918655944852" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] p-1.5 rounded-lg cursor-pointer hover:scale-110 transition-all shadow-md">
                <FaWhatsapp size={18} fill="white" strokeWidth={0} />
              </a>
            </div>
            <div className="pt-4">

              <W3CValidatorBadges />
            </div>
          </div>

          {/* Columns 2-4: Navigation Menu Links & Analytics */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:pl-4">

            {/* Sub-Column 1: About Us & Policies Stacked */}
            <div>
              {/* About Us Section */}
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-white/10 pb-1 whitespace-nowrap">
                {t("About_Us")}
              </h3>
              <ul className="space-y-1.5">
                <li
                  onClick={() => scrollToTopNavigate('/Public/OfficeBearers')}
                  className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100 hover:text-blue-300 transition-all cursor-pointer font-medium"
                >
                  <ChevronRight size={16} className="text-blue-400" />
                  {t("Board_of_Directors")}
                </li>
              </ul>

              {/* Disclaimer and Policies Section */}
              <h3 className="text-sm font-bold uppercase tracking-wider mt-4 mb-2 border-b border-white/10 pb-1 whitespace-nowrap">
                {t("Policies")}
              </h3>
              <ul className="space-y-1.5">
                <li
                  onClick={() => scrollToTopNavigate('/Public/Disclaimer')}
                  className="flex items-center gap-1 text-sm font-medium opacity-80 hover:opacity-100 hover:text-blue-300 transition-all cursor-pointer"
                >
                  <ChevronRight size={16} className="text-blue-400" />
                  {t("Disclaimer and Policies")}
                </li>
              </ul>
            </div>

            {/* Sub-Column 2: Support */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-white/10 pb-1 whitespace-nowrap">
                {t("Support")}
              </h3>
              <ul className="space-y-1.5">
                <li
                  onClick={() => scrollToTopNavigate('/Public/ContactUs')}
                  className="flex items-center gap-1 text-sm font-medium opacity-80 hover:opacity-100 hover:text-blue-300 transition-all cursor-pointer"
                >
                  <ChevronRight size={16} className="text-blue-400" /> {t("Help")}
                </li>
                <li
                  onClick={() => scrollToTopNavigate('/Public/Sitemap')}
                  className="flex items-center gap-1 text-sm font-medium opacity-80 hover:opacity-100 hover:text-blue-300 transition-all cursor-pointer"
                >
                  <ChevronRight size={16} className="text-blue-400" /> {t("Sitemap")}
                </li>
              </ul>
            </div>

            {/* Sub-Column 3: Statistics */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-white/10 pb-1 whitespace-nowrap">
                {t("Statistics")}
              </h3>
              <div className="w-full bg-[#1e293b]/20 border border-white/10 rounded-xl p-2 shadow-md">
                <div className="flex flex-col gap-1.5">
                  {/* 1. Total Visitors Card */}
                  <div className="flex items-center gap-2.5 bg-[#1e3a8a]/30 border border-white/5 rounded-lg p-1.5">
                    <div className="bg-white/10 p-1.5 rounded-md flex items-center justify-center text-white">
                      <Users size={16} className="text-blue-100" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 leading-none mb-0.5">
                        {t("Total_Visitors")}
                      </span>
                      <p className="text-sm font-bold text-white tracking-wide leading-tight">
                        {statistics.totalVisitors?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>

                  {/* 2. Today's Count Card */}
                  <div className="flex items-center gap-2.5 bg-[#1e3a8a]/30 border border-white/5 rounded-lg p-1.5">
                    <div className="bg-white/10 p-1.5 rounded-md flex items-center justify-center text-white">
                      <UserCheck size={16} className="text-blue-100" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 leading-none mb-0.5">
                        {t("Today's Visitors")}
                      </span>
                      <p className="text-sm font-bold text-white tracking-wide leading-tight">
                        {statistics.todayVisitors || 0}
                      </p>
                    </div>
                  </div>

                  {/* 3. Last Updated Card */}
                  <div className="flex items-center gap-2.5 bg-[#1e3a8a]/30 border border-white/5 rounded-lg p-1.5">
                    <div className="bg-white/10 p-1.5 rounded-md flex items-center justify-center text-white">
                      <CalendarDays size={16} className="text-blue-100" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 leading-none mb-0.5">
                        {t("Last_Updated")}
                      </span>
                      <p className="text-xs font-semibold text-white tracking-wide leading-tight">
                        {statistics.lastUpdatedDate
                          ? new Date(statistics.lastUpdatedDate)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright Line */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-2">
          <p className="text-center text-white uppercase font-semibold text-xs md:text-sm">
            &copy; {new Date().getFullYear()} {t("Maharashtra State Board of Skill, Vocational Education and Training. All Rights Reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;