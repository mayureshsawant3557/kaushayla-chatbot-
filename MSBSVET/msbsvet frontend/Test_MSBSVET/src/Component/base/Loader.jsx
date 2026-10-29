const Loader = ({ text }) => {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40">
            <div className="bg-white px-8 py-6 rounded-xl shadow-xl flex flex-col items-center gap-4">

                <div className="flex gap-3">
                    <span className="loader-dot"></span>
                    <span className="loader-dot delay-1"></span>
                    <span className="loader-dot delay-2"></span>
                </div>

                {text && (
                    <p className="text-sm font-medium text-gray-700 text-center">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Loader;