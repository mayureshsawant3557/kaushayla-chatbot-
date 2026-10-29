import React, { useState, useEffect, useRef, useContext } from "react";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import ProgressTracker from './ProgressTracker';
import { useNavigate, useSearchParams } from "react-router-dom";
import agent from '../../../lib/api/agent';
import Swal from "sweetalert2";
import { MapPin } from "lucide-react";
import { GetMasterTableList } from '../../../Endpoints_All/Base/masterData';
import { useLoading } from "../../../Hooks/useLoading"
import {
    GetCandidateAddress,
    SaveCandidateAddress
} from '../../../Endpoints_All/Candidate/address';

import {
    GetStaffAddress,
    SaveStaffAddress
} from '../../../Endpoints_All/Staff/address';

import {
    GetPincodeData,
    GetMasterDistrict,
    GetMasterTaluka,
    GetMasterCity
} from '../../../Endpoints_All/Base/location';

import { GetUserByUserName } from '../../../Endpoints_All/Account/authentication';

import { getIpAndLocation } from "../../../pages/DeviceDetails";
import { useAuth } from "../../../Hooks/AuthContext";
import { resetSecurityQuestion } from "../../../Endpoints_All/Account/securityQuestions";
import { CheckCandidateURL } from "../../../Endpoints_All/Candidate/summary";
import { CheckStaffURL } from "../../../Endpoints_All/Staff/summary";
import Loader from "../../formcomponent/Loader";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { getDeviceIP } from "../../../utils/CommonHelper";

const GET_STATES_API = `${GetMasterTableList}?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;

const Address = () => {
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [cities, setCities] = useState([]);
    const [states, setStates] = useState([]);
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const { color } = useContext(ThemeContext);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredTalukas, setFilteredTalukas] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);


    const [corrFilteredDistricts, setCorrFilteredDistricts] = useState([]);
    const [corrFilteredTalukas, setCorrFilteredTalukas] = useState([]);
    const [corrFilteredCities, setCorrFilteredCities] = useState([]);

    const { startLoading, stopLoading, isLoading } = useLoading();

    // Ref to prevent useEffect from clearing fields during reset/populate
    const isResettingRef = useRef(false);
    const isInitialLoadRef = useRef(true);

    const [loading, setLoading] = useState({
        states: false,
        districts: false,
        talukas: false,
        cities: false,
        pincodeLookup: false,
        addressDataLoading: false,
        saving: false,
        masterData: false
    });

    const [originalData, setOriginalData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [ipAddress, setIpAddress] = useState("");

    const userLoginID = userInfo?.UserLoginID;
    const userID = userInfo?.UserID;
    const userName = userInfo?.UserName;
    const userTypeID = Number(userInfo?.UserTypeID);

    const isInstituteUser = userTypeID === 61;

    const formType =
        userTypeID === 91 || isInstituteUser
            ? "Candidate"
            : "Staff";
    const [searchParams] = useSearchParams();

    const candidateIdFromUrl = searchParams.get("candidateId");

    const effectiveCandidateId =
        isInstituteUser
            ? candidateIdFromUrl
            : userID;

    const API_ENDPOINTS = {
        Candidate: {
            get: GetCandidateAddress,
            save: SaveCandidateAddress,
            userTypeIDName: 'CandidateID'
        },
        Staff: {
            get: GetStaffAddress,
            save: SaveStaffAddress,
            userTypeIDName: 'StaffID'
        }
    };

    const currentEndpoints = API_ENDPOINTS[formType];

    const [formData, setFormData] = useState({
        [currentEndpoints.userTypeIDName]:
            isInstituteUser
                ? Number(effectiveCandidateId)
                : userID || 0,
        PAddress: "",
        PStateID: 0,
        PDistrictID: 0,
        PTalukaID: 0,
        PCityID: 0,
        POtherCity: "",
        PPincode: "",
        IsPPincodeCorrect: 1,

        IsCAddressSameAsPAddress: 1,
        CAddress: "",
        CStateID: 0,
        CDistrictID: 0,
        CTalukaID: 0,
        CCityID: 0,
        COtherCity: "",
        CPincode: "",
        IsCPincodeCorrect: 1,

        UserLoginID: userLoginID || "",
        IPAddress: ipAddress || "",
        PageCode: "Address"
    });

    const [errors, setErrors] = useState({});

    // Fetch user data by username
    const fetchUserData = async () => {
        if (!userName) return;

        try {
            const response = await agent.get(`${GetUserByUserName}/${userName}`);
            if (response.data && response.data.UserName) {
                setUserData(response.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {

        const fetchIP = async () => {
            try {
                const ip = await getDeviceIP();
                setIpAddress(ip);
            } catch (err) {
                console.error("Failed to get IP:", err);
            }
        };

        fetchIP();
        checkCandidateStaffURL();

    }, []);


    // Fetch all master data on mount
    useEffect(() => {
        const fetchAllData = async () => {
            startLoading();
            setLoading(prev => ({ ...prev, masterData: true }));
            try {
                await Promise.all([
                    fetchStates(),
                    fetchAllDistricts(),
                    fetchAllTalukas(),
                    fetchAllCities(),
                    fetchUserData()
                ]);
            } finally {
                stopLoading();
                setLoading(prev => ({ ...prev, masterData: false }));
            }
        };

        fetchAllData();
    }, []);

    // Fetch address data after master data is loaded
    useEffect(() => {
        if (userID && states.length > 0 && districts.length > 0 && talukas.length > 0 && cities.length > 0) {
            fetchAddressData();
        }
    }, [userID, states.length, districts.length, talukas.length, cities.length]);

    const fetchStates = async () => {
        try {
            const response = await agent.get(GET_STATES_API);
            if (response.data.Status === "Success") {
                const stateData = response.data.Data.filter(item => item.Value !== "-1");
                setStates(stateData);
            }
        } catch (error) {
            console.error("Error fetching states:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error loading states: ${error.message}`
            });
        }
    };

    const checkCandidateStaffURL = async () => {
        if (!userID) {
            return;
        }
        if (isInstituteUser) {
            return;
        }
        let response;
        if (userTypeID == 91) {
            response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Address&userLoginId=${userLoginID}`);
        } else if (userTypeID == 95) {
            const payLoad = {
                staffID: userID,
                userLoginID: userLoginID,
                pageCode: 'Address',
                ipAddress: ipAddress || ''

            }
            response = await agent.post(CheckStaffURL, payLoad);
        }

        let IsRightURL;
        let RightURL;
        if (response?.data?.Status == 'Success' && response?.data?.Data) {
            IsRightURL = response?.data?.Data?.IsRightURL;
            RightURL = response?.data?.Data?.RightURL;
        }
        if (IsRightURL === false && RightURL) {
            navigate(RightURL);
        }
    }

    const fetchAddressData = async () => {
        if (!userID) return;
        if (isInstituteUser && !effectiveCandidateId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Candidate ID not found.'
            });
            return;
        }

        startLoading();
        setLoading(prev => ({ ...prev, addressDataLoading: true }));

        try {
            let response;

            if (formType === 'Candidate') {
                response = await agent.get(`${currentEndpoints.get}?candidateId=${effectiveCandidateId}&UserLoginID=${userLoginID}&PageCode=Address&IPAddress=1`);
            } else {
                response = await agent.post(currentEndpoints.get, {
                    [currentEndpoints.userTypeIDName]: parseInt(userID),
                    UserLoginID: userLoginID,
                    PageCode: "Address",
                    IPAddress: ipAddress
                });
            }


            if (response.data.Status === "Success" && response.data.Data) {
                setOriginalData(response.data.Data);
                await populateAddressData(response.data.Data);
            } else {
                setOriginalData(null);
                isInitialLoadRef.current = false;
            }
        } catch (error) {
            console.error("Error fetching address data:", error);
            setOriginalData(null);
            isInitialLoadRef.current = false;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching ${formType} address data: ${error.message}`
            });
        } finally {
            stopLoading();
            setLoading(prev => ({ ...prev, addressDataLoading: false }));
        }
    };

    const populateAddressData = async (data) => {

        // Set flag to prevent useEffect from clearing fields
        isResettingRef.current = true;

        const formattedData = {
            [currentEndpoints.userTypeIDName]:
                isInstituteUser
                    ? effectiveCandidateId
                    : userID,
            PAddress: data.PAddress || "",
            PStateID: data.PStateID || 0,
            PDistrictID: data.PDistrictID || 0,
            PTalukaID: data.PTalukaID || 0,
            PCityID: data.PCityID === 99999999 ? -1 : (data.PCityID || 0),
            POtherCity: data.POtherCity || "",
            PPincode: data.PPincode || "",
            IsPPincodeCorrect: data.IsPPincodeCorrect || 1,

            IsCAddressSameAsPAddress: data.IsCAddressSameAsPAddress !== undefined ? data.IsCAddressSameAsPAddress : 1,
            CAddress: data.CAddress || "",
            CStateID: data.CStateID || 0,
            CDistrictID: data.CDistrictID || 0,
            CTalukaID: data.CTalukaID || 0,
            CCityID: data.CCityID === 99999999 ? -1 : (data.CCityID || 0),
            COtherCity: data.COtherCity || "",
            CPincode: data.CPincode || "",
            IsCPincodeCorrect: data.IsCPincodeCorrect || 1,

            UserLoginID: userLoginID || "",
            IPAddress: ipAddress || "",
            PageCode: "Address"
        };

        setFormData(formattedData);

        // Wait for state to update before filtering
        await new Promise(resolve => setTimeout(resolve, 50));

        // Manually trigger filtering for loaded data
        filterDropdownsOnLoad(formattedData);

        // Reset flag after a short delay to allow state updates
        setTimeout(() => {
            isResettingRef.current = false;
            isInitialLoadRef.current = false;
        }, 200);
    };

    const filterDropdownsOnLoad = (data) => {
        // Filter permanent address dropdowns
        if (data.PStateID && data.PStateID !== 0) {

            const pDistricts = districts.filter(d => d.Group === data.PStateID.toString());
            setFilteredDistricts(pDistricts);

            if (data.PDistrictID && data.PDistrictID !== 0) {

                const pTalukas = talukas.filter(t => t.Group === data.PDistrictID.toString());
                setFilteredTalukas(pTalukas);

                if (data.PTalukaID && data.PTalukaID !== 0) {
                    const pCities = cities.filter(
                        c =>
                            c.Group === data.PTalukaID.toString() ||
                            c.Text?.toLowerCase() === "other"
                    );

                    setFilteredCities(pCities);
                }
            }
        }

        // Filter correspondence address dropdowns
        if (data.CStateID && data.CStateID !== 0) {
            const cDistricts = districts.filter(d => d.Group === data.CStateID.toString());
            setCorrFilteredDistricts(cDistricts);

            if (data.CDistrictID && data.CDistrictID !== 0) {
                const cTalukas = talukas.filter(t => t.Group === data.CDistrictID.toString());
                setCorrFilteredTalukas(cTalukas);

                if (data.CTalukaID && data.CTalukaID !== 0) {
                    const cCities = cities.filter(
                        c =>
                            c.Group === data.CTalukaID.toString() ||
                            c.Text?.toLowerCase() === "other"
                    );
                    setCorrFilteredCities(cCities);
                }
            }
        }
    };

    const fetchAllDistricts = async () => {
        try {
            const response = await agent.get(GetMasterDistrict);
            if (response.data.Status === "Success") {
                const allDistricts = response.data.Data.filter(item => item.Value !== "-1");
                setDistricts(allDistricts);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };

    const fetchAllTalukas = async () => {
        try {
            const response = await agent.get(GetMasterTaluka);

            if (response.data.Status == "Success") {
                const allTalukas = response.data.Data.filter(item => item.Value !== "-1");
                setTalukas(allTalukas);
            }
        } catch (error) {
            console.error("Error fetching talukas:", error);
        }
    };

    const fetchAllCities = async () => {
        try {
            const response = await agent.get(GetMasterCity);

            if (response.data.Status === "Success") {
                const allCities = response.data.Data;
                setCities(allCities);

            }
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const lookupAddressByPincode = async (pincode, addressType) => {
        if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            return;
        }

        startLoading();
        try {
            const response = await agent.get(`${GetPincodeData}?Pincode=${pincode}`);

            if (response.data.Status === "Success" && response.data.Data) {
                const pincodeData = response.data.Data;

                if (addressType === "permanent") {
                    setFormData(prev => ({
                        ...prev,
                        PStateID: pincodeData.StateID,
                        PDistrictID: pincodeData.DistrictID,
                        PTalukaID: pincodeData.TalukaID,
                        PCityID: pincodeData.CityID,
                        IsPPincodeCorrect: 1
                    }));

                    if (formData.IsCAddressSameAsPAddress === 1) {
                        setFormData(prev => ({
                            ...prev,
                            CStateID: pincodeData.StateID,
                            CDistrictID: pincodeData.DistrictID,
                            CTalukaID: pincodeData.TalukaID,
                            CCityID: pincodeData.CityID,
                            CPincode: pincode,
                            IsCPincodeCorrect: 1
                        }));
                    }
                } else {
                    setFormData(prev => ({
                        ...prev,
                        CStateID: pincodeData.StateID,
                        CDistrictID: pincodeData.DistrictID,
                        CTalukaID: pincodeData.TalukaID,
                        CCityID: pincodeData.CityID,
                        IsCPincodeCorrect: 1
                    }));
                }
            } else {
                if (addressType === "permanent") {
                    setFormData(prev => ({ ...prev, IsPPincodeCorrect: 0 }));
                } else {
                    setFormData(prev => ({ ...prev, IsCPincodeCorrect: 0 }));
                }

                Swal.fire({
                    icon: 'warning',
                    title: 'Pincode Not Found',
                    text: 'Please manually select your address details'
                });
            }
        } catch (error) {
            console.error("Error looking up pincode:", error);
            if (addressType === "permanent") {
                setFormData(prev => ({ ...prev, IsPPincodeCorrect: 0 }));
            } else {
                setFormData(prev => ({ ...prev, IsCPincodeCorrect: 0 }));
            }
        } finally {
            stopLoading();
        }
    };

    const handlePincodeChange = (field, value, addressType) => {
        const addressPrefix = addressType === "permanent" ? "P" : "C";
        setFormData(prev => ({ ...prev, [`${addressPrefix}Pincode`]: value }));

        if (errors[`${addressPrefix}Pincode`]) {
            setErrors(prev => ({ ...prev, [`${addressPrefix}Pincode`]: false }));
        }

        if (value.length === 6 && /^\d+$/.test(value)) {
            lookupAddressByPincode(value, addressType);
        }
    };

    // Safe AI Assistant Autofill event listener for Address
    useEffect(() => {
        const handleAutofill = (e) => {
            if (!e || !e.detail) return;
            const d = e.detail;

            // 1. Street Address
            const addrVal = d.PAddress || d.address;
            if (addrVal) {
                setFormData(prev => ({
                    ...prev,
                    PAddress: addrVal,
                    ...(d.IsCAddressSameAsPAddress !== undefined && { IsCAddressSameAsPAddress: d.IsCAddressSameAsPAddress })
                }));
                setErrors(prev => ({ ...prev, PAddress: false }));
            }

            // 2. 6-digit Pincode with automatic lookup
            const pincode = d.PPincode || d.pincode;
            if (pincode && /^\d{6}$/.test(pincode.toString().trim())) {
                const cleanPin = pincode.toString().trim();
                handlePincodeChange('PPincode', cleanPin, 'permanent');
            }

            // 3. State, District, Taluka by ID or Name
            if (d.PStateID) {
                setFormData(prev => ({ ...prev, PStateID: Number(d.PStateID) }));
            } else if (d.state && states && states.length > 0) {
                const match = states.find(s => s.Text && s.Text.toLowerCase().includes(d.state.toLowerCase()));
                if (match) setFormData(prev => ({ ...prev, PStateID: Number(match.Value) }));
            }

            if (d.PDistrictID) {
                setFormData(prev => ({ ...prev, PDistrictID: Number(d.PDistrictID) }));
            } else if (d.district && districts && districts.length > 0) {
                const match = districts.find(ds => ds.Text && ds.Text.toLowerCase().includes(d.district.toLowerCase()));
                if (match) setFormData(prev => ({ ...prev, PDistrictID: Number(match.Value) }));
            }

            if (d.PTalukaID) {
                setFormData(prev => ({ ...prev, PTalukaID: Number(d.PTalukaID) }));
            } else if (d.taluka && talukas && talukas.length > 0) {
                const match = talukas.find(t => t.Text && t.Text.toLowerCase().includes(d.taluka.toLowerCase()));
                if (match) setFormData(prev => ({ ...prev, PTalukaID: Number(match.Value) }));
            }
        };

        window.addEventListener('msbsvet:autofill', handleAutofill);
        return () => window.removeEventListener('msbsvet:autofill', handleAutofill);
    }, [states, districts, talukas]);

    // Permanent address filtering - Modified to check isResettingRef
    useEffect(() => {
        // Skip if resetting/populating data
        if (isResettingRef.current || isInitialLoadRef.current) return;

        if (formData.PStateID && formData.PStateID !== 0) {
            const filtered = districts.filter(d => d.Group === formData.PStateID.toString());
            setFilteredDistricts(filtered);

            if (!filtered.some(d => d.Value === formData.PDistrictID.toString()) && formData.PDistrictID !== 0) {
                setFormData(prev => ({
                    ...prev,
                    PDistrictID: 0,
                    PTalukaID: 0,
                    PCityID: 0
                }));
                setFilteredTalukas([]);
                setFilteredCities([]);
            }
        } else {
            setFilteredDistricts([]);
            setFilteredTalukas([]);
            setFilteredCities([]);
        }
    }, [formData.PStateID, districts]);

    useEffect(() => {
        if (isResettingRef.current || isInitialLoadRef.current) return;

        if (formData.PDistrictID && formData.PDistrictID !== 0) {
            const filtered = talukas.filter(t => t.Group === formData.PDistrictID.toString());
            setFilteredTalukas(filtered);

            if (!filtered.some(t => t.Value === formData.PTalukaID.toString()) && formData.PTalukaID !== 0) {
                setFormData(prev => ({
                    ...prev,
                    PTalukaID: 0,
                    PCityID: 0
                }));
                setFilteredCities([]);
            }
        } else {
            setFilteredTalukas([]);
            setFilteredCities([]);
        }
    }, [formData.PDistrictID, talukas]);

    useEffect(() => {
        if (isResettingRef.current || isInitialLoadRef.current) return;

        if (formData.PTalukaID && formData.PTalukaID !== 0) {

            const filtered = cities.filter(
                c =>
                    c.Group === formData.PTalukaID.toString() ||
                    c.Text?.toLowerCase() === "other"
            );

            setFilteredCities(filtered);

            if (
                !filtered.some(c => c.Value === formData.PCityID.toString()) &&
                formData.PCityID !== 0
            ) {
                setFormData(prev => ({
                    ...prev,
                    PCityID: 0,
                    POtherCity: ""
                }));
            }

        } else {
            setFilteredCities([]);
        }
    }, [formData.PTalukaID, cities]);

    // Correspondence address filtering - Modified to check isResettingRef
    useEffect(() => {
        if (isResettingRef.current || isInitialLoadRef.current) return;

        if (formData.CTalukaID && formData.CTalukaID !== 0) {

            const filtered = cities.filter(
                c =>
                    c.Group === formData.CTalukaID.toString() ||
                    c.Text?.toLowerCase() === "other"
            );

            setCorrFilteredCities(filtered);

            if (
                !filtered.some(c => c.Value === formData.CCityID.toString()) &&
                formData.CCityID !== 0
            ) {
                setFormData(prev => ({
                    ...prev,
                    CCityID: 0,
                    COtherCity: ""
                }));
            }

        } else {
            setCorrFilteredCities([]);
        }
    }, [formData.CTalukaID, cities]);


    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: false
            }));
        }

        if (field.startsWith('P') && formData.IsCAddressSameAsPAddress === 1) {
            const corrField = 'C' + field.substring(1);
            if (corrField in formData) {
                setFormData(prev => ({
                    ...prev,
                    [corrField]: value
                }));
            }
        }
    };

    const handleDropdownChange = (field, value) => {
        const numericValue = value ? parseInt(value) : 0;
        setFormData(prev => ({
            ...prev,
            [field]: numericValue
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: false
            }));
        }

        if (field.startsWith('P') && formData.IsCAddressSameAsPAddress === 1) {
            const corrField = 'C' + field.substring(1);
            if (corrField in formData) {
                setFormData(prev => ({
                    ...prev,
                    [corrField]: numericValue
                }));
            }
        }
    };

    const handleRadioChange = (value) => {
        const isSameAddress = value === "Yes";

        setFormData(prev => {
            const newData = {
                ...prev,
                IsCAddressSameAsPAddress: isSameAddress ? 1 : 0,
                ...(isSameAddress ? {
                    CAddress: prev.PAddress,
                    CPincode: prev.PPincode,
                    CStateID: prev.PStateID,
                    CDistrictID: prev.PDistrictID,
                    CTalukaID: prev.PTalukaID,
                    CCityID: prev.PCityID,
                    COtherCity: prev.POtherCity,
                    IsCPincodeCorrect: prev.IsPPincodeCorrect
                } : {
                    CAddress: "",
                    CPincode: "",
                    CStateID: 0,
                    CDistrictID: 0,
                    CTalukaID: 0,
                    CCityID: 0,
                    COtherCity: "",
                    IsCPincodeCorrect: 1
                })
            };

            return newData;
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.PAddress) newErrors.PAddress = true;
        if (!formData.PPincode) newErrors.PPincode = true;
        if (!formData.PStateID || formData.PStateID === 0) newErrors.PStateID = true;
        if (!formData.PDistrictID || formData.PDistrictID === 0) newErrors.PDistrictID = true;
        if (!formData.PTalukaID || formData.PTalukaID === 0) newErrors.PTalukaID = true;
        if (!formData.PCityID || formData.PCityID === 0) {
            newErrors.PCityID = true;
        }

        if (formData.PCityID === -1 && !formData.POtherCity?.trim()) {
            newErrors.POtherCity = true;
        }

        if (formData.PPincode && (formData.PPincode.length !== 6 || !/^\d+$/.test(formData.PPincode))) {
            newErrors.PPincode = true;
        }

        if (formData.IsCAddressSameAsPAddress === 0) {
            if (!formData.CAddress) newErrors.CAddress = true;
            if (!formData.CPincode) newErrors.CPincode = true;
            if (!formData.CStateID || formData.CStateID === 0) newErrors.CStateID = true;
            if (!formData.CDistrictID || formData.CDistrictID === 0) newErrors.CDistrictID = true;
            if (!formData.CTalukaID || formData.CTalukaID === 0) newErrors.CTalukaID = true;
            if (!formData.CCityID || formData.CCityID === 0) {
                newErrors.CCityID = true;
            }

            if (formData.CCityID === -1 && !formData.COtherCity?.trim()) {
                newErrors.COtherCity = true;
            }
            if (formData.CPincode && (formData.CPincode.length !== 6 || !/^\d+$/.test(formData.CPincode))) {
                newErrors.CPincode = true;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getAddressDisplay = () => {
        const displayName = userData?.UserName || userName || "User";

        // Get correspondence address details
        const address = formData.CAddress;
        const city = formData.CCityID !== 0 && formData.CCityID !== -1
            ? cities.find(c => c.Value === formData.CCityID.toString())?.Text || formData.COtherCity
            : formData.COtherCity;
        const taluka = formData.CTalukaID !== 0
            ? talukas.find(t => t.Value === formData.CTalukaID.toString())?.Text
            : "";
        const district = formData.CDistrictID !== 0
            ? districts.find(d => d.Value === formData.CDistrictID.toString())?.Text
            : "";
        const state = formData.CStateID !== 0
            ? states.find(s => s.Value === formData.CStateID.toString())?.Text
            : "";
        const pincode = formData.CPincode;

        return {
            displayName,
            address,
            city,
            taluka,
            district,
            state,
            pincode
        };
    };

    const showConfirmationPopup = () => {
        const addressData = getAddressDisplay();
        const mobile = JSON.parse(sessionStorage.getItem("userInfoAll"))?.Mobile || "";


        const htmlContent = `
        <!-- Header -->
        <div style="
            background:#0b2c6d;
            color:white;
            padding:12px 16px;
            font-size:18px;
            font-weight:600;
            margin:-10px -10px 10px -10px;
        ">
            Information
        </div>

        <!-- Red Info Text -->
        <p style="
            color:red;
            font-size:14px;
            line-height:1.6;
            text-align:left;
            margin-bottom:20px;
        ">
            All documents/ certificates / communication from Board and Institute shall be sent on
            Correspondence Address. Ensure the Correspondence Address is correct.
            Your Correspondence Address shall appear as:
        </p>

        <!-- Address Block -->
        <div style="text-align:left;font-size:14px;line-height:1.8;color:#000;">
            <p style="font-weight:600;margin-bottom:8px;">
                ${addressData.displayName}
            </p>

            <p>Address : ${addressData.address}</p>
            <p>
                City/ Village : ${addressData.city}
                &nbsp;&nbsp;&nbsp;
                Pin Code : ${addressData.pincode}
            </p>
            <p>
                Taluka : ${addressData.taluka}
                &nbsp;&nbsp;&nbsp;
                District : ${addressData.district}
            </p>
            <p>State : ${addressData.state}</p>
        
        </div>

        <!-- Divider -->
        <hr style="margin-top:20px;border:0;border-top:1px solid #ccc;" />
    `;

        Swal.fire({
            html: htmlContent,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonColor: '#1e8e3e',
            cancelButtonColor: '#dc3545',
            width: '750px',
            customClass: {
                popup: 'address-confirm-popup'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                submitAddressData();
            }
        });
    };

    //TO add mobile number 
    //<p>Mobile Number : ${mobile}</p>

    const submitAddressData = async () => {
        try {
            startLoading();
            setLoading(prev => ({ ...prev, saving: true }));

            const requestBody = {
                ...formData,
                [currentEndpoints.userTypeIDName]:
                    isInstituteUser
                        ? Number(effectiveCandidateId)
                        : userID
            };

            const response = await agent.post(currentEndpoints.save, requestBody);



            if (response.data.Status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `${formType} address details saved successfully.`,
                    confirmButtonText: 'Continue'
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (isInstituteUser) {
                            navigate(
                                `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}`
                            );
                        } else {
                            navigate(`/${formType}/Parent`);
                        }
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error saving data: ' + response.data.Message
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error submitting form: ' + error.message
            });
        } finally {
            stopLoading();
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            showConfirmationPopup();
        } else {
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill in all required fields correctly.'
            });
        }
    };

    const handleReset = () => {

        setErrors({});

        // if (originalData && Object.keys(originalData).length > 0) {
        //     console.log("Restoring original data");
        //     populateAddressData(originalData);
        // } else {
        //     console.log("No original data - clearing form");

        //     // Set flag before clearing
        //     isResettingRef.current = true;

        //     const emptyData = {
        //         [currentEndpoints.userTypeIDName]: userID || 0,
        //         PAddress: "",
        //         PStateID: 0,
        //         PDistrictID: 0,
        //         PTalukaID: 0,
        //         PCityID: 0,
        //         POtherCity: "",
        //         PPincode: "",
        //         IsPPincodeCorrect: 1,

        //         IsCAddressSameAsPAddress: 1,
        //         CAddress: "",
        //         CStateID: 0,
        //         CDistrictID: 0,
        //         CTalukaID: 0,
        //         CCityID: 0,
        //         COtherCity: "",
        //         CPincode: "",
        //         IsCPincodeCorrect: 1,

        //         UserLoginID: userLoginID || "",
        //         IPAddress: ipAddress,
        //         PageCode: "Address"
        //     };

        //     setFormData(emptyData);

        //     // Clear all filtered dropdowns
        //     setFilteredDistricts([]);
        //     setFilteredTalukas([]);
        //     setFilteredCities([]);
        //     setCorrFilteredDistricts([]);
        //     setCorrFilteredTalukas([]);
        //     setCorrFilteredCities([]);

        //     // Reset flag after a delay
        //     setTimeout(() => {
        //         isResettingRef.current = false;
        //     }, 200);
        // }
        const emptyData = {
            [currentEndpoints.userTypeIDName]:
                isInstituteUser
                    ? Number(effectiveCandidateId)
                    : userID || 0,
            PAddress: "",
            PStateID: 0,
            PDistrictID: 0,
            PTalukaID: 0,
            PCityID: 0,
            POtherCity: "",
            PPincode: "",
            IsPPincodeCorrect: 1,

            IsCAddressSameAsPAddress: 1,
            CAddress: "",
            CStateID: 0,
            CDistrictID: 0,
            CTalukaID: 0,
            CCityID: 0,
            COtherCity: "",
            CPincode: "",
            IsCPincodeCorrect: 1,

            UserLoginID: userLoginID || "",
            IPAddress: ipAddress || "",
            PageCode: "Address"
        };

        setFormData(emptyData);

        // Clear all filtered dropdowns
        setFilteredDistricts([]);
        setFilteredTalukas([]);
        setFilteredCities([]);
        setCorrFilteredDistricts([]);
        setCorrFilteredTalukas([]);
        setCorrFilteredCities([]);

        // Reset flag after a delay
        setTimeout(() => {
            isResettingRef.current = false;
        }, 200);
    };

    const formatOptions = (data) => {
        return data.map(item => ({
            value: item.Value,
            label: item.Text
        }));
    };
    const formatCityOptions = (data) => {
        return data.map(item => ({
            value: item.Text?.toLowerCase() === "other"
                ? "-1"
                : item.Value,
            label: item.Text
        }));
    };

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <div>
                <ProgressTracker />
            </div>
            {(isLoading || loading.addressDataLoading || loading.masterData) ? (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        {/* <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Loading address data...</p> */}
                        <Loader />
                    </div>
                </div>
            ) : (
                <form className="mx-auto w-full">
                    <fieldset className="mb-4 rounded-md border p-4">
                        <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                            <MapPin className="" size={18} />
                            Address Details
                        </legend>

                        {/* Permanent Address Section */}
                        <div className="mb-6 mt-4">
                            <h3 className="mb-4 font-normal text-lg">Permanent Address</h3>

                            <div className="mb-4 grid grid-cols-12 gap-4">
                                <div className="col-span-9 flex flex-col">
                                    <label className="font-normal">
                                        Address <span className="text-red-500">*</span>
                                        {errors.PAddress && (
                                            <span className="ml-1 text-sm text-red-500">
                                                Address is required
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="PAddress"
                                        value={formData.PAddress}
                                        onChange={(e) =>
                                            handleInputChange("PAddress", e.target.value)
                                        }
                                        placeholder="Enter address"
                                        className={`w-full p-2 border rounded-md ${errors.PAddress ? "border-red-500" : "border-gray-300"}`}
                                    />
                                </div>

                                <div className="col-span-3 flex flex-col">
                                    <label className="font-normal">
                                        Pin Code <span className="text-red-500">*</span>
                                        {errors.PPincode && (
                                            <span className="ml-1 text-sm text-red-500">
                                                Valid Pin Code is required
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="PPincode"
                                        value={formData.PPincode}
                                        onChange={(e) =>
                                            handlePincodeChange(
                                                "PPincode",
                                                e.target.value,
                                                "permanent",
                                            )
                                        }
                                        placeholder="Enter pin code"
                                        maxLength={6}
                                        className={`w-full p-2 border rounded-md ${errors.PPincode ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {loading.pincodeLookup && (
                                        <span className="text-xs text-blue-500">
                                            Looking up address...
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <DropdownComponent
                                    label="State"
                                    name="PStateID"
                                    options={formatOptions(states)}
                                    value={formData.PStateID.toString()}
                                    onChange={(value) =>
                                        handleDropdownChange("PStateID", value)
                                    }
                                    error={errors.PStateID}
                                    required={true}
                                    loading={loading.states}
                                />

                                <DropdownComponent
                                    label="District"
                                    name="PDistrictID"
                                    options={formatOptions(filteredDistricts)}
                                    value={formData.PDistrictID.toString()}
                                    onChange={(value) =>
                                        handleDropdownChange("PDistrictID", value)
                                    }
                                    error={errors.PDistrictID}
                                    required={true}
                                    disabled={!formData.PStateID || formData.PStateID === 0}
                                    loading={loading.districts}
                                />

                                <DropdownComponent
                                    label="Taluka"
                                    name="PTalukaID"
                                    options={formatOptions(filteredTalukas)}
                                    value={formData.PTalukaID.toString()}
                                    onChange={(value) =>
                                        handleDropdownChange("PTalukaID", value)
                                    }
                                    error={errors.PTalukaID}
                                    required={true}
                                    disabled={
                                        !formData.PDistrictID || formData.PDistrictID === 0
                                    }
                                    loading={loading.talukas}
                                />

                                <DropdownComponent
                                    label="City/Village"
                                    name="PCityID"
                                    options={formatCityOptions(filteredCities)}
                                    value={formData.PCityID.toString()}
                                    onChange={(value) => handleDropdownChange("PCityID", value)}
                                    error={errors.PCityID}
                                    required={true}
                                    disabled={!formData.PTalukaID || formData.PTalukaID === 0}
                                    loading={loading.cities}
                                />
                            </div>

                            {formData.PCityID === -1 && (
                                <div className="mt-4">
                                    <label className="font-normal">
                                        Specify Other City/Village{" "}
                                        <span className="text-red-500">*</span>
                                        {errors.POtherCity && (
                                            <span className="ml-1 text-sm text-red-500">
                                                Required when 'Other' is selected
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="POtherCity"
                                        value={formData.POtherCity}
                                        onChange={(e) =>
                                            handleInputChange("POtherCity", e.target.value)
                                        }
                                        placeholder="Enter city/village name"
                                        className={`w-full p-2 border rounded-md ${errors.POtherCity ? "border-red-500" : "border-gray-300"}`}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Correspondence Address Section */}
                        <div className="mb-6">
                            <div className="relative mb-4">
                                <div className="text-center">
                                    <span className="bg-white px-4 font-normal text-lg">
                                        IS THE CORRESPONDENCE ADDRESS SAME AS PERMANENT ADDRESS ?
                                    </span>
                                </div>

                                <div className="mt-2 flex justify-center space-x-12">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="sameYes"
                                            name="sameAddress"
                                            checked={formData.IsCAddressSameAsPAddress === 1}
                                            onChange={() => handleRadioChange("Yes")}
                                            className="mr-2 h-4 w-4"
                                        />
                                        <label htmlFor="sameYes" className="font-normal">
                                            Yes
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="sameNo"
                                            name="sameAddress"
                                            checked={formData.IsCAddressSameAsPAddress === 0}
                                            onChange={() => handleRadioChange("No")}
                                            className="mr-2 h-4 w-4"
                                        />
                                        <label htmlFor="sameNo" className="font-normal">
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {formData.IsCAddressSameAsPAddress === 0 && (
                                <>
                                    <div className="mb-4 grid grid-cols-12 gap-4">
                                        <div className="col-span-9 flex flex-col">
                                            <label className="font-normal">
                                                Address <span className="text-red-500">*</span>
                                                {errors.CAddress && (
                                                    <span className="ml-1 text-sm text-red-500">
                                                        Address is required
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                name="CAddress"
                                                value={formData.CAddress}
                                                onChange={(e) =>
                                                    handleInputChange("CAddress", e.target.value)
                                                }
                                                placeholder="Enter address"
                                                className={`w-full p-2 border rounded-md ${errors.CAddress ? "border-red-500" : "border-gray-300"}`}
                                            />
                                        </div>

                                        <div className="col-span-3 flex flex-col">
                                            <label className="font-normal">
                                                Pin Code <span className="text-red-500">*</span>
                                                {errors.CPincode && (
                                                    <span className="ml-1 text-sm text-red-500">
                                                        Valid Pin Code is required
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                name="CPincode"
                                                value={formData.CPincode}
                                                onChange={(e) =>
                                                    handlePincodeChange(
                                                        "CPincode",
                                                        e.target.value,
                                                        "correspondence",
                                                    )
                                                }
                                                placeholder="Enter pin code"
                                                maxLength={6}
                                                className={`w-full p-2 border rounded-md ${errors.CPincode ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {loading.pincodeLookup && (
                                                <span className="text-xs text-blue-500">
                                                    Looking up address...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <DropdownComponent
                                            label="State"
                                            name="CStateID"
                                            options={formatOptions(states)}
                                            value={formData.CStateID.toString()}
                                            onChange={(value) =>
                                                handleDropdownChange("CStateID", value)
                                            }
                                            error={errors.CStateID}
                                            required={true}
                                            loading={loading.states}
                                        />

                                        <DropdownComponent
                                            label="District"
                                            name="CDistrictID"
                                            options={formatOptions(corrFilteredDistricts)}
                                            value={formData.CDistrictID.toString()}
                                            onChange={(value) =>
                                                handleDropdownChange("CDistrictID", value)
                                            }
                                            error={errors.CDistrictID}
                                            required={true}
                                            disabled={!formData.CStateID || formData.CStateID === 0}
                                            loading={loading.districts}
                                        />

                                        <DropdownComponent
                                            label="Taluka"
                                            name="CTalukaID"
                                            options={formatOptions(corrFilteredTalukas)}
                                            value={formData.CTalukaID.toString()}
                                            onChange={(value) =>
                                                handleDropdownChange("CTalukaID", value)
                                            }
                                            error={errors.CTalukaID}
                                            required={true}
                                            disabled={
                                                !formData.CDistrictID || formData.CDistrictID === 0
                                            }
                                            loading={loading.talukas}
                                        />

                                        <DropdownComponent
                                            label="City/Village"
                                            name="CCityID"
                                            options={formatCityOptions(corrFilteredCities)}
                                            value={formData.CCityID.toString()}
                                            onChange={(value) => handleDropdownChange("CCityID", value)}
                                            error={errors.CCityID}
                                            required={true}
                                            disabled={!formData.CTalukaID || formData.CTalukaID === 0}
                                            loading={loading.cities}
                                        />
                                    </div>

                                    {formData.CCityID === -1 && (
                                        <div className="mt-4">
                                            <label className="font-normal">
                                                Specify Other City/Village{" "}
                                                <span className="text-red-500">*</span>
                                                {errors.COtherCity && (
                                                    <span className="ml-1 text-sm text-red-500">
                                                        Required when 'Other' is selected
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                name="COtherCity"
                                                value={formData.COtherCity}
                                                onChange={(e) =>
                                                    handleInputChange("COtherCity", e.target.value)
                                                }
                                                placeholder="Enter city/village name"
                                                className={`w-full p-2 border rounded-md ${errors.COtherCity ? "border-red-500" : "border-gray-300"}`}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="mt-4 mb-4">
                                {/*<h3 className="mb-2 font-normal text-lg">Correspondence Address</h3>*/}
                                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                                    <p className="text-red-700 text-sm">
                                        <strong>Note:</strong> All documents/ certificates/
                                        communication from Board and Institute shall be sent on
                                        Correspondence Address.
                                    </p>
                                </div>
                            </div>
                            {/* Form Actions */}
                            <div className="mt-8 flex justify-center space-x-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300 transition-colors"
                                    disabled={loading.saving}
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    disabled={loading.saving}
                                >
                                    {loading.saving ? (
                                        <>
                                            <span
                                                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Next"
                                    )}
                                </button>
                            </div>
                        </div>
                    </fieldset>
                </form>
            )}
        </div>
    );
};

export default Address;
