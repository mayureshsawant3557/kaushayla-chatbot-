import React, { useContext } from 'react';
import { FaBullhorn } from 'react-icons/fa';
import { ThemeContext } from "../Context/ThemeContext";
import ComingSoonImage from '../../assets/ComingSoon.jpg';

const ExamCircular = () => {
    const { color } = useContext(ThemeContext);

    return (
        <div className="w-full p-6">
            <fieldset className="rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaBullhorn className="mr-2 text-white" />
                    Exam Circular
                </legend>

                <div className="p-3">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-center">
                            <img
                                src={ComingSoonImage}
                                alt="Coming Soon"
                                className="mx-auto mb-4 rounded-lg"
                                style={{ width: '400px', height: '200px' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400x200?text=Coming+Soon';
                                }}
                            />
                            <p className="text-xl font-semibold text-gray-700 mt-4">
                                Exam circular will be available soon
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Please check back later for updates
                            </p>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default ExamCircular;
