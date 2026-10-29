import  { useState } from 'react'
import {  Clock, CalendarDays, VideoIcon, Trash2 } from 'lucide-react'

// Generate date options for next 7 days
const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
};

// Predefined time slots with availability
const timeSlots = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '13:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
];

const MeetingScheduler = () => {
    const [meetings, setMeetings] = useState([]);
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        date: '',
        time: '',
    });
    const [availableDates] = useState(generateDateOptions());
    const [availableTimeSlots, setAvailableTimeSlots] = useState(timeSlots);

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setNewMeeting(prev => ({
            ...prev,
            date: selectedDate,
            time: '' // Reset time when date changes
        }));
    };

    const handleTimeChange = (e) => {
        setNewMeeting(prev => ({
            ...prev,
            time: e.target.value
        }));
    };

    const scheduleMeeting = () => {
        if (newMeeting.title && newMeeting.date && newMeeting.time) {
            const meetingToAdd = {
                ...newMeeting,
                id: Date.now()
            };

            // Update available time slots
            const updatedTimeSlots = availableTimeSlots.map(slot =>
                slot.time === newMeeting.time
                    ? { ...slot, available: false }
                    : slot
            );

            setMeetings(prev => [...prev, meetingToAdd]);
            setAvailableTimeSlots(updatedTimeSlots);

            // Reset form
            setNewMeeting({
                title: '',
                date: '',
                time: '',
            });
        }
    };

    const deleteMeeting = (id, time) => {
        // Remove the meeting
        setMeetings(prev => prev.filter(meeting => meeting.id !== id));

        // Restore the time slot's availability
        const updatedTimeSlots = availableTimeSlots.map(slot =>
            slot.time === time
                ? { ...slot, available: true }
                : slot
        );
        setAvailableTimeSlots(updatedTimeSlots);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                <VideoIcon className="mr-2" /> Web Meeting Scheduler
            </h1>

            {/* Meeting Creation Form */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Meeting Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting(prev => ({
                            ...prev,
                            title: e.target.value
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter meeting title"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <select
                            value={newMeeting.date}
                            onChange={handleDateChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">Select Date</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(date).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Time
                        </label>
                        <select
                            value={newMeeting.time}
                            onChange={handleTimeChange}
                            disabled={!newMeeting.date}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">Select Time</option>
                            {availableTimeSlots
                                .filter(slot => slot.available)
                                .map(slot => (
                                    <option key={slot.time} value={slot.time}>
                                        {slot.time}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <button
                    onClick={scheduleMeeting}
                    disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center disabled:bg-gray-400"
                >
                    <CalendarDays className="mr-2" /> Schedule Meeting
                </button>
            </div>

            {/* Scheduled Meetings List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="mr-2" /> Scheduled Meetings
                </h2>
                {meetings.length === 0 ? (
                    <p className="text-gray-500 text-center">No meetings scheduled</p>
                ) : (
                    <div className="space-y-2">
                        {meetings.map(meeting => (
                            <div
                                key={meeting.id}
                                className="bg-gray-100 p-3 rounded-md flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-medium">{meeting.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteMeeting(meeting.id, meeting.time)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingScheduler;