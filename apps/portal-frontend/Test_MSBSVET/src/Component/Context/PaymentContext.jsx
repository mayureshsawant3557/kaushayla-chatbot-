import { createContext, useContext, useState } from "react";
import agent from '../../lib/api/agent';
import { TransactionHistory } from '../../Endpoints_All/Fee/feeManagement';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [transactionData, setTransactionData] = useState([]);
    const [inspectionFeeTotal, setInspectionFeeTotal] = useState(0);

    const fetchAndCalculateInspectionTotal = async (instituteID, userTypeID) => {
        try {
            const response = await agent.get(
                `${TransactionHistory}/${instituteID}`,
                {
                    params: { userTypeId: userTypeID },
                    timeout: 15000
                }
            );
            if (response.data.Status === 'Success') {
                const data = response.data.Data || [];
                setTransactionData(data);

                const total = data
                    ?.filter(item =>
                        item.Purpose &&
                        item.Purpose.toLowerCase().includes("inspection fee") &&
                        item.ispaid == 1
                    )
                    .reduce((sum, item) => sum + Number(item.FeeAmount || 0), 0) || 0;

                setInspectionFeeTotal(total);
                return total;
            }
            return 0;
        } catch (err) {
            return 0;
        }
    };

    const calculateInspectionTotal = () => {
        const total = transactionData
            ?.filter(item =>
                item.Purpose &&
                item.Purpose.toLowerCase().includes("inspection fee")
            )
            .reduce((sum, item) => sum + Number(item.FeeAmount || 0), 0) || 0;
        setInspectionFeeTotal(total);
        return total;
    };

    return (
        <PaymentContext.Provider
            value={{
                transactionData,
                setTransactionData,
                inspectionFeeTotal,
                fetchAndCalculateInspectionTotal, 
                calculateInspectionTotal         
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => useContext(PaymentContext);