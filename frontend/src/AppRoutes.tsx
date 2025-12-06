// AppRoutes.tsx (or wherever you define <Routes />)
import React from "react";
import { Routes, Route } from "react-router-dom";

import MePage from "./Pages/UserProfile/MePage";
import LoginPage from "./Pages/login.tsx";
import NotAuthPage from "./Pages/UserProfile/NotAuthPage.tsx";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/not-authorized" element={<NotAuthPage/>} />

            {/* /me route that uses AuthContext internally */}
            <Route path="/me" element={<MePage />} />

            {/* other routes... */}
        </Routes>
    );
};

export default AppRoutes;

