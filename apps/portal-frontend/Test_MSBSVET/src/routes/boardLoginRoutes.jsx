import { Route, Routes } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import BoardDashBoard from "../Component/Borad02/Dashboard/BoardDashBoard";


function BoardLoginRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {

   
    return (
       <Routes>
            <Route
                path="dashboard"
                element={
                    <PaddedLayout>
                        <BoardDashBoard
                            userLoginId={userLoginId}
                          
                            isLoggedIn={isLoggedIn}
                            onLoginStateChange={onLoginStateChange}
                        />
                       
                    </PaddedLayout>
                }
            />
        </Routes> 
       
    );
}

export default BoardLoginRoutes;
