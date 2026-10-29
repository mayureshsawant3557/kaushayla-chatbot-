import { useEffect } from "react";
import Swal from "sweetalert2";

function ErrorListPopup({ fields = [], onClose }) {
  useEffect(() => {
    if (!fields || fields.length === 0) return;

    const htmlContent = `
      <div>
        <div class="bg-[#002b5c] px-8 py-5 flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-white">
            ⚠️ ${fields.length} Error${fields.length > 1 ? "s" : ""}
          </h2>
        </div>

        <div class="px-10 py-6 max-h-[350px] overflow-y-auto">
          <ul class="list-disc text-red-600 space-y-3 text-[18px] text-left">
            ${fields.map((field) => `<li>${field}</li>`).join("")}
          </ul>
        </div>

        <div class="flex justify-end pb-6 pr-6">
          <button 
            id="error-close-btn" 
            class="bg-red-500 text-white rounded px-5 py-2 text-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    `;

    Swal.fire({
      showConfirmButton: false,
      width: "900px",
      background: "white",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "p-0 rounded-lg overflow-hidden shadow-xl",
        htmlContainer: "swal-full-html",
      },
      html: htmlContent,
      didOpen: () => {
        const btn = document.getElementById("error-close-btn");
        if (btn) {
          btn.onclick = () => {
            Swal.close();
          };
        }
      },
      willClose: () => {
        if (onClose) onClose(false);
      },
    });
  }, [fields]);

  return null;
}

export default ErrorListPopup;
