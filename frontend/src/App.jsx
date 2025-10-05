import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore.js";
import { useEffect, lazy } from "react";
import { useInvalidateProducts } from "./lib/query";

import Catalog from "./pages/Catalog";
const HomePage = lazy(() => import("./pages/HomePage"));
const CreationPage = lazy(() => import("./pages/CreationPage"));
const SellerPage = lazy(() => import("./pages/SellerPage"));
const AuthenticationPage = lazy(() => import("./pages/AuthenticationPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const AboutPage = lazy(() => import("./pages/AboutUs"));
import BeeLoadingScreen from "./components/BeeLoadingScreen";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { BeeBackground } from "./components/Background.jsx";

// Separate components for clarity
const ProtectedRoute = ({ children, user }) => {
  return user ? children : <Navigate to="/authenticate" replace />;
};

const PublicOnlyRoute = ({ children, user }) => {
  return user ? <Navigate to="/SellerPage" /> : children;
};

const SellerOnlyRoute = ({ children, user }) => {
  return user?.role === 'seller' ? children : <Navigate to="/catalog" replace />;
}

function App() {
  const checkAuth = useUserStore((s) => s.checkAuth);
  const checkingAuth = useUserStore((s) => s.checkingAuth);
  const user = useUserStore((s) => s.user);
  const { invalidateAll } = useInvalidateProducts();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    useUserStore.getState().setInvalidateAll(invalidateAll);
  }, [invalidateAll]);

  return (
    <div className="App-Box">
      {<BeeLoadingScreen isLoading={checkingAuth} />}
      <NavBar user={user} />
      <BeeBackground />
      <div className="App">
          <Routes>
            {/* Always accessible */}
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about-us" element={<AboutPage />} />

            {/* Protected routes - need login */}
            <Route
              path="/SellerPage"
              element={
                <ProtectedRoute user={user}>
                  <SellerOnlyRoute user={user}>
                    <SellerPage user={user} />
                  </SellerOnlyRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/myProduct/:id"
              element={
                <ProtectedRoute user={user}>
                  <SellerOnlyRoute user={user}>
                    <CreationPage user={user} />
                  </SellerOnlyRoute>
                </ProtectedRoute>
              }
            />

            {/* Public only - redirect if logged in */}
            <Route
              path="/authenticate"
              element={
                <PublicOnlyRoute user={user}>
                  <AuthenticationPage />
                </PublicOnlyRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<HomePage />} />
          </Routes>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
