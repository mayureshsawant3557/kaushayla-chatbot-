import { useEffect, useRef, useState } from "react";
import agent from "../../lib/api/agent";
import { GetByCandidateIDCourseMappings } from "../../Endpoints_All/Candidate/academisthan";
import { useAuth } from "../../Hooks/AuthContext";

const CERTIFICATE_PAGE = "/React/candidate/BCLCCertificate";
const BCLS = () =>{
     const {userInfo} = useAuth();

    const UserID = userInfo?.UserID;

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Please wait while we process your request...");

    const hasFetched = useRef(false);

    const fetchAndRedirect = async () => {
        try {
            const response = await agent.get(
                `${GetByCandidateIDCourseMappings}?candidateID=${UserID}`
            );

            const data = response?.data?.Data;

            if (!data) {
                setStatus("error");
                setMessage("No course mapping data found.");
                return;
            }

            const isAlreadyRegistered = data.Enrolled === 1;

            const confirmed = window.confirm(
                "You will be redirected to another site. Do you want to continue?"
            );

            if (!confirmed) {
                alert("Redirection cancelled.");
                setStatus("error");
                setMessage("Redirection cancelled.");
                return;
            }

            setStatus("redirecting");
            setMessage("Redirecting, please wait...");

            if (isAlreadyRegistered) {
                window.location.href = CERTIFICATE_PAGE;
            } else {
                window.location.href = data.LoginURL;
            }

        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        if (!UserID) {
            setStatus("error");
            setMessage("User session not found. Please log in again.");
            return;
        }
        fetchAndRedirect();
    }, []);
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
