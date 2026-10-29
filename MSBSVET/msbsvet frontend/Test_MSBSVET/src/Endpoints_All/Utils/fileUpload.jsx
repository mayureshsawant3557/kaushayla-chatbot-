import { baseURL } from '../config/baseConfig';

export const GetSasToken = `${baseURL}/api/FileUpload`;
export const UploadFile = `${baseURL}/api/FileUpload/UploadFile`;
export const getIp = `${baseURL}/api/GeneralAPIs/device/ip`;