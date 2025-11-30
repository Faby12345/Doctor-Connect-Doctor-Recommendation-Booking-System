import React from "react";
import { Navigate } from "react-router-dom";
import {useAuth} from "../AuthContext.tsx";

import DoctorProfilePage from "../DoctorProfile/DoctorProfilePage.tsx";
import PatientProfile from "./PatientProfile";
//import AdminDashboard from "./AdminDashboard"; // or AdminProfile, etc.
import NotAuthPage from "./NotAuthPage.tsx";

const MePage: React.FC = () => {
    const { user, loading } = useAuth();


    if (loading) {
        return <div>Loading...</div>;
    }


    if (!user) {
        return <Navigate to="/login" replace />;
    }


    switch (user.role) {
        case "DOCTOR":
            return <DoctorProfilePage />;

        case "PATIENT":
            return <PatientProfile />;

        // case "ADMIN":
        //     return <AdminDashboard />;

        default:

            return <NotAuthPage />;

    }
};

export default MePage;