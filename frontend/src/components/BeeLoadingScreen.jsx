// import { useEffect, useState } from "react";
import bee from "../assets/bee.gif"; // Adjust the path as necessary

const BeeLoadingScreen = ({ isLoading }) => {
  return (
    <div
      className={` fixed w-screen h-screen ${
        !isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
      } transition-opacity duration-1000 flex flex-col items-center justify-center h-screen bg-yellow-300 z-10000`}
    >
      <img
        src={bee}
        alt="Bee Icon"
        className="w-32 aspect-auto mb-2"
      />
      <div className="font-bold text-2xl text-gray-800 mb-2">Buzzing in...</div>
      <div className="bee-spinner mb-2">
        <div className="w-10 h-10 border-[6px] border-gray-800 border-t-yellow-300 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default BeeLoadingScreen;
