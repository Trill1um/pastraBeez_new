// import { useEffect, useState } from "react";
import beeIcon from "../assets/logo.png"; // Adjust the path as necessary

const BeeLoadingScreen = () => {

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-300">
            <img
                src={beeIcon}
                alt="Bee Icon"
                className="w-32 aspect-auto mb-2 animate-bounce"
            />
            <div className="font-bold text-2xl text-gray-800 mb-2">Buzzing in...</div>
            <div className="bee-spinner mb-2">
                <div className="w-10 h-10 border-6 border-gray-800 border-t-yellow-300 rounded-full animate-spin"></div>
            </div>
            <style>{`
                .border-6 { border-width: 6px; }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default BeeLoadingScreen;
