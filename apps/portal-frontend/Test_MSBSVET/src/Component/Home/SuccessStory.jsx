import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SuccessStorie } from "../../Endpoints_All/SuccessStories/SuccessStories";
import publicAgent from "../../lib/api/publicAgent";

const SuccessStories = () => {
  const [successStories, setSuccessStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSuccessStories = async () => {
    try {
      setLoading(true);
      const response = await publicAgent.get(SuccessStorie);

      if (response.data.Status === "Success") {
        setSuccessStories(response.data.Data || []);
        setError(null);
      } else {
        setError("Failed to fetch success stories");
      }
    } catch (err) {
      setError("An error occurred while fetching success stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  useEffect(() => {
    if (successStories.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, successStories.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % successStories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? successStories.length - 1 : prevIndex - 1
    );
  };

  const getVisibleItems = () => {
    if (successStories.length === 0) return [];

    if (isMobile) {
      return [successStories[currentIndex]];
    } else {
      const items = [];
      const itemsToShow = Math.min(3, successStories.length);
      for (let i = 0; i < itemsToShow; i++) {
        const index = (currentIndex + i) % successStories.length;
        items.push(successStories[index]);
      }
      return items;
    }
  };

const showSuccessStoryDetails = (story) => {
    const modalContent = `
      <div style="padding: 0; text-align: left; color: #374151; font-family: Arial, sans-serif;">
        <!-- Header Profile Section -->
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          ${
            story.PhotoPath
              ? `<img src="${story.PhotoPath}" alt="${story.CandidateFullName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #3B82F6; flex-shrink: 0;" />`
              : `<div style="width: 80px; height: 80px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; border: 3px solid #3B82F6; flex-shrink: 0;">
                  <svg width="40" height="40" fill="#6B7280" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.7 5.4 14.4 5.5 14.2 5.7L10.4 9.5C10.1 9.8 10.1 10.3 10.4 10.6L12 12.2V22H14V12L11.6 9.6L14.8 6.4L20.1 7.9C20.6 8 21 8.4 21 9Z"/></svg>
                </div>`
          }
          <div>
            <div style="color: #0B2C6B; font-size: 18px; font-weight: 700; text-transform: uppercase; line-height: 1.2;">
              ${story.CandidateFullName || "N/A"}
            </div>
            <div style="color: #6B7280; font-size: 13px; margin-top: 4px;">
              Passing Year: <strong style="color: #1F2937;">${story.PassingYear || "N/A"}</strong>
            </div>
          </div>
        </div>

        <!-- Course Details -->
        <div style="display: grid; grid-template-columns: 75px 1fr; column-gap: 12px; row-gap: 8px; font-size: 13.5px; line-height: 1.4; margin-bottom: 16px;">
          <span style="font-weight: 600; color: #4B5563;">Course:</span>
          <span style="word-break: break-word;">${story.CourseNameCode || "N/A"}</span>

          <span style="font-weight: 600; color: #4B5563;">Institute:</span>
          <span style="word-break: break-word;">${story.InstituteNameCode || "N/A"}</span>
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />

        <!-- Selection / Achievement Section -->
        <div style="color: #059669; font-size: 15px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase;">
          Selection / Achievement
        </div>

        <div style="display: grid; grid-template-columns: 95px 1fr; column-gap: 12px; row-gap: 8px; font-size: 13.5px; line-height: 1.4;">
          <span style="font-weight: 600; color: #4B5563;">Designation:</span>
          <span style="word-break: break-word;">${story.PresentDesignation || "N/A"}</span>

          <span style="font-weight: 600; color: #4B5563;">Organization:</span>
          <span style="word-break: break-word;">${story.PresentOrganization || "N/A"}</span>

          <span style="font-weight: 600; color: #4B5563;">Selection Year:</span>
          <span>${story.SelectionYear || "N/A"}</span>
        </div>
      </div>
    `;

    Swal.fire({
      title:
        '<div style="text-align:left;color:#0B2C6B;font-size:20px;font-weight:700;padding:0;margin:0;">Success Story</div>',
      html: modalContent,
      width: "520px",
      padding: "1.5rem",
      showCloseButton: true,
      showConfirmButton: false,

      didOpen: () => {
        const popup = Swal.getPopup();
        const titleEl = Swal.getTitle();
        const htmlContainer = Swal.getHtmlContainer();
        const closeBtn = Swal.getCloseButton();

        if (popup) {
          popup.style.padding = "24px 28px";
        }
        if (titleEl) {
          titleEl.style.padding = "0";
          titleEl.style.margin = "0 0 16px 0";
          titleEl.style.width = "100%";
        }
        if (htmlContainer) {
          htmlContainer.style.margin = "0";
          htmlContainer.style.padding = "0";
          htmlContainer.style.width = "100%";
        }

        if (closeBtn) {
          closeBtn.style.position = "absolute";
          closeBtn.style.top = "20px";
          closeBtn.style.right = "20px";
          closeBtn.style.border = "none";
          closeBtn.style.outline = "none";
          closeBtn.style.boxShadow = "none";
          closeBtn.style.background = "transparent";
          closeBtn.style.color = "#9CA3AF";
          closeBtn.style.fontSize = "26px";
          closeBtn.style.fontWeight = "600";
          closeBtn.style.width = "32px";
          closeBtn.style.height = "32px";
          closeBtn.style.padding = "0";
          closeBtn.style.cursor = "pointer";
        }
      },
    });
  };

  const visibleItems = getVisibleItems();

  const renderCard = (story) => (
    <div
      key={story.ID}
      className={`transform transition-all duration-300 cursor-pointer ${
        isMobile ? "w-full" : "flex-1 min-w-0"
      }`}
      onClick={() => showSuccessStoryDetails(story)}
    >
      <div className="flex items-center border p-3 rounded-xl shadow-md w-full bg-white hover:shadow-lg transition-all duration-300 hover:bg-blue-50/50">
        <div className="flex-shrink-0 w-12 h-12 mr-3">
          {story.PhotoPath ? (
            <img
              src={story.PhotoPath}
              alt={story.CandidateFullName}
              className="w-full h-full object-cover rounded-full border border-blue-200"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border border-blue-200"
            style={{ display: story.PhotoPath ? "none" : "flex" }}
          >
            <User className="w-6 h-6 text-gray-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-sm font-bold text-gray-800 leading-tight truncate">
            {story.CandidateFullName}
          </h3>
          <p className="text-xs text-blue-600 font-medium truncate mt-0.5">
            {story.PresentDesignation} at {story.PresentOrganization}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col items-start justify-center w-full mx-auto">
          <div className="w-full text-left mb-6 border-b">
            <h1 className="text-lg font-semibold text-blue-500">Success Stories</h1>
          </div>
          <div className="w-full flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading success stories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col items-start justify-center w-full mx-auto">
          <div className="w-full text-left mb-6 border-b">
            <h1 className="text-lg font-semibold text-blue-500">Success Stories</h1>
          </div>
          <div className="w-full flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchSuccessStories}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (successStories.length === 0) {
    return (
      <div className="w-full bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col items-start justify-center w-full mx-auto">
          <div className="w-full text-left mb-6 border-b">
            <h1 className="text-lg font-semibold text-blue-500">Success Stories</h1>
          </div>
          <div className="w-full flex justify-center items-center py-20">
            <p className="text-gray-500">No success stories available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col items-start justify-center w-full mx-auto">
        <div className="w-full text-left mb-6 border-b pb-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-blue-500">Success Stories</h1>

          <button
            onClick={() => navigate("/Public/success-stories-publish")}
            className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline transition-colors flex items-center group cursor-pointer"
          >
            See more
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="w-full mt-4">
          <div className="relative">
            <div
              className={`flex transition-all duration-500 ease-in-out ${
                isMobile ? "justify-center" : "justify-between gap-4"
              }`}
            >
              {visibleItems.map((story) => renderCard(story))}
            </div>

            {successStories.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className={`absolute top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 z-10 border ${
                    isMobile ? "left-0 -translate-x-2" : "-left-6"
                  }`}
                >
                  <ChevronLeft
                    className={`text-gray-700 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
                  />
                </button>

                <button
                  onClick={nextSlide}
                  className={`absolute top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 z-10 border ${
                    isMobile ? "right-0 translate-x-2" : "-right-6"
                  }`}
                >
                  <ChevronRight
                    className={`text-gray-700 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;