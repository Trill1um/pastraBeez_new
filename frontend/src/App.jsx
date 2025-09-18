import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect, Suspense, lazy } from "react";

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

// Separate components for clarity
const ProtectedRoute = ({ children, user }) => {
  return user ? children : <Navigate to="/authenticate" replace />;
};

const PublicOnlyRoute = ({ children, user }) => {
  return user ? <Navigate to="/SellerPage" /> : children;
};

function App() {
  const { checkAuth, checkingAuth } = useUserStore();
  const user = useUserStore((state) => state.user);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="App-Box">
      {<BeeLoadingScreen isLoading={checkingAuth}/>}
      <NavBar user={user} />
      <div className="App">

        {/* add suspense fallback */}
        <Suspense >
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
                  <SellerPage user={user}/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/myProduct/:id"
              element={
                <ProtectedRoute user={user}>
                  <CreationPage user={user} />
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
        </Suspense>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
