import React from "react";
import { useContext } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import {
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ThemeProvider,
    createTheme,
} from "@mui/material";
import { DescriptionOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import englishTranslations from "../../LangTranslation/en/Translation.en.json";
import marathiTranslations from "../../LangTranslation/mr/Translation.mr.json";

const theme = createTheme({
    typography: {
        fontFamily: "Poppins, sans-serif",
    },
});

const UnauthorizedInstitutes = () => {
    const { color, language } = useContext(ThemeContext);

    
   const translations = language === "en" ? englishTranslations : marathiTranslations;
    
    
    const t = translations.unauthorizedInstitutes || {};

    return (
        <ThemeProvider theme={theme}>
            <div className="col-md-12 p-4">
                <fieldset className="border border-gray-300 p-4 rounded-lg">
                    <legend className="text-lg font-bold px-2">
                        <Typography
                            variant="h6"
                            className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-extrabold text-white`}
                        >
                            {t.title || "Unauthorized Institutes"}
                        </Typography>
                    </legend>

                    <div className="p-3">
                        <div className="row flex flex-wrap -mx-2">
                            {/* Sidebar Navigation */}
                            <div className="col-md-3 w-full md:w-1/4 px-2">
                                <nav className="nano-content overflow-y-auto">
                                    <List className="p-0">
                                        <ListItem
                                            button
                                            component={Link}
                                            to="/Public/register-complaint"
                                            className="p-0 text-blue-600"
                                        >
                                            <ListItemIcon>
                                                <DescriptionOutlined />
                                            </ListItemIcon>
                                            <Typography variant="body1">
                                                {t.sidebar?.registerComplaint || "Register Complaint"}
                                            </Typography>
                                        </ListItem>
                                        <ListItem
                                            button
                                            component={Link}
                                            to="/complaint-status"
                                            className="p-0 text-blue-600"
                                        >
                                            <ListItemIcon>
                                                <DescriptionOutlined />
                                            </ListItemIcon>
                                            <Typography variant="body1">
                                                {t.sidebar?.statusOfComplaint || "Status of Complaint"}
                                            </Typography>
                                        </ListItem>
                                        <ListItem
                                            button
                                            component={Link}
                                            to="/institutes-under-inquiry"
                                            className="p-0 text-blue-600"
                                        >
                                            <ListItemIcon>
                                                <DescriptionOutlined />
                                            </ListItemIcon>
                                            <Typography variant="body1">
                                                {t.sidebar?.institutesUnderInquiry || "Institutes under Inquiry"}
                                            </Typography>
                                        </ListItem>
                                    </List>
                                </nav>
                            </div>

                            {/* Main Content */}
                            <div className="col-md-9 w-full px-2 md:w-3/4">
                                {/* Section 1 - Act 2013 */}
                                <Typography variant="h6" className="font-bold">
                                    {t.act2013?.title || "The Maharashtra Unauthorized Institutions and Unauthorized Courses of Study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher, Technical and Vocational Education (Prohibition) Act, 2013 - Maharashtra Act No. XX OF 2013"}
                                </Typography>
                                <div className="my-2">
                                    <a href="#" className="mr-2 text-blue-600 underline">
                                        {t.act2013?.marathiVersion || "Marathi Version"}
                                    </a>
                                    <a href="#" className="text-blue-600 underline">
                                        {t.act2013?.englishVersion || "English Version"}
                                    </a>
                                </div>
                                <Typography variant="body1" className="my-2">
                                    {t.act2013?.accordingToAct || "According to this act:"}
                                </Typography>
                                <List className="list-disc pl-5">
                                    <ListItem className="p-0 block">
                                        {t.act2013?.point1 || "No person shall establish or cause to be established or conduct an Educational Institution, without prior approval of the appropriate authority."}
                                    </ListItem>
                                    <ListItem className="p-0 block">
                                        {t.act2013?.point2 || "No person or an Educational Institution shall introduce or cause to be introduced or conduct a programme or course of study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher Education, Technical Education or Vocational Education without prior approval of the appropriate authority."}
                                    </ListItem>
                                    <ListItem className="p-0 block">
                                        {t.act2013?.point3 || "No person or any Educational Institution shall publish or cause to be published, or arrange or take part in the publication or exhibition of any advertisement relating to such Educational Institution or programmes or courses of study conducted in such Educational Institution or centre which he knows or believes to be not true, intending thereby to cause or knowing it to be likely to make another person believe that the said Educational Institution or programme or course of study is approved by the appropriate authority."}
                                    </ListItem>
                                </List>
                                <Typography variant="body1" className="my-2">
                                    {t.act2013?.moreDetails || "For more details, refer copy of the Act."}
                                </Typography>

                                {/* Section 2 - Rules 2024 */}
                                <Typography variant="h6" className="mt-4 font-bold">
                                    {t.rules2024?.title || "Maharashtra Unauthorized Institutions and Unauthorized Courses of Study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher, Technical and Vocational Education (Complaints, Appeals and Remedial Measures) Rules, 2024"}
                                </Typography>
                                <div className="my-2">
                                    <a href="#" className="mr-2 text-blue-600 underline">
                                        {t.rules2024?.marathiVersion || "Marathi Version"}
                                    </a>
                                    <a href="#" className="text-blue-600 underline">
                                        {t.rules2024?.englishVersion || "English Version"}
                                    </a>
                                </div>
                                <List className="list-disc pl-5">
                                    <ListItem className="p-0 block">
                                        {t.rules2024?.point1 || "In exercise of the powers conferred by sub-sections (1) and (2) of section 18 read with sub-sections (5) and (6) of section 6, sub-section (2) of section 8 and clause (vii) of section 12 of the Maharashtra Unauthorized Institutions and Unauthorized Courses of Study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher, Technical and Vocational Education (Prohibition) Act, 2013 (Mah. XX of 2013) and of all other powers enabling it in that behalf, the Government of Maharashtra, hereby makes Maharashtra Unauthorized Institutions and Unauthorized Courses of Study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher, Technical and Vocational Education (Complaints, Appeals and Remedial Measures) Rules, 2024."}
                                    </ListItem>
                                    <ListItem className="p-0 block">
                                        {t.rules2024?.point2 || "These rules came into force from the date of its publication in the Official Gazette i.e. 8th October, 2024."}
                                    </ListItem>
                                </List>
                                <Typography variant="body1" className="my-2">
                                    {t.rules2024?.moreDetails || "For more details, refer copy of the Rules."}
                                </Typography>

                                {/* Directorate of Vocational Education and Training Section */}
                                <Typography variant="h6" className="font-bold mt-4">
                                    {t.dvet?.title || "Directorate of Vocational Education and Training"}
                                </Typography>
                                <a
                                    href="https://www.dvet.gov.in/mr/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    https://dvet.gov.in
                                </a>
                                <Typography variant="body1" className="my-2">
                                    {t.dvet?.para1 || "Directorate of Vocational Education and Training (DVET) established in 1984 is entrusted with the administrative responsibilities in respect of Craftsman Training Scheme (Industrial Training Institutes - ITI), Apprentice Training Scheme, Pre SSC Vocational Education, +2 Level Vocational Education (HSC Vocational) and +2 Level Bifocal Vocational Education."}
                                </Typography>
                                <Typography variant="body1" className="my-2">
                                    {t.dvet?.para2 || "Industrial Training Institute (ITI) are granted affiliation by Directorate General of Training, New Delhi based on Letter of Intent (LoI) issued by Government of Maharashtra. Application for Letter of Intent (LoI) are accepted and processed by DVET. Exams are conducted and certificates are issued to successful candidates by Directorate General of Training, New Delhi through DVET."}
                                </Typography>
                                <Typography variant="body1" className="my-2">
                                    {t.dvet?.para3 || "Application for establishing institute for Pre SSC Vocational Education, +2 Level Vocational Education (HSC Vocational) and +2 Level Bifocal Vocational Education are also accepted and processed by Directorate of Vocational Education and Training. Exams are conducted and certificates are issued by Maharashtra State Board of Secondary and Higher Secondary Education."}
                                </Typography>

                                {/* Maharashtra State Board of Skill, Vocational Education and Training Act Section */}
                                <Typography variant="h6" className="mt-4 font-bold">
                                    {t.act2021?.title || "Maharashtra State Board of Skill, Vocational Education and Training Act, 2021 - Maharashtra Act No. IX of 2022"}
                                </Typography>
                                <div className="my-2">
                                    <a href="#" className="mr-2 text-blue-600 underline">
                                        {t.act2021?.marathiVersion || "Marathi Version"}
                                    </a>
                                    <a href="#" className="text-blue-600 underline">
                                        {t.act2021?.englishVersion || "English Version"}
                                    </a>
                                </div>
                                <Typography variant="body1" className="my-2">
                                    {t.act2021?.para1 || "Maharashtra State Vocational Education Examination Board (MSBVEE) established in 1986 is now renamed and reconstituted as Maharashtra State Board of Skill, Vocational Education and Training (Board) to regulate matters pertaining to Skill, Vocational Education and Training and Entrepreneurship Education as per the National Skill Qualification Framework and other Skills Courses in the State of Maharashtra and for other matters vide Maharashtra State Board of Skill, Vocational Education and Training Act, 2021 (Mah. Act No. IX of 2022) dated 20.01.2022 which came into force on 26.01.2022."}
                                </Typography>
                                <Typography variant="body1" className="my-2">
                                    {t.act2021?.para2 || "Maharashtra State Board of Skill, Vocational Education and Training has been entrusted with responsibility design and approve courses, affiliation of training institutes, assessment and certification of Certificate, Diploma and Advance Diploma level Vocational Education and Training, Skill Development and Entrepreneurship Education courses."}
                                </Typography>
                                <Typography variant="body1" className="my-2">
                                    {t.act2021?.para3 || "Institutes imparting training in Certificate, Diploma and Advance Diploma level Vocational Education and Training, Skill Development and Entrepreneurship Education courses should seek affiliation from Maharashtra State Board of Skill, Vocational Education and Training."}
                                </Typography>

                                {/* Competent Authority and Appellate Authority Section */}
                                <Typography variant="h6" className="mt-4 font-bold">
                                    {t.competentAuthority?.title || "Competent Authority and Appellate Authority for Vocational Education"}
                                </Typography>
                                <div className="my-2">
                                    <a href="#" className="mr-2 text-blue-600 underline">
                                        {t.competentAuthority?.marathiVersion || "Marathi Version"}
                                    </a>
                                    <a href="#" className="text-blue-600 underline">
                                        {t.competentAuthority?.englishVersion || "English Version"}
                                    </a>
                                </div>
                                <Typography variant="body1" className="my-2">
                                    {t.competentAuthority?.para1 || "Director, Directorate of Vocational Education and Training is designated as Competent Authority for Vocational Education."}
                                </Typography>
                                <Typography variant="body1" className="my-2">
                                    {t.competentAuthority?.para2 || "Joint/ Deputy Secretary-in-Charge of Vocational Education and Training, Government of Maharashtra, Mantralaya, Mumbai is designated as Appellate Authority for Vocational Education."}
                                </Typography>

                                {/* Fact Finding Committee Section */}
                                <Typography variant="h6" className="mt-4 font-bold">
                                    {t.factFinding?.title || "Fact Finding Committee constituted by Competent Authority"}
                                </Typography>
                                <a href="#" className="text-blue-600 underline">
                                    {t.factFinding?.orderCopy || "Order Copy"}
                                </a>
                                <Typography variant="body1" className="my-2">
                                    {t.factFinding?.para1 || "Director, Directorate of Vocational Education and Training who is designated as Competent Authority has constituted Fact Finding Committee (FCC) as per provision at rule 5 of Maharashtra Unauthorized Institutions and Unauthorized Courses of Study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher, Technical and Vocational Education (Complaints, Appeals and Remedial Measures) Rules, 2024."}
                                </Typography>
                                <Typography variant="body1" className="my-2">
                                    {t.factFinding?.para2 || "The Fact Finding Committee (FCC) shall make an inquiry as per provisions of the said rules whether the Institute is established or any programme or course of study is introduced or conducted in contravention of any of the provisions of the Act. After completing the inquiry, the Fact Finding Committee (FCC) shall submit its report to the Competent Authority within the given time limit."}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </ThemeProvider>
    );
};

export default UnauthorizedInstitutes;