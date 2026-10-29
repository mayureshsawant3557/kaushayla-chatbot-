import { useQuery, useMutation } from "@tanstack/react-query";
import { SwalHelper } from "../../utils/swalHelper";
import { promoterRegistrationService } from "../services/promoterRegistrationservice";
import { formatDate } from "../../utils/dateUtils";
import { getTitleFromGender } from "../../utils/genderUtils";
import OtpServiceNew from '../../lib/services/OtpServiceNew';

const REQUIRED_FIELDS = {
    RegistrationFor: "Registration For",
    OrganisationTypeID: "Type of Promoting Organization",
    PromoterStatusID: "Promoting Organization Status",
    NameOfPromotingOrganization: "Organization Name",
    DateOfRegistration: "Date of Registration",
    PromotingOrganizationAddress: "Address",
    StateID: "State",
    DistrictID: "District",
    TalukaID: "Taluka",
    CityID: "City",
    PinCode: "PIN Code",
    AuthorizedRepresentative: "Authorized Representative",
    SecurityQuestion: "Security Question",
    captcha: "CAPTCHA Verification",
};

export const usePromoterRegistrationMutation = ({
    formData,
    setErrors,
    selectedAuthData,
    SecurityQuestionRef,
    CaptchaRef,
    onSuccess,
}) => {
    //const otp = OTPService({
    //    mobileNo: selectedAuthData?.MobileNo,
    //    purpose: 'Promoter Registration',
    //    isVerifyRequired: true,
    //    messege: 'OTP verification required by Promoter Registration',
    //    isDuplicateCheck: false,
    //    onError: (error) => {
    //        console.error("OTP Verification Error:", error);
    //        SwalHelper.loading({
    //            title: "Verification Failed",
    //            text: error.message || "OTP verification failed. Please try again."
    //        });
    //    },
    //    onCancel: ({ cancelled }) => {
    //        if (cancelled) {
    //            console.log("OTP cancelled by user");
    //            return;
    //        }
    //    }
    //});


    const validate = () => {
        const errors = {};
        Object.keys(REQUIRED_FIELDS).forEach((field) => {
            if (field === "AuthorizedRepresentative" || field === "SecurityQuestion" || field === "captcha") return;
            if (!formData[field]) errors[field] = "Required";
        });

        if (!selectedAuthData) errors.AuthorizedRepresentative = "Required";

        if (!SecurityQuestionRef.current?.validateSecurity()) errors.SecurityQuestion = "Required";

        if (!CaptchaRef.current?.validate()) errors.captcha = "Please complete CAPTCHA";

        setErrors(errors);

        if (Object.keys(errors).length > 0) {
            const messages = Object.entries(errors)
                .map(([key, value]) => `${REQUIRED_FIELDS[key] || key}: ${value}`)
                .join("<br/>");

            SwalHelper.error("Please fix the following errors:", messages);
            return false;
        }

        return true;
    };

    const mutation = useMutation({
        mutationFn: async () => {

            if (!selectedAuthData) {
                throw new Error("Authorized Representative is required");
            }

            const {
                securityQuestionId: SecurityQuestionId,
                securityAnswer: SecurityAnswer,
                password: Password,
            } = SecurityQuestionRef.current.getSecurityDetails();

            const payload = {
                ...formData,
                RegistrationFor: "2",
                DateOfRegistration: formatDate(formData.DateOfRegistration),
                AuthorizedRepresentative: {
                    ...selectedAuthData,
                    DOB: formatDate(selectedAuthData.DOB),
                    Title: getTitleFromGender(selectedAuthData?.Gender),
                },
                SecurityQuestionId,
                SecurityAnswer,
                Password,
            };

            return promoterRegistrationService.register(payload);
        },

        //onMutate: () => {
        //    SwalHelper.loading(
        //        "Submitting...",
        //        "Please wait while we process your registration"
        //    );
        //},

        onSuccess: (data) => {
            SwalHelper.close();
            SwalHelper.success(
                "Registration Successful!",
                "Your details have been submitted successfully."
            ).then(() => {
                onSuccess?.(data);
            });
        },

        onError: (error) => {
            SwalHelper.close();
            SwalHelper.error(
                "Submission Error",
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        },
    });

    const submit = async () => {
        // Prevent duplicate submission while mutation or OTP loading
        //if (mutation.isPending || otp.otpLoading) return;

        if (!validate()) return;

        //if (!selectedAuthData?.MobileNo) {
        //    SwalHelper.error("OTP Error", "Mobile number not found");
        //    return;
        //}

        //try {
        //    // Start OTP verification, await user input
        //    const otpResult = await otp.startVerification();

        //    if (!otpResult?.success) return;

        //    // ✅ OTP verified — NOW submit
        //    //SwalHelper.loading(
        //    //    "Submitting...",
        //    //    "Please wait while we process your registration"
        //    //);

        //    mutation.mutate();

        //} catch (err) {
        //    console.log("OTP verification canceled or failed", err);
        //}
        const result = await OtpServiceNew.verify({
            mobileNo: selectedAuthData?.MobileNo,
            purpose: "Registration",
            isDuplicateCheck: true,
            duplicateCheckUrl: ""
        });

        // 🟡 STEP 2: User cancelled OTP
        if (result.cancelled) return;

        // 🟡 STEP 3: OTP not verified
        if (!result.verified) {
            SwalHelper.loading(
                "Verification Required",
                "OTP verification is required to proceed.",
                "info"
            );
            return;
        }

        // 🟢 STEP 4: Continue API submit
        mutation.mutate();
    };

    return {
        ...mutation,
        submit,
        //otpLoading: otp.otpLoading,
        //isOtpVerified: otp.isVerified,
    };
};

export const usePromotorOrgDashboardDetails = (promotorUserID, options = {}) => {
    return useQuery({
        queryKey: ["promotorOrgDashboardDetails", promotorUserID],
        queryFn: () =>
            promoterRegistrationService.dashboardDetails(promotorUserID, options),
        enabled: !!promotorUserID
    });
};
export const usePromotingOrganizationDetails = (userInfo) => {
    return useQuery({
        queryKey: ["promoting-organization", userInfo?.UserLoginID],
        enabled: !!userInfo?.UserLoginID,

        queryFn: async () => {
            const instituteId = await promoterRegistrationService.getInstituteIdByCode(userInfo.UserLoginID);

            const promotingOrgId = await promoterRegistrationService.getPromotingOrgIdByInstituteId(instituteId);

            if (!promotingOrgId || promotingOrgId === 0) {
                const error = new Error("NOT_MAPPED");
                error.code = "NOT_MAPPED";
                throw error;
            }

            const payload = {
                ItemId: 0,
                InstituteId: instituteId,
                UserLoginID: userInfo.UserLoginID,
                PageCode: "ExistingInstitute",
                IPAddress: "",
            };

            const response = await promoterRegistrationService.getPromotingOrganisationDetails(payload);

            if (response.Status !== "Success") {
                throw new Error("FETCH_FAILED");
            }

            return response.Data;
        },

        retry: false,
    });
};