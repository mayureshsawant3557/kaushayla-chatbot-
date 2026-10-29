import { X } from "lucide-react";
import Swal from "sweetalert2";
import NotVerifiedIcon from '../../assets/NotVerifiedIcon.jpg';
import VerifiedIcon from '../../assets/VerifiedIcon.jpg';
import { useAuthorizedRepresentative } from "../../lib/hooks/useAuthorizedRepresentative";

const AuthorizedRepresentativePopup = ({
    open,
    applicationId,
    onClose,
    onSelect
}) => {
    const { data: staffData, isLoading:loading, error } =
        useAuthorizedRepresentative(open, applicationId);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg">

                {/* ───── Header ───── */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Staff/ Management Profile ID
                    </h2>
                    <button onClick={onClose}>
                        <X className="text-gray-500 hover:text-red-600" />
                    </button>
                </div>

                {/* ───── Body ───── */}
                <div className="p-6">

                    {loading && (
                        <p className="text-center text-sm text-gray-600">
                            Fetching details...
                        </p>
                    )}

                    {error && (
                        <p className="text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {staffData && (
                        <>
                            <div className="px-4 pb-4 mt-3">
                                <div className="flex gap-6">
                                    {/* Left side - Details */}
                                    <div className="flex-1">
                                        <div className="space-y-2">
                                            <div className="flex">
                                                <span className="font-semibold min-w-[200px]">Staff/ Management</span>
                                                <span className="mr-2">:</span>
                                                <span>{`${staffData.FirstName} ${staffData.MiddleName} ${staffData.LastName} (${staffData.ApplicationID || '0'})`}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold min-w-[200px]">Date of Birth</span>
                                                <span className="mr-2">:</span>
                                                <span>{staffData.DOB}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold min-w-[200px]">Gender</span>
                                                <span className="mr-2">:</span>
                                                <span>{staffData.Gender || 'Male'}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold min-w-[200px]">Primary Mobile No</span>
                                                <span className="mr-2">:</span>
                                                <span>{staffData.MobileNo}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold min-w-[200px]">E-mail ID</span>
                                                <span className="mr-2">:</span>
                                                <span>{staffData.EMailID}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side - Photo with verification status */}

                                    <div className="relative">
                                        {staffData.VerifyCnt == "" && (
                                            <div className="absolute -top-2 -right-2 z-10">
                                                <img alt="not-verified" src={NotVerifiedIcon} className="w-12 h-12" />
                                            </div>
                                        )}
                                        {staffData.VerifyCnt > 0 && staffData.RejectCnt == 0 && (
                                            <div className="absolute -top-2 -right-2 z-10">
                                                <img alt="verified" src={VerifiedIcon} className="w-12 h-12" />
                                            </div>
                                        )}
                                        <img
                                            src={staffData.PhotoFilePath || "/images/default-avatar.jpg"}
                                            alt="Staff Photo"
                                            className="w-40 h-48 object-cover border-2 border-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ───── Footer ───── */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded border"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!staffData}
                        onClick={() => {
                            Swal.fire(
                                "Confirmed",
                                "Authorized Representative selected successfully",
                                "success"
                            );
                            onSelect(staffData); // 🔥 send to parent
                        }}
                        className="px-6 py-2 text-sm bg-green-700 text-white rounded disabled:opacity-50"
                    >
                        Get Staff/Management Details
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AuthorizedRepresentativePopup;
