import { useEffect } from "react";
import Swal from "sweetalert2";

function ReservedWordPopUp({ close }) {
  useEffect(() => {
    Swal.fire({
      showConfirmButton: false,
      width: "800px",
      background: "white",
      customClass: {
        popup: "p-0 rounded-lg overflow-hidden shadow-lg swal-full",
        htmlContainer: "swal-full-html",
      },

      html: `
        <div class="w-full">

          <div class="bg-[#002b5c] px-8 py-5 flex items-center justify-between">
  <h2 class="text-2xl font-semibold text-white">
    List of reserved words
  </h2>

  <button 
    id="rw-close-btn" 
    class="bg-red-500 text-white rounded px-3 py-1 text-lg hover:bg-red-600"
  >
    X
  </button>
</div>


   <div class="px-12 pt-6 pb-4 ml-8">
  <ul class="list-disc text-red-600 space-y-2 text-[17px] flex flex-col items-start">
    <li>Following words cannot be included in the Name of Institute</li>
    <li>MSBSVET reserves the right to include more words in reserved words category</li>
    <li>MSBSVET reserves the right to change the Proposed Name of the Institute</li>
  </ul>
</div>



          <div class="px-12 pb-10 mt-2">
            <table class="w-full text-left text-gray-800 text-[18px] font-normal border-separate border-spacing-y-3">
              <tbody>

                <tr class="border-b border-gray-300">
                  <td>India</td>
                  <td>Indian</td>
                  <td>Maharashtra</td>
                  <td>National</td>
                </tr>

                <tr class="border-b border-gray-300">
                  <td>Central</td>
                  <td>State</td>
                  <td>International</td>
                  <td>Medical</td>
                </tr>

                <tr class="border-b border-gray-300">
                  <td>Engineering</td>
                  <td>Polytechnic</td>
                  <td>Industrial Training Institute</td>
                  <td>ITI</td>
                </tr>

                <tr class="border-b border-gray-300">
                  <td>I.T.I.</td>
                  <td>Paramedical</td>
                  <td>IIT</td>
                  <td>Council</td>
                </tr>

                <tr class="border-b border-gray-300">
                  <td>Board</td>
                  <td>College</td>
                  <td>School</td>
                  <td></td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      `,
      didOpen: () => {
        document.getElementById("rw-close-btn").onclick = () => {
          Swal.close();
          close(false);
        };
      },
      willClose: () => close(false),
    });
  }, [close]);

  return null;
}

export default ReservedWordPopUp;
