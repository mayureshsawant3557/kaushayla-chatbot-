import { FaCheckCircle, FaQuestionCircle } from "react-icons/fa";
import agent from "../lib/api/agent";

//use cases
//import { maskString } from "../utils/mask";
//<p>Masked Mobile: {maskString(mobile)}</p>

export const maskString = (value) => {
  if (value === null || value === undefined) return "";
  const str = value.toString().trim();
  if (str.length <= 4) return str;
  return "*".repeat(str.length - 4) + str.slice(-4);
};

export const getVerificationIconComponent = (statusParam, validColumnCount) => {
  if (!statusParam || validColumnCount <= 0) return null;

  const status = statusParam.trim().toUpperCase();

  if (status.includes("R")) {
    return <FaQuestionCircle className="text-yellow-500" />;
  }

  if (status.includes("V")) {
    return <FaCheckCircle className="text-green-600" />;
  }

  return null;
};

export const getFormStatusText = (formStatus) => {
  if (!formStatus) return "Not Sent for Verification";

  switch (formStatus.trim()) {
    case "V":
      return "Verified";
    case "S":
      return "Sent for Verification";
    case "R":
      return "Rejected";
    default:
      return "Not Sent for Verification";
  }
};
export const formatOptions = (data = []) => {
  if (!Array.isArray(data)) return [];
  return data.map((x) => ({
    label: x.Text,
    value: x.Value,
  }));
};


export const getDeviceIP = async () => {
  try {
    const response = await agent.get("/api/GeneralAPIs/device/ip");

    return response?.data?.ip || "";
  } catch (error) {
    return "";
  }
};


export const getPreviousYearList = (
  yearsFrom,
  isCurrentYearRequired = true
) => {
  let currentYear = new Date().getFullYear();

  if (!isCurrentYearRequired) {
    currentYear = currentYear - 1;
  }

  const list = [
    {
      label: "Select",
      value: "-1",
    },
  ];

  if (yearsFrom > 0) {
    for (let i = currentYear; i >= yearsFrom; i--) {
      list.push({
        label: i.toString(),
        value: i.toString(),
      });
    }
  } else {
    const lastYear = currentYear;

    for (let i = currentYear; i > lastYear; i--) {
      list.push({
        label: i.toString(),
        value: i.toString(),
      });
    }
  }

  return list;
};

