import React from 'react'

function Condition({label, value, onChange, condition1, condition2}) {
    const handleChange = (e) => {
        onChange(e.target.value)
    }

    return (
        <div>
            <div>
                {label && <label>{label} <span className="text-red-500">*</span></label>}
            </div>

            <div className='flex items-center pl-2 mt-2 gap-10 sm:gap-30 md:gap-50'>
                <label>
                    <input 
                    className="scale-150 mr-2" 
                    type="radio"  
                    value={condition1}
                    checked={value == condition1}
                    onChange={handleChange}
                    />                         
                    {condition1}
                </label>

                <label>
                    <input 
                    className="scale-150 mr-2" 
                    type="radio"  
                    value={condition2}
                    checked={value == condition2}
                    onChange={handleChange}
                    />
                    {condition2}
                </label>
            </div>
        </div>
    );
}

export default Condition
