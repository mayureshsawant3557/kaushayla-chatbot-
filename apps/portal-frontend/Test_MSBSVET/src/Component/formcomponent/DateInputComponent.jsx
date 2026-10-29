import React, { useState, useEffect, useRef } from "react";

const isValidDDMMYYYY = (val) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return false;
    const [dd, mm, yyyy] = val.split("/").map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    return (
        d.getFullYear() === yyyy &&
        d.getMonth() === mm - 1 &&
        d.getDate() === dd
    );
};

const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};


const formatInputDDMMYYYY = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8); // ddmmyyyy
    const parts = [];
    if (digits.length <= 2) {
        parts.push(digits);
    } else if (digits.length <= 4) {
        parts.push(digits.slice(0, 2), digits.slice(2));
    } else {
        parts.push(digits.slice(0, 2), digits.slice(2, 4), digits.slice(4));
    }
    return parts.filter(Boolean).join("/");
};

export const DateInput = ({
    label = "",
    value,
    onChange,
    required,
    minDate,
    maxDate,
    error,
    position = "bottom",
    disabled=false,
}) => {
    const [open, setOpen] = useState(false);
    const [internalError, setInternalError] = useState(null);
    const wrapperRef = useRef(null);

    // calendar state
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    //const [popupStyle, setPopupStyle] = useState({});

    // ✅ FIX: Sync calendar with input value changes
    useEffect(() => {
        if (value && isValidDDMMYYYY(value)) {
            const [dd, mm, yyyy] = value.split("/").map(Number);
            const d = new Date(yyyy, mm - 1, dd);
            setMonth(d.getMonth());
            setYear(d.getFullYear());
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const masked = formatInputDDMMYYYY(e.target.value);
        onChange(masked);

        if (masked.length === 10) {
            if (!isValidDDMMYYYY(masked)) {
                setInternalError("Invalid date (dd/mm/yyyy).");
            } else {
                const [dd, mm, yyyy] = masked.split("/").map(Number);
                const d = new Date(yyyy, mm - 1, dd);
                if (minDate && d < minDate) {
                    setInternalError("Date is before allowed range.");
                } else if (maxDate && d > maxDate) {
                    setInternalError("Date is after allowed range.");
                } else {
                    setInternalError(null);
                    // sync calendar view with typed date
                    setMonth(d.getMonth());
                    setYear(d.getFullYear());
                }
            }
        } else if (!masked && required) {
            setInternalError("Date is required.");
        } else {
            setInternalError(null);
        }
    };

    const handleDayClick = (d) => {
        const formatted = formatDate(d);
        onChange(formatted);
        setInternalError(null);
        setMonth(d.getMonth());
        setYear(d.getFullYear());
        setOpen(false);
    };

    // generate month grid
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let currentDay = 1 - startWeekday;
    while (currentDay <= daysInMonth) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            if (currentDay < 1 || currentDay > daysInMonth) {
                week.push(null);
            } else {
                week.push(currentDay);
            }
            currentDay++;
        }
        weeks.push(week);
    }

    const years = [];
    const currentYear = today.getFullYear();
    for (let y = currentYear - 100; y <= currentYear + 20; y++) {
        years.push(y);
    }

    const activeError = error || internalError;
    const borderColor = activeError
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-black";

    const calendarPositionClass =
        position === "top"
            ? "absolute z-50 bottom-full mb-1"
            : "absolute z-50 top-full mt-1";
    

    //const calendarPositionClass =
    //    position === "top"
    //        ? "fixed z-[9999]"
    //        : "fixed z-[9999]";

    return (
        <div className="w-full relative" ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                     disabled={disabled}
                    className={`block w-full rounded-md border ${borderColor} px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 pr-10`}
                    placeholder="dd/mm/yyyy"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                />
                <button
                    type="button"
                    disabled={disabled}
                    className="absolute inset-y-0 right-0 px-2 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setOpen((o) => !o)}
                    tabIndex={-1}
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                            strokeWidth="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                    </svg>
                </button>

               {open && !disabled && (
                    <div className={`${calendarPositionClass} w-80 rounded-md border border-gray-200 bg-white shadow-lg p-3`}>
                        {/* Month / Year selectors */}
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                            >
                                {[
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                ].map((mName, idx) => (
                                    <option key={mName} value={idx}>
                                        {mName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* week headers */}
                        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
                            <div>Su</div>
                            <div>Mo</div>
                            <div>Tu</div>
                            <div>We</div>
                            <div>Th</div>
                            <div>Fr</div>
                            <div>Sa</div>
                        </div>

                        {/* days */}
                        <div className="grid grid-cols-7 gap-1 text-sm">
                            {weeks.map((week, wi) =>
                                week.map((day, di) => {
                                    if (day === null) {
                                        return <div key={`${wi}-${di}`} />;
                                    }
                                    const d = new Date(year, month, day);
                                    const formatted = formatDate(d);
                                    const isSelected = value === formatted;
                                    const isToday =
                                        d.toDateString() === today.toDateString();
                                    const disabled =
                                        (minDate && d < minDate) || (maxDate && d > maxDate);

                                    let cellClass =
                                        "flex h-8 w-8 items-center justify-center rounded-full cursor-pointer";
                                    if (disabled) {
                                        cellClass += " text-gray-300 cursor-not-allowed";
                                    } else if (isSelected) {
                                        cellClass +=
                                            " bg-blue-600 text-white font-semibold hover:bg-blue-700";
                                    } else if (isToday) {
                                        cellClass +=
                                            " border border-blue-500 text-blue-600 hover:bg-blue-50";
                                    } else {
                                        cellClass += " text-gray-700 hover:bg-gray-100";
                                    }

                                    return (
                                        <button
                                            key={`${wi}-${di}`}
                                            type="button"
                                            className={cellClass}
                                            onClick={() => !disabled && handleDayClick(d)}
                                            disabled={disabled}
                                        >
                                            {day}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {activeError && (
                <p className="mt-1 text-xs text-red-600">{activeError}</p>
            )}
        </div>
    );
};
