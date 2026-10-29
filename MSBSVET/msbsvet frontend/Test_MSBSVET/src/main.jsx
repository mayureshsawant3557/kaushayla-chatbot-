import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
//import agentPublic from './lib/api/publicAgent';


//const loadPublicKey = async () => {
//    const existing = localStorage.getItem("publicKey");
//    if (existing) return;

//    const res = await agentPublic.get(
//        "/api/security/public-key",
//        {
//            headers: {
//                "X-Skip-Encryption": "true"
//            }
//        }
//    );

//    localStorage.setItem("publicKey", res.data);
//};
const bootstrap = async () => {
    //await loadPublicKey();

    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
};

bootstrap();