import Button from "../base/Button";

const PopupData = {
    submit: {
        bulletPoints: [
            "Once Application for Letter of Intent (LoI) is submitted, the information on previous pages shall be locked.",
            "To edit information on previous pages, Application for Letter of Intent has to be withdrawn.",
            "Application for Letter of Intent cannot be withdrawn after Letter of Intent (LoI) is issued.",
        ],
        confirmationText: "Are you sure you want to submit Application for Letter of Intent (LoI)",
    },
    withdraw: {
        bulletPoints: [
            "The Application for Letter of Intent (LoI) shall be withdrawn and information on previous pages shall be unlocked i.e. available for editing",
        ],
        confirmationText: "Are you sure you want to withdraw Application for Letter of Intent (LoI)",
    },
};

const LOIConfirmationPopup = ({ isOpen, onClose, onConfirm, mode = "submit" }) => {
    if (!isOpen) return null;

    const config = PopupData[mode] ?? PopupData.submit;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg w-full max-w-3xl shadow-lg overflow-hidden">

                <div className="bg-[#062568] px-6 py-4">
                    <h2 className="text-white text-xl font-semibold">Confirmation</h2>
                </div>

                <div className="px-8 py-6">
                    <ul className="list-disc pl-5 text-red-600 text-lg leading-7 space-y-2">
                        {config.bulletPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>

                    <p className="text-red-600 text-sm mt-6">
                        {config.confirmationText}
                    </p>

                    <div className="border-t mt-6 pt-5 flex justify-center gap-4">
                        <Button onClick={onConfirm} variant="success" size="lg">Yes</Button>
                        <Button onClick={onClose} variant="danger" size="lg">No</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LOIConfirmationPopup;