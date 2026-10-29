import React, { useState } from "react";

const AddSucessStory = () => {
    // Predefined dropdown options
    const genderOptions = ["Male", "Female", "Other"];
    const handicapTypeOptions = [
        "Visual Impairment",
        "Hearing Impairment",
        "Mobility Impairment",
        "Cognitive Impairment",
        "Multiple Disabilities",
        "None"
    ];
    const courseNameOptions = [
        "Engineering",
        "Medical",
        "Management",
        "Arts",
        "Science",
        "Commerce"
    ];
    const designationOptions = [
        "Student",
        "Professional",
        "Entrepreneur",
        "Researcher",
        "Other"
    ];
    const instituteNameOptions = [
        "IIT",
        "NIT",
        "Medical College",
        "Management Institute",
        "University of Delhi",
        "Other"
    ];

    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        handicapType: "",
        designation: "",
        instituteName: "",
        courseName: "",
    });
    const [dataList, setDataList] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = (publish = false) => {
        // Validate form data
        if (!formData.name || !formData.gender || !formData.handicapType ||
            !formData.designation || !formData.instituteName || !formData.courseName) {
            alert("Please fill in all fields");
            return;
        }

        if (isEditing) {
            const updatedList = [...dataList];
            updatedList[editIndex] = { ...formData, status: publish ? "Published" : "Saved" };
            setDataList(updatedList);
            setIsEditing(false);
            setEditIndex(null);
        } else {
            setDataList([...dataList, { ...formData, status: publish ? "Published" : "Saved" }]);
        }
        setFormData({
            name: "",
            gender: "",
            handicapType: "",
            designation: "",
            instituteName: "",
            courseName: ""
        });
    };

    const handleEdit = (index) => {
        setFormData(dataList[index]);
        setIsEditing(true);
        setEditIndex(index);
    };

    const handleDelete = (index) => {
        setDataList(dataList.filter((_, i) => i !== index));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <style>
                {`
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    * {
                        scrollbar-width: none;
                    }
                `}
            </style>

            <h2 className="text-2xl font-bold mb-6">Success Story</h2>

            {/* Input Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold mb-4">Enter Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="p-3 border border-gray-300 rounded-lg w-full"
                    />
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg w-full"
                    >
                        <option value="">Select Gender</option>
                        {genderOptions.map((gender) => (
                            <option key={gender} value={gender}>{gender}</option>
                        ))}
                    </select>
                    <select
                        name="handicapType"
                        value={formData.handicapType}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg w-full"
                    >
                        <option value="">Select Handicap Type</option>
                        {handicapTypeOptions.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg w-full"
                    >
                        <option value="">Select Designation</option>
                        {designationOptions.map((designation) => (
                            <option key={designation} value={designation}>{designation}</option>
                        ))}
                    </select>
                    <select
                        name="instituteName"
                        value={formData.instituteName}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg w-full"
                    >
                        <option value="">Select Institute</option>
                        {instituteNameOptions.map((institute) => (
                            <option key={institute} value={institute}>{institute}</option>
                        ))}
                    </select>
                    <select
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg w-full"
                    >
                        <option value="">Select Course</option>
                        {courseNameOptions.map((course) => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-6 flex space-x-4">
                    <button
                        onClick={() => handleSave(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Save & Publish
                    </button>
                </div>
            </div>

            {/* Table Display */}
            <h3 className="text-lg font-semibold mb-4">Inserted Data</h3>
            <div
                className="overflow-x-auto"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                }}
            >
                <table className="w-full border border-gray-300 bg-white rounded-lg shadow-md">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 p-3 text-left">Name</th>
                            <th className="border border-gray-300 p-3 text-left">Gender</th>
                            <th className="border border-gray-300 p-3 text-left">Handicap Type</th>
                            <th className="border border-gray-300 p-3 text-left">Designation</th>
                            <th className="border border-gray-300 p-3 text-left">Institute Name</th>
                            <th className="border border-gray-300 p-3 text-left">Course Name</th>
                            <th className="border border-gray-300 p-3 text-left">Status</th>
                            <th className="border border-gray-300 p-3 text-left">Published/Not Published</th>
                            <th className="border border-gray-300 p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataList.length > 0 ? (
                            dataList.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                    <td className="border border-gray-300 p-3">{item.name}</td>
                                    <td className="border border-gray-300 p-3">{item.gender}</td>
                                    <td className="border border-gray-300 p-3">{item.handicapType}</td>
                                    <td className="border border-gray-300 p-3">{item.designation}</td>
                                    <td className="border border-gray-300 p-3">{item.instituteName}</td>
                                    <td className="border border-gray-300 p-3">{item.courseName}</td>
                                    <td className="border border-gray-300 p-3">{item.status}</td>
                                    <td className="border border-gray-300 p-3">
                                        {item.status === "Published" ? (
                                            <span className="text-green-500">Published</span>
                                        ) : (
                                            <span className="text-yellow-500">Not Published</span>
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-3 flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="text-center p-4 text-gray-500 font-medium"
                                >
                                    No data available. Please add new entries.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddSucessStory;