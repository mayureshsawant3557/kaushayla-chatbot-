import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Search } from 'lucide-react';
import FormComponent from '../formcomponent/FormComponent';
import DropdownComponent from '../formcomponent/DropdownComponent';

const AddQuestionBank = () => {
    const [formData, setFormData] = useState({
        sector: '',
        courseCategory: '',
        courseCode: ''
    });

    const [dropdownOptions, setDropdownOptions] = useState({
        sectors: [],
        courseCategories: [],
        courseCodes: []
    });

    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [activeStatusFilter, setActiveStatusFilter] = useState('all');
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searching, setSearching] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [questionForm, setQuestionForm] = useState({
        question: {
            text: '',
            fileType: 'text',
            image: null
        },
        correctOption: {
            text: '',
            fileType: 'text',
            image: null
        },
        option1: {
            text: '',
            fileType: 'text',
            image: null
        },
        option2: {
            text: '',
            fileType: 'text',
            image: null
        },
        option3: {
            text: '',
            fileType: 'text',
            image: null
        },
        status: 'pending'
    });

    // Sample data - Replace with actual API calls
    useEffect(() => {
        // Load dropdown options
        setDropdownOptions({
            sectors: [
                { id: 1, name: 'Technology' },
                { id: 2, name: 'Healthcare' },
                { id: 3, name: 'Finance' }
            ],
            courseCategories: [
                { id: 1, name: 'Programming' },
                { id: 2, name: 'Database' },
                { id: 3, name: 'Web Development' }
            ],
            courseCodes: [
                { id: 1, name: 'CS101 - Introduction to Programming', code: 'CS101' },
                { id: 2, name: 'DB201 - Database Management', code: 'DB201' },
                { id: 3, name: 'WD301 - Advanced Web Development', code: 'WD301' }
            ]
        });

        // Sample subjects data
        setSubjects([
            { id: 1, name: 'Subject 1', courseCode: 'CS101', courseName: 'Introduction to Programming' },
            { id: 2, name: 'Subject 2', courseCode: 'DB201', courseName: 'Database Management' },
            { id: 3, name: 'Subject 3', courseCode: 'WD301', courseName: 'Advanced Web Development' }
        ]);

        // Sample questions data
        setQuestions([
            {
                id: 1,
                sn: 1,
                question: '2+2',
                correctOption: '4',
                option1: '3',
                option2: '5',
                option3: '6',
                status: 'Approved',
                remark: "Freeze-don't edit",
                subjectId: 1
            },
            {
                id: 2,
                sn: 2,
                question: '3+3',
                correctOption: '6',
                option1: '5',
                option2: '7',
                option3: '8',
                status: 'pending',
                remark: "Edit",
                subjectId: 1
            }
        ]);
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            filterQuestions();
        }
    }, [questions, activeStatusFilter, selectedSubject]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = async () => {
        setSearching(true);
        setHasSearched(true);

        // Simulate API call
        setTimeout(() => {
            setSearching(false);
            setFilteredSubjects(subjects);
        }, 1000);
    };

    const handleReset = () => {
        setFormData({
            sector: '',
            courseCategory: '',
            courseCode: ''
        });
        setFilteredSubjects([]);
        setHasSearched(false);
        setSelectedSubject(null);
        setShowQuestions(false);
        setShowAddQuestion(false);
        setIsEditing(false);
        setEditingQuestion(null);
    };

    const handleSubjectClick = (subject) => {
        setSelectedSubject(subject);
        setShowQuestions(true);
        setShowAddQuestion(false);
        setIsEditing(false);
        setEditingQuestion(null);
        filterQuestions();
    };

    const filterQuestions = () => {
        if (!selectedSubject) return;

        let filtered = questions.filter(q => q.subjectId === selectedSubject.id);

        if (activeStatusFilter !== 'all') {
            filtered = filtered.filter(question =>
                question.status.toLowerCase() === activeStatusFilter.toLowerCase()
            );
        }

        setFilteredQuestions(filtered);
    };

    const handleStatusFilter = (status) => {
        setActiveStatusFilter(status);
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setIsEditing(true);
        setShowAddQuestion(false);

        // Populate form with existing question data
        setQuestionForm({
            question: {
                text: question.question,
                fileType: 'text',
                image: null
            },
            correctOption: {
                text: question.correctOption,
                fileType: 'text',
                image: null
            },
            option1: {
                text: question.option1,
                fileType: 'text',
                image: null
            },
            option2: {
                text: question.option2,
                fileType: 'text',
                image: null
            },
            option3: {
                text: question.option3,
                fileType: 'text',
                image: null
            },
            status: question.status.toLowerCase()
        });
    };

    const handleAddQuestion = () => {
        setShowAddQuestion(true);
        setIsEditing(false);
        setEditingQuestion(null);

        // Reset form for new question
        setQuestionForm({
            question: { text: '', fileType: 'text', image: null },
            correctOption: { text: '', fileType: 'text', image: null },
            option1: { text: '', fileType: 'text', image: null },
            option2: { text: '', fileType: 'text', image: null },
            option3: { text: '', fileType: 'text', image: null },
            status: 'pending'
        });
    };

    const handleQuestionFormChange = (field, value) => {
        if (field.includes('.')) {
            const [section, subField] = field.split('.');
            setQuestionForm(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [subField]: value
                }
            }));
        } else {
            setQuestionForm(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleFileUpload = (section, file) => {
        setQuestionForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                image: file,
                fileType: 'image'
            }
        }));
    };

    const handleSubmitQuestion = async () => {
        try {
            if (!questionForm.question.text && !questionForm.question.image) {
                Swal.fire('Error', 'Question is required', 'error');
                return;
            }

            if (isEditing) {
                // Update existing question
                setQuestions(prev => prev.map(q =>
                    q.id === editingQuestion.id ? {
                        ...q,
                        question: questionForm.question.text,
                        correctOption: questionForm.correctOption.text,
                        option1: questionForm.option1.text,
                        option2: questionForm.option2.text,
                        option3: questionForm.option3.text,
                        status: questionForm.status
                    } : q
                ));
                Swal.fire('Success', 'Question updated successfully!', 'success');
            } else {
                // Add new question logic here
                Swal.fire('Success', 'Question added successfully!', 'success');
            }

            setShowAddQuestion(false);
            setIsEditing(false);
            setEditingQuestion(null);

        } catch (error) {
            Swal.fire('Error', isEditing ? 'Failed to update question' : 'Failed to add question', 'error');
        }
    };

    const handleStatusChange = async (questionId, newStatus) => {
        try {
            setQuestions(prev => prev.map(question =>
                question.id === questionId ? { ...question, status: newStatus } : question
            ));

            Swal.fire('Success', 'Status updated successfully!', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const renderFileInput = (section, label) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="space-y-2">
                <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`${section}_type`}
                            value="text"
                            checked={questionForm[section].fileType === 'text'}
                            onChange={(e) => handleQuestionFormChange(`${section}.fileType`, 'text')}
                            className="mr-2"
                        />
                        Text
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`${section}_type`}
                            value="image"
                            checked={questionForm[section].fileType === 'image'}
                            onChange={(e) => handleQuestionFormChange(`${section}.fileType`, 'image')}
                            className="mr-2"
                        />
                        Image
                    </label>
                </div>

                {questionForm[section].fileType === 'text' ? (
                    <FormComponent
                        label=""
                        value={questionForm[section].text}
                        onChange={(value) => handleQuestionFormChange(`${section}.text`, value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        multiline={true}
                        rows={3}
                    />
                ) : (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(section, e.target.files[0])}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-full mx-auto p-3 sm:p-6 bg-white-100 min-h-screen">
            {/* No Records Found Alert */}
            {hasSearched && filteredSubjects.length === 0 && !searching && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
                    No Records Found.
                </div>
            )}

            {/* Search Section - Always visible */}
            <fieldset className="rounded border border-gray-300 p-4 mb-5">
                <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search Question Bank
                    </div>
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Sector Dropdown */}
                    <div>
                        <DropdownComponent
                            label="Sector"
                            value={formData.sector}
                            onChange={(value) => handleInputChange('sector', value)}
                            options={dropdownOptions.sectors}
                            placeholder="-- Select Sector --"
                        />
                    </div>

                    {/* Course Category Dropdown */}
                    <div>
                        <DropdownComponent
                            label="Course Category"
                            value={formData.courseCategory}
                            onChange={(value) => handleInputChange('courseCategory', value)}
                            options={dropdownOptions.courseCategories}
                            placeholder="-- Select Course Category --"
                        />
                    </div>

                    {/* Course Code Dropdown */}
                    <div>
                        <DropdownComponent
                            label="Course and Code"
                            value={formData.courseCode}
                            onChange={(value) => handleInputChange('courseCode', value)}
                            options={dropdownOptions.courseCodes}
                            placeholder="-- Select Course --"
                        />
                    </div>
                </div>

                {/* Action Buttons - Centered */}
                <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="w-full font-bold sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {searching ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Searching...
                            </>
                        ) : (
                            'Search'
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full font-bold sm:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Reset
                    </button>
                </div>
            </fieldset>

            {/* Subjects List Section - Show only after search */}
            {hasSearched && filteredSubjects.length > 0 && (
                <fieldset className="rounded border border-gray-300 p-4 mb-5">
                    <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                        Subjects List
                    </legend>

                    <div className="mt-4 space-y-2">
                        {filteredSubjects.map((subject, index) => (
                            <div key={subject.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <button
                                    onClick={() => handleSubjectClick(subject)}
                                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                                            <span className="ml-2 text-blue-600 font-medium hover:underline">{subject.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">{subject.courseName}</div>
                                            <div className="text-xs text-gray-500">Code: {subject.courseCode}</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                </fieldset>
            )}

            {/* Questions Section - Show only when subject is selected */}
            {showQuestions && selectedSubject && (
                <>
                    {/* Status Filter Buttons */}
                    <fieldset className="rounded border border-gray-300 p-4 mb-5">
                        <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                            Questions - {selectedSubject.name}
                        </legend>

                        <div className="mt-4 flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => handleStatusFilter('all')}
                                className={`px-4 py-2 rounded-md transition duration-200 text-sm font-medium border ${activeStatusFilter === 'all'
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-white border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleStatusFilter('approved')}
                                className={`px-4 py-2 rounded-md transition duration-200 text-sm font-medium border ${activeStatusFilter === 'approved'
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-white border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => handleStatusFilter('pending')}
                                className={`px-4 py-2 rounded-md transition duration-200 text-sm font-medium border ${activeStatusFilter === 'pending'
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-white border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => handleStatusFilter('hold')}
                                className={`px-4 py-2 rounded-md transition duration-200 text-sm font-medium border ${activeStatusFilter === 'hold'
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-white border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                Hold
                            </button>
                        </div>

                        {/* Desktop Table View */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-2 py-1">S.N.</th>
                                        <th className="border border-gray-300 px-2 py-1">Question</th>
                                        <th className="border border-gray-300 px-2 py-1">Correct Option</th>
                                        <th className="border border-gray-300 px-2 py-1">Option 1</th>
                                        <th className="border border-gray-300 px-2 py-1">Option 2</th>
                                        <th className="border border-gray-300 px-2 py-1">Option 3</th>
                                        <th className="border border-gray-300 px-2 py-1">Status</th>
                                        <th className="border border-gray-300 px-2 py-1">Remark</th>
                                        <th className="border border-gray-300 px-2 py-1">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQuestions.length > 0 ? (
                                        filteredQuestions.map((question) => (
                                            <tr key={question.id}>
                                                <td className="border border-gray-300 px-2 py-1">{question.sn}</td>
                                                <td className="border border-gray-300 px-2 py-1">{question.question}</td>
                                                <td className="border border-gray-300 px-2 py-1">{question.correctOption}</td>
                                                <td className="border border-gray-300 px-2 py-1">{question.option1}</td>
                                                <td className="border border-gray-300 px-2 py-1">{question.option2}</td>
                                                <td className="border border-gray-300 px-2 py-1">{question.option3}</td>
                                                <td className="border border-gray-300 px-2 py-1">
                                                    <select
                                                        value={question.status}
                                                        onChange={(e) => handleStatusChange(question.id, e.target.value)}
                                                        className="px-2 py-1 rounded text-xs font-medium border border-gray-300 bg-white appearance-none"
                                                    >
                                                        <option value="Approved">Approved</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="hold">Hold</option>
                                                    </select>
                                                </td>
                                                <td className="border border-gray-300 px-2 py-1">{question.remark}</td>
                                                <td className="border border-gray-300 px-2 py-1">
                                                    <button
                                                        onClick={() => handleEdit(question)}
                                                        className="text-blue-600 hover:text-blue-900 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-center" colSpan={9}>
                                                No questions found for the selected status.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Single Add Question Button */}
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={handleAddQuestion}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 font-medium"
                            >
                                Add Question
                            </button>
                        </div>
                    </fieldset>
                </>
            )}

            {/* Add/Edit Question Form */}
            {(showAddQuestion || isEditing) && (
                <fieldset className="rounded border border-gray-300 p-4">
                    <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                        {isEditing ? 'Edit Question' : 'Add New Question'}
                    </legend>

                    <div className="mt-4 space-y-6">
                        {renderFileInput('question', 'Question')}
                        {renderFileInput('correctOption', 'Correct Option')}
                        {renderFileInput('option1', 'Option 1')}
                        {renderFileInput('option2', 'Option 2')}
                        {renderFileInput('option3', 'Option 3')}

                        <div className="mb-4">
                            <DropdownComponent
                                label="Status"
                                value={questionForm.status}
                                onChange={(value) => handleQuestionFormChange('status', value)}
                                options={[
                                    { id: 'pending', name: 'Pending' },
                                    { id: 'approved', name: 'Approved' },
                                    { id: 'hold', name: 'Hold' }
                                ]}
                                required={true}
                                placeholder="-- Select Status --"
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmitQuestion}
                                className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 font-medium"
                            >
                                {isEditing ? 'Update Question' : 'Submit Question'}
                            </button>
                        </div>
                    </div>
                </fieldset>
            )}
        </div>
    );
};

export default AddQuestionBank;
