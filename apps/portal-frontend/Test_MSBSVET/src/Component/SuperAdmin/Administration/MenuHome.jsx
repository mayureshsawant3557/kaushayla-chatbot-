// MenuHome.js
import React, { useContext, useState } from "react";
import { Menu } from "lucide-react";
import { ThemeContext } from "../../Context/ThemeContext";
import ManageLinks from "./ManageLinks";
import ManageGroups from "./ManageGroups";
import ManageMenus from "./ManageMenus";

const MenuHome = () => {
   
    const [activeComponent, setActiveComponent] = useState(null);
    const { color } = useContext(ThemeContext);

    return (
        <div className="relative w-full p-6">
            <fieldset className="rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                    <Menu className="mr-2 text-white" />
                    Menu Management
                </legend>

                <div className="flex flex-wrap gap-4 items-center justify-center p-4">
                    <button
                        onClick={() => setActiveComponent("links")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
                    >
                        Manage Links
                    </button>

                    <button
                        onClick={() => setActiveComponent("groups")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
                    >
                        Manage Groups
                    </button>

                    <button
                        onClick={() => setActiveComponent("menus")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
                    >
                        Manage Menus
                    </button>
                </div>

                {activeComponent === "links" && <ManageLinks />}
                {activeComponent === "groups" && <ManageGroups />}
                {activeComponent === "menus" && <ManageMenus />}
            </fieldset>
        </div>
    );
};

export default MenuHome;
