import { baseURL } from '../config/baseConfig';

export const GetFeeToPay = `${baseURL}/api/Fee/GetFeeToPay`;
export const SetFeeTransaction = `${baseURL}/api/Fee/SetFeeTransaction`;
export const SetFeeTransactionResponse = `${baseURL}/api/Fee/SetFeeTransactionResponse`;
export const InitiatePayment = `${baseURL}/api/Fee/initiate-payment`;
export const HandleResponse = `${baseURL}/api/Fee/handle-response`;
export const GetTransactionDetails = `${baseURL}/api/Fee/GetTransactionDetails`;


export const CreateOrder = `${baseURL}/api/Payment/CreateOrder`;
export const VerifyPayment = `${baseURL}/api/Payment/VerifyPayment`;
export const CheckFeePaid = `${baseURL}/api/Fee/check-fee-paid`;
export const TransactionHistory = `${baseURL}/api/Fee/transaction-history`;
export const SaveFeeCartItems = `${baseURL}/api/Fee/SaveFeeCartItems`;
export const SaveFeeCartItemsForCourses = `${baseURL}/api/Fee/SaveFeeCartItemsForCourses`;
export const GetFeeCartItems = `${baseURL}/api/Fee/GetFeeCartItems`;
export const GetTransactionWiseCandidateList = `${baseURL}/api/Fee/GetTransactionWiseCandidateList`;
