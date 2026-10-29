import { useState } from "react";

const BCLS = () =>{
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Please wait while we process your request...");
    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <fieldset className="mb-4 rounded-md border p-4">
                <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                    BCLC
                </legend>

                <div className="p-4">
                    {status === "loading" && (
                        <p className="text-gray-600">{message}</p>
                    )}

                    {status === "redirecting" && (
                        <p className="text-green-600">{message}</p>
                    )}

                    {status === "error" && (
                        <p className="text-red-600">{message}</p>
                    )}
                </div>

            </fieldset>
        </div>
    );
}

export default BCLS;
