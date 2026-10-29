import { useEffect, useState,useContext } from "react";
import agent from "../../lib/api/agent";
import { GetMasterMainCourseApply } from "../../Endpoints_All/Registration/SDIRegistration";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext"; 
export default function ModeSelector({ mode, setMode, setInstituteEntity }) {
  const [courses, setCourses] = useState([]);
  const { color } = useContext(ThemeContext);
    const [selectedCourse, setSelectedCourse] = useState("");
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await agent.get(GetMasterMainCourseApply);

        if (response?.data?.Status === "Success") {
          setCourses(response.data.Data);
        }
      } catch (error) {
      }
    };

    loadCourses();
  }, []);

  return (
    <>
          <legend className={`text-xl font-semibold  ${color} border-0 rounded-lg  p-2 text-white ml-5`}>
        Institute Registration
      </legend>

      <div className="border-t border-2 border-gray-200 mb-4 mt-0 rounded-2xl"></div>

      <div className="flex flex-col gap-2 mb-5 px-6">
        {/*<label className="font-medium">*/}
        {/*  Application for <span className="text-[#DC3545]">*</span>*/}
        {/*</label>*/}

              <DropdownComponent
                  label="Application for"
                  required
                  value={selectedCourse}
                  options={courses.map((course) => ({
                      label: course.MainCourseName,
                      value: course.MainCourseId,
                  }))}
                  onChange={(value) => {
                      setSelectedCourse(value);

                      setInstituteEntity((prev) => ({
                          ...prev,
                          ApplicationFor: Number(value),
                      }));
                  }}
              />
      </div>

      <div className="mb-3 px-6">
        <label>
          Whether Existing training or New Training Institute
          <span className="text-[#DC3545]">*</span>
        </label>

        <table className="mt-2">
          <tbody>
            <tr className="flex gap-5">
              <td>
                <input
                  className="mr-2"
                  type="radio"
                  name="existingOrNew"
                  checked={mode === "existing"}
                  onChange={() => {
                    setMode("existing");
                    setInstituteEntity((prev) => ({
                      ...prev,
                      IsExistingInstitute: 1,
                    }));
                  }}
                />
                Existing
              </td>

              <td>
                <input
                  className="mr-2"
                  type="radio"
                  name="existingOrNew"
                  checked={mode === "new"}
                  onChange={() => {
                    setMode("new");
                    setInstituteEntity((prev) => ({
                      ...prev,
                      IsExistingInstitute: 0,
                    }));
                  }}
                />
                New Institute
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
