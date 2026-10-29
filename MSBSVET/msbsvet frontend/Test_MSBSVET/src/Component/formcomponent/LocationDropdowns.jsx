import { useEffect, useState } from "react";
import { AddressService } from "../../lib/services/addressService";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";

const LocationDropdowns = ({ userLoginID, onChange }) => {

    const [regionOptions, setRegionOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [talukaOptions, setTalukaOptions] = useState([]);

    const [formData, setFormData] = useState({
        RegionID: "",
        DistrictID: "",
        TalukaID: ""
    });

    const [loadingDropdowns, setLoadingDropdowns] = useState({
        regions: false,
        districts: false,
        talukas: false
    });

    const [isReadOnly, setIsReadOnly] = useState({
        region: false,
        district: false,
        taluka: false
    });

    // 🔥 Load data from API
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingDropdowns({
                    regions: true,
                    districts: true,
                    talukas: true
                });

                const res = await AddressService.getUserRegionDistrictTaluka(userLoginID);
                const data = res?.Data || [];

                // 🧠 Extract unique values
                const regions = [...new Map(data.map(item => [
                    item.RegionID,
                    { value: item.RegionID.toString(), label: item.Region }
                ])).values()];

                const districts = [...new Map(data.map(item => [
                    item.DistrictID,
                    { value: item.DistrictID.toString(), label: item.District }
                ])).values()];

                const talukas = [...new Map(data.map(item => [
                    item.TalukaID,
                    { value: item.TalukaID.toString(), label: item.Taluka }
                ])).values()];

                setRegionOptions(regions);
                setDistrictOptions(districts);
                setTalukaOptions(talukas);

                // ✅ Auto-select if only one option
                const newFormData = {
                    RegionID: regions.length === 1 ? regions[0].value : "",
                    DistrictID: districts.length === 1 ? districts[0].value : "",
                    TalukaID: talukas.length === 1 ? talukas[0].value : ""
                };

                setFormData(newFormData);

                // ✅ Read-only logic
                setIsReadOnly({
                    region: regions.length === 1,
                    district: districts.length === 1,
                    taluka: talukas.length === 1
                });

                // 🔁 Send to parent
                onChange && onChange(newFormData);

            } catch (err) {
            } finally {
                setLoadingDropdowns({
                    regions: false,
                    districts: false,
                    talukas: false
                });
            }
        };

        if (userLoginID) {
            loadData();
        }
    }, [userLoginID]);

    // 🔁 Handle change
    const handleDropdownChange = (name, value) => {
        const updated = { ...formData, [name]: value };
        setFormData(updated);

        onChange && onChange(updated);
    };

    return (
        <div className="space-y-4">

            <DropdownComponent
                label="Region"
                name="RegionID"
                options={regionOptions}
                value={formData.RegionID?.toString()}
                onChange={(value) => handleDropdownChange("RegionID", value)}
                loading={loadingDropdowns.regions}
                disabled={isReadOnly.region}
            />

            <DropdownComponent
                label="District"
                name="DistrictID"
                options={districtOptions}
                value={formData.DistrictID?.toString()}
                onChange={(value) => handleDropdownChange("DistrictID", value)}
                loading={loadingDropdowns.districts}
                disabled={isReadOnly.district}
            />

            <DropdownComponent
                label="Taluka"
                name="TalukaID"
                options={talukaOptions}
                value={formData.TalukaID?.toString()}
                onChange={(value) => handleDropdownChange("TalukaID", value)}
                loading={loadingDropdowns.talukas}
                disabled={isReadOnly.taluka}
            />

        </div>
    );
};

export default LocationDropdowns;