import { useState, useEffect, useCallback } from "react";
import SchoolsTable from "../../Component/SchoolStep/SchoolsTable";
import AddSchoolForm from "../../Component/SchoolStep/AddSchoolForm";
// import CoursesTable from "../../Component/SchoolStep/CoursesTable";
import { GetSchoolDetail } from "../../Endpoints_All/SchoolStep/school";
import { FileText } from "lucide-react";
import { SwalHelper } from "../../utils/swalHelper";
import agent from "../../lib/api/agent";
import { useRef } from "react";

const SchoolsPage = () => {
  // const [schools, setSchools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [loading, setLoading] = useState(false); // restored
  const [schoolStatus, setSchoolStatus] = useState(null);
  const schoolTableRef = useRef();

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      // If SchoolsTable handles its own fetching,
      // you can later remove this safely.
    } catch (error) {
      SwalHelper.error("Error", "Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleAddClick = () => {
    setEditingSchool(null);
    setShowForm(true);
  };

  const handleEditSchool = async (school) => {
    try {
      setLoading(true);

      const response = await agent.get(GetSchoolDetail, {
        params: { schoolId: school.id },
      });

      const schoolData = response.data?.Table?.[0];
      const courseData = response.data?.Table1 || [];

      if (!schoolData) {
        throw new Error("School details not found");
      }

      const formattedCourses = courseData.map((c, index) => ({
        id: c.CourseID,
        sno: index + 1,
        course: c.CourseID,
        courseName: c.CourseName,
        sector: c.Sector,
        courseType: c.CourseType,
        duration: `${c.Duration} ${c.DurationUnit}`,
        IsDeleteAllowed: true,
      }));

      setEditingSchool({
        ...schoolData,
        courses: formattedCourses,
      });
      setSchoolStatus(
        schoolData.VerificationStatus === "P"
          ? "pending_verification"
          : schoolData.VerificationStatus === "V"
            ? "verified"
            : "draft",
      );

      setShowForm(true);
    } catch (error) {
      SwalHelper.error("Error", "Failed to load school details");
    } finally {
      setLoading(false);
    }
  };

  // const handleDeleteSchool = async (school) => {
  //   Swal.fire({
  //     icon: "info",
  //     title: "Delete Disabled",
  //     text: "Delete functionality is currently disabled.",
  //   });
  // };

  const handleSave = async () => {
    try {
      setLoading(true);

      await SwalHelper.success(
        editingSchool
          ? "School updated successfully!"
          : "School added successfully!",
        "",
        { timer: 2000, showConfirmButton: false },
      );

      // Close form first
      setShowForm(false);
      setEditingSchool(null);

      // Then refresh table
      schoolTableRef.current?.refreshSchools();
    } catch (error) {
      SwalHelper.error("Error", "Failed to save school");
    } finally {
      setLoading(false);
    }
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchool(null);
  };

  return (
    <div className="p-6 bg-[#f4f6f9] min-h-screen">
      <div className="bg-white rounded-xl shadow-md px-10 py-8">
        <div className="inline-flex items-center bg-[#6b7280] text-white px-4 py-3 rounded-lg mb-6 text-base font-semibold">
          <FileText size={20} className="mr-2" />
          Schools Details
        </div>

        <SchoolsTable
          ref={schoolTableRef}
          // schools={schools}
          loading={loading}
          onEditSchool={handleEditSchool}
          // onDeleteSchool={handleDeleteSchool}
          onAddClick={handleAddClick}
        />

        {showForm && (
          <div className="mt-8">
            <AddSchoolForm
              key={editingSchool ? editingSchool.SchoolID : "add"}
              initialData={editingSchool}
              isEdit={!!editingSchool}
              mouStatus={schoolStatus}
              onStatusChange={(status) => {
                setSchoolStatus(status);
                schoolTableRef.current?.refreshSchools();
              }}
              onClose={handleCloseForm}
              onSave={handleSave}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolsPage;
