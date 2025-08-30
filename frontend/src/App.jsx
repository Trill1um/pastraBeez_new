import { Route, Routes, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { useUserStore } from "./stores/useUserStore"
import { useEffect } from "react"

import HomePage from "./pages/HomePage"
import Catalog from "./pages/Catalog"
import CreationPage from "./pages/CreationPage"
import SellerPage from "./pages/SellerPage"
import AuthenticationPage from "./pages/AuthenticationPage"
import ProductDetails from "./pages/ProductDetails"
import AboutPage from "./pages/AboutUs"

import BeeLoadingScreen from "./components/BeeLoadingScreen";
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"

// Separate components for clarity
const ProtectedRoute = ({ children }) => {
    const { user } = useUserStore();
    return user ? children : <Navigate to="/authenticate" />;
};

const PublicOnlyRoute = ({ children }) => {
    const { user } = useUserStore();
    return user ? <Navigate to="/SellerPage" /> : children;
};

function App() {
    const { user, checkAuth, checkingAuth } = useUserStore();
    
    useEffect(() => {
        checkAuth();
    }, [checkAuth]); 

    if (checkingAuth) {
        return <BeeLoadingScreen />;
    }

    return (
        <div className="App-Box">
            <NavBar user={user} />
            <div className="App">
                <Routes>
                    {/* Always accessible */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/about-us" element={<AboutPage />} />

                    {/* Protected routes - need login */}
                    <Route 
                        path="/SellerPage" 
                        element={
                            <ProtectedRoute>
                                <SellerPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/create-my-product" 
                        element={
                            <ProtectedRoute>
                                <CreationPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Public only - redirect if logged in */}
                    <Route 
                        path="/authenticate" 
                        element={
                            <PublicOnlyRoute>
                                <AuthenticationPage />
                            </PublicOnlyRoute>
                        } 
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            <Footer />
            <Toaster />
        </div>
    );
}

export default App