const CourseInformationPopup = ({ courseInfo, onClose, selectedCourseName, selectedCourseCode }) => {
    if (!courseInfo || courseInfo.length === 0) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl overflow-hidden">

                {/* Header */}
                <div style={{ background: "#062568" }} className="px-5 py-4 text-center">
                    <h2 className="text-white text-xl font-semibold m-0">
                        Course Information
                    </h2>
                </div>

                {/* Body */}
                <div className="px-6 py-5 text-gray-800">

                    {/* Dynamic message */}
                    <p className="text-sm mb-4 leading-relaxed">
                        By selecting course{" "}
                        <span className="font-semibold">
                            {selectedCourseName}
                            {selectedCourseCode ? ` (${selectedCourseCode})` : ""}
                        </span>
                        , you shall be able to create batches for the following courses:
                    </p>

                    {/* Course List */}
                    <ol className="list-decimal pl-5 text-sm leading-7">
                        {courseInfo.map((course, index) => (
                            <li key={index}>
                                {course.CourseNameDisplay}
                            </li>
                        ))}
                    </ol>

                    {/* Footer */}
                    <div className="border-t border-gray-200 mt-6 pt-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-500 text-sm font-medium rounded hover:bg-gray-100"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseInformationPopup;