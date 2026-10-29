// import React, { useEffect, useState } from 'react';
// import agent from '../../../lib/api/agent';
// import { AccountPassword, generateToken } from '../../../Endpoints_All/Account/authentication';
// import { ASPXbaseURL } from '../../../Endpoints_All/Config/baseConfig';
// import { getAccessToken } from '../../../lib/api/authService';

// const SeatingArrangement = () => {
//     const [status, setStatus] = useState('Initializing...');
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const handleRedirect = async () => {
//             try {
//                 //// Step 1: Get user info from sessionStorage
//                 //setStatus('Retrieving user information...');
//                 //const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//                 //const userID = userInfoAll.UserID;
//                 //const userLoginID = userInfoAll.UserLoginID;

//                 //if (!userID || !userLoginID) {
//                 //    throw new Error('User information not found in session storage');
//                 //}

//                 //// Step 2: Get password from API
//                 //setStatus('Fetching user credentials...');
//                 //const passwordResponse = await agent.get(
//                 //    `${AccountPassword}/${userID}`
//                 //);
//                 //const password = passwordResponse.data?.Password;

//                 //if (!password) {
//                 //    throw new Error('Failed to retrieve password');
//                 //}

//                 //// Step 3: Generate token
//                 //setStatus('Generating authentication token...');
//                 //const tokenResponse = await agent.get(
//                 //    generateToken,
//                 //    {
//                 //        params: {
//                 //            userLoginId: userLoginID,
//                 //            password: password
//                 //        }
//                 //    }
//                 //);

//                 //const token = tokenResponse.data.token || tokenResponse.data;
//                 const token = getAccessToken();
//                 if (!token) {
//                     throw new Error('Failed to generate token');
//                 }

//                 // Step 4: Redirect to the target URL with token
//                 setStatus('Redirecting to application...');
//                 const targetUrl = `${ASPXbaseURL}/Exam/AttendanceReport.aspx?token=${token}`;

//                 // Redirect to the URL with token as query parameter
//                 window.location.href = targetUrl;

//             } catch (err) {
//                 console.error('Redirect error:', err);
//                 setError(err.message || 'An error occurred during redirect');
//                 setStatus('Error occurred');
//             }
//         };

//         handleRedirect();
//     }, []); // Empty dependency array ensures this runs once on mount

//     return (
//         <div style={styles.container}>
//             <div style={styles.card}>
//                 <div style={styles.spinner}></div>
//                 <h2 style={styles.title}>Redirecting...</h2>
//                 <p style={styles.status}>{status}</p>
//                 {error && (
//                     <div style={styles.errorContainer}>
//                         <p style={styles.errorText}>Error: {error}</p>
//                         <button
//                             style={styles.retryButton}
//                             onClick={() => window.location.reload()}
//                         >
//                             Retry
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // Inline styles for the redirect page
// const styles = {
//     container: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '100vh',
//         backgroundColor: '#f5f5f5',
//         fontFamily: 'Arial, sans-serif'
//     },
//     card: {
//         backgroundColor: 'white',
//         padding: '40px',
//         borderRadius: '8px',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//         textAlign: 'center',
//         maxWidth: '400px',
//         width: '100%'
//     },
//     spinner: {
//         border: '4px solid #f3f3f3',
//         borderTop: '4px solid #3498db',
//         borderRadius: '50%',
//         width: '50px',
//         height: '50px',
//         animation: 'spin 1s linear infinite',
//         margin: '0 auto 20px'
//     },
//     title: {
//         color: '#333',
//         marginBottom: '10px',
//         fontSize: '24px'
//     },
//     status: {
//         color: '#666',
//         fontSize: '16px',
//         marginTop: '10px'
//     },
//     errorContainer: {
//         marginTop: '20px',
//         padding: '15px',
//         backgroundColor: '#fee',
//         borderRadius: '4px'
//     },
//     errorText: {
//         color: '#c33',
//         margin: '0 0 10px 0'
//     },
//     retryButton: {
//         backgroundColor: '#3498db',
//         color: 'white',
//         border: 'none',
//         padding: '10px 20px',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         fontSize: '14px',
//         transition: 'background-color 0.3s'
//     }
// };

// // Add CSS for spinner animation
// const styleSheet = document.createElement("style");
// styleSheet.textContent = `
//     @keyframes spin {
//         0% { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//     }
// `;
// document.head.appendChild(styleSheet);

// export default SeatingArrangement;

import RedirectToOld from "../../formcomponent/RedirectToOld";
const SeatingArrangement = () =>{
    return <RedirectToOld targetPath="/Exam/AttendanceReport.aspx" />;
}

export default SeatingArrangement;