import { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const VisitScheduler = () => {
    const upcomingDates = [
        {
            id: 1,
            date: 'April 15, 2025',
            time: '10:00 AM - 12:00 PM',
            purpose: 'Initial Consultation'
        },
        {
            id: 2,
            date: 'April 22, 2025',
            time: '2:00 PM - 4:00 PM',
            purpose: 'Follow-up Meeting'
        },
        {
            id: 3,
            date: 'May 5, 2025',
            time: '11:00 AM - 1:00 PM',
            purpose: 'Detailed Discussion'
        }
    ];

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                <MapPin className="mr-2 text-blue-500" />
                MSBSVET Office Visits
            </h2>

            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Calendar className="mr-2 text-green-500" />
                    Upcoming Visits
                </h3>
                {upcomingDates.map((visit) => (
                    <div
                        key={visit.id}
                        className="p-3 mb-2 border rounded-lg hover:bg-gray-50"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">{visit.date}</p>
                                <p className="text-sm text-gray-600 flex items-center">
                                    <Clock className="mr-1 h-4 w-4" />
                                    {visit.time}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm mt-1 text-gray-500">{visit.purpose}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisitScheduler;