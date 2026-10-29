import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import BoardLogo from "../../assets/Board Logo - small size.jpg";
import Maharashtra from "../../assets/Maharashtra.png";
import independencedayindia20 from "../../assets/independencedayindia20.jpg";
import profilePic from "../../assets/profilePic.png";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { AccountLogout } from "../../Endpoints_All/Account/authentication";
import { useAuth } from "../../hooks/AuthContext";
import { ASPXbaseURL } from "../../Endpoints_All/config/baseConfig";

const MaharashtraHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // AuthContext → Always in sync
  const { isLoggedIn, userInfo, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // wraps the avatar/badge button
  const dropdownPanelRef = useRef(null); // the portaled dropdown panel itself
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const profilePhotoPath = userInfo?.PhotoPath || profilePic;
  const userLoginId = userInfo?.UserLoginID || "";

  // Recalculate the dropdown's screen position whenever it opens
  // (portal renders to document.body, so it needs explicit fixed coords
  // instead of relying on a positioned ancestor).
  useLayoutEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8, // 8px gap, mirrors the old mt-3-ish spacing
        right: window.innerWidth - rect.right,
      });
    }
  }, [showDropdown]);

  // Close dropdown on click outside (checks both the button wrapper AND
  // the portaled panel, since they're no longer DOM-nested).
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      const clickedButton =
        dropdownRef.current && dropdownRef.current.contains(e.target);
      const clickedPanel =
        dropdownPanelRef.current && dropdownPanelRef.current.contains(e.target);
      if (!clickedButton && !clickedPanel) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = async () => {
    Swal.fire({
      title: "Confirm logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#38a169",
      confirmButtonText: "Logout",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Signing out...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      // Call Logout API
      try {
        const response = await fetch(AccountLogout, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserID: userInfo?.UserID || 0,
            LoggedInSessionID: userInfo?.LoggedInSessionID || 0,
          }),
        });
      } catch (err) {}

      // Clear global auth state
      logout();

      Swal.close();

      // redirect to home
      window.location.href = ASPXbaseURL;
      //navigate({ ASPXbaseURL }, { replace: true });
    });
  };

  return (
    // z-index lowered from z-[50] -> z-40. Same fix as Navigation.jsx:
    // this header was stacking above the app's global loading overlay
    // (which typically renders at a much higher z-index, e.g. z-[100]/
    // z-[9999]), so the header stayed visible on top of the loading
    // screen instead of being covered by it. Matching the nav's z-40
    // keeps the header below that overlay threshold. The profile badge
    // (z-[75]) and the portaled dropdown (z-[9999], rendered straight to
    // document.body) are unaffected — they're a separate, intentional
    // interactive layer and weren't part of the reported issue.
    <div
      className="flex w-full items-center justify-between px-1 py-2 relative z-40 bg-white border-b border-gray-200 text-gray-800 text-sm"
      style={{ fontFamily: "Poppins, sans-serif", lineHeight: "1.8" }}
    >
      {/* Logo Section */}
      <div className="flex-1 flex justify-center bg-white">
        <div className="flex items-center max-w-4xl w-full">
          <div className="mr-1 flex items-center bg-white">
            <img
              src={independencedayindia20}
              alt="Logo"
              className="h-12 sm:h-16 md:h-20 lg:h-24 object-contain"
            />
            <img
              src={Maharashtra}
              alt="Board Logo"
              className="ml-2 h-12 sm:h-16 md:h-20 lg:h-24 object-contain"
            />
          </div>

          <div className="mx-1 flex-1 text-center lg:mx-2 pl-10">
            <h5 className="m-0 text-xs font-medium text-[#002060] sm:text-sm">
              {t("Government_of_Maharashtra")}
            </h5>
            <h5 className="m-0 text-xs font-medium text-[#002060] sm:text-sm">
              {t("Skill_Employment_Entrepreneurship_and_Innovation_Department")}
            </h5>
            <h4 className="m-0 text-lg font-bold text-[#002060] sm:text-base md:text-lg">
              {t(
                "Maharashtra_State_Board_of_Skill_Vocational_Education_and_Training",
              )}
            </h4>
          </div>

          <div className="ml-1 flex items-center pl-5 bg-white">
            <img
              src={BoardLogo}
              alt="Board Logo"
              className="ml-2 h-12 sm:h-16 md:h-20 lg:h-24 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Profile Section */}
      {isLoggedIn && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[75]">
          {/* Profile Button — dropdownRef is used to measure its
                        position so the portaled panel below can place itself */}
          <div ref={dropdownRef} className="flex flex-col items-center">
            <div
              className="cursor-pointer rounded-full border-2 border-blue-500 p-1 shadow-md hover:scale-105 transition"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={profilePhotoPath}
                className="h-12 w-12 rounded-full object-cover"
                alt="User Profile"
                onError={(e) => (e.target.src = profilePic)}
              />
            </div>

            {/* User ID */}
            <div className="mt-1 text-xs font-medium text-white bg-blue-600 px-2 py-0.5 rounded-full shadow">
              {userLoginId}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Panel — rendered via a Portal directly into
                document.body. This makes it immune to any ancestor's
                stacking context (Header / Navigation z-index, transforms,
                overflow, etc.) since it's no longer a DOM descendant of any
                of them. Position is computed in the useLayoutEffect above. */}
      {isLoggedIn &&
        showDropdown &&
        createPortal(
          <div
            ref={dropdownPanelRef}
            className="fixed w-64 bg-white rounded-xl shadow-lg border p-4 animate-fadeIn z-[9999]"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">User Profile</span>
              <button onClick={() => setShowDropdown(false)}>
                <X size={18} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={profilePhotoPath}
                className="w-12 h-12 rounded-full border"
                onError={(e) => (e.target.src = profilePic)}
                alt="Profile"
              />

              <div>
                <div className="font-medium text-gray-800">
                  {userInfo?.Name || "User"}
                </div>
                <div className="text-xs text-gray-500">ID: {userLoginId}</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>,
          document.body,
        )}

      {/* Fade Animation */}
      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
    </div>
  );
};

export default MaharashtraHeader;