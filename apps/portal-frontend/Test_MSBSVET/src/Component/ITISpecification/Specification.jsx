import { useState, useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext";
import TradeSearch from "../ITISpecification/TradeSearch";
import { Search } from "lucide-react";

const Specification = () => {
    const [activeComponent, setActiveComponent] = useState(null);
    const { color } = useContext(ThemeContext);

    const handleTradeSpecificationClick = () => {
        setActiveComponent('tradeSearch');
    };

    const handleBackToMain = () => {
        setActiveComponent(null);
    };

    // If Trade Specification is clicked, show TradeSearch component
    if (activeComponent === 'tradeSearch') {
        return <TradeSearch onBack={handleBackToMain} />;
    }

    // Main view with justification/info panel
    return (
        <div className="flex min-h-screen">
            <div className="flex-1 p-6">
                <div className="space-y-6">
                    <fieldset className="rounded border border-gray-300 p-4">
                        <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Standardization of Training Infrastructure
                            </div>
                        </legend>
                        <div className="grid grid-cols-[25%_75%] gap-6">
                            {/* Left Column - Button Navigation */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleTradeSpecificationClick}
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                                >
                                    <Search className="w-4 h-4" />
                                    Specification
                                </button>
                            </div>

                            {/* Right Column - Content Panel */}
                            <div className="space-y-4">
                                <p className="text-sm text-gray-700">
                                    The standardization of Specifications for Machines, Equipment, Tools, Furniture, and other Training Infrastructure at Industrial Training Institutes (ITI) is critically important for several key reasons:
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">✓ Quality Assurance and Consistency</h4>
                                        <p className="text-sm text-gray-700 italic ml-4">
                                            Standardization ensures that all ITIs across the State maintain uniform quality standards in their training infrastructure.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">✓ Regulatory Compliance</h4>
                                        <p className="text-sm text-gray-700 ml-4">
                                            ITIs comply with affiliation norms established by the Directorate General of Training (DGT).
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">✓ Industry Relevance and Employability</h4>
                                        <p className="text-sm text-gray-700 ml-4">
                                            Standardized specifications ensure that training infrastructure matches industry requirements, which is crucial for preparing skilled workers for immediate workforce integration.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">✓ Effective Training Delivery</h4>
                                        <ul className="text-sm text-gray-700 ml-4 space-y-1">
                                            <li>• <span className="font-medium">Proper skill development</span> through appropriate tools and equipment</li>
                                            <li>• <span className="font-medium">Safety compliance</span> in workshops and laboratories</li>
                                            <li>• <span className="font-medium">Efficient resource utilization</span> across trades</li>
                                            <li>• <span className="font-medium">Consistent assessment standards</span> for skill evaluation</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">✓ Economic Benefits</h4>
                                        <ul className="text-sm text-gray-700 ml-4 space-y-1">
                                            <li>• <span className="font-medium">Cost optimization</span> through bulk procurement and standardized specifications</li>
                                            <li>• <span className="font-medium">Reduced maintenance</span> costs due to uniformity</li>
                                            <li>• <span className="font-medium">Better vendor management</span> and supply chain efficiency</li>
                                            <li>• <span className="font-medium">Improved return on investment</span> in training infrastructure</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">✓ Trade-Specific Requirements</h4>
                                        <p className="text-sm text-gray-700 ml-4">
                                            Optimizes resource utilization, sharing, repair, maintenance, integration, and tool standardization.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default Specification;
