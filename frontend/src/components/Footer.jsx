import Logo from "../assets/Pastra.svg?react";
import Facebook from "../assets/facebook.svg?react";
import Instagram from "../assets/instagram.svg?react";
import Telegram from "../assets/telegram.svg?react";
import Mail from "../assets/mail.svg?react";
import Messenger from "../assets/messenger.svg?react";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div>
    {!location.pathname.includes("verify") &&
      <div className={`footer w-full px-3 relative sm:px-4 md:px-6 lg:px-8 xl:px-16 py-6 sm:py-8 ${
          !location.pathname === "/" ? "mt-8 sm:mt-12 lg:mt-16" : ""
        }`}
      >
        <div className="flex flex-col items-center justify-centermax-w-[1440px] mx-auto w-full">
          <div
            className="
          flex flex-col items-center mb-8 gap-6 w-full
          lg:flex-row lg:items-center lg:justify-center lg:w-full       
          sm:mb-12 sm:gap-8 
          "
          >
            <div className="flex flex-col items-center lg:flex-row gap-8 sm:gap-12 lg:justify-between w-full lg:w-full">
              <Logo className="aspect-auto flex-2 h-full w-full max-w-1/2" />

              {/* Navigation Links */}
              <div className="flex w-fit h-fit flex-1 flex-row lg:flex-col justify-center items-center gap-6 sm:gap-8">
                <div className="flex flex-row lg:flex-col gap-6 sm:gap-8 items-center lg:items-start">
                  <button onClick={() => {navigate("/")}} className="w-fit bee-footer-sitemap cursor-pointer  sm:text-base">
                    Home
                  </button>
                  <button onClick={() => {navigate("/catalog")}} className="w-fit bee-footer-sitemap cursor-pointer  sm:text-base">
                    Hive
                  </button>
                  <button onClick={() => {navigate("/about-us")}} className="w-fit bee-footer-sitemap cursor-pointer  sm:text-base">
                    Contacts
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div className="flex-2 text-center lg:text-left">
                <h3 className="bee-footer-title mb-2 sm:mb-4 text-base sm:text-lg">
                  About us
                </h3>
                <p className="bee-footer-body text-sm sm:text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum, ac aliquet odio mattis.
                </p>
              </div>

              {/* Contact Section */}
              <div className="flex-2 flex flex-col gap-6 sm:gap-8 items-center lg:items-start">
                {/* Social Media */}
                <div className="flex gap-8 sm:gap-12 lg:gap-16 items-center justify-center h-10 sm:h-12">

                  <button
                    type="button"
                    className="p-0 bg-transparent border-none"
                    style={{ lineHeight: 0 }}
                    onClick={() => {
                      window.open('https://facebook.com/kevinmenard.fernandez', '_blank');
                    }}
                    aria-label="Open Facebook"
                  >
                    <Facebook className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors" />
                  </button>
                  <button
                    type="button"
                    className="p-0 bg-transparent border-none"
                    style={{ lineHeight: 0 }}
                    onClick={() => {
                      window.open('http://t.me/KevinFer04', '_blank');
                    }}
                    aria-label="Open Telegram"
                  >
                    <Telegram className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-500 transition-colors" />
                  </button>
                  <button
                    type="button"
                    className="p-0 bg-transparent border-none"
                    style={{ lineHeight: 0 }}
                    onClick={() => {
                      window.open('https://www.instagram.com/brightsmilebrightday', '_blank');
                    }}
                    aria-label="Open Instagram"
                  >
                    <Instagram className="w-10 sm:w-12 h-10 sm:h-12 bg-pink-500 rounded-full cursor-pointer hover:bg-pink-600 transition-colors" />
                  </button>
                  
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-4 sm:gap-6 w-full">
                  <button
                    type="button"
                    className="cursor-pointer flex items-center justify-center lg:justify-start gap-3 sm:gap-4 hover:underline focus:outline-none"
                    onClick={() => {
                      window.open(
                        'https://m.me/kevinmenard.fernandez',
                        '_blank'
                      );
                    }}
                  >
                    <Messenger className="h-[24px] aspect-auto w-6" />
                    <span className="bee-footer-body text-sm sm:text-base">
                      Message Me
                    </span>
                  </button>

                  <button
                    type="button"
                    className="cursor-pointer flex items-center justify-center lg:justify-start gap-3 sm:gap-4 hover:underline focus:outline-none"
                    onClick={() => {
                      window.open(
                        'https://mail.google.com/mail/?view=cm&fs=1&to=menardkevin810@gmail.com',
                        '_blank'
                      );
                    }}
                  >
                    <Mail className="h-[24px] aspect-auto w-6" />
                    <span className="bee-footer-body break-all lg:break-normal min-w-0 text-sm sm:text-base">
                      menardkevin810@gmail.com
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="bee-footer-body text-center lg:text-right w-full text-xs sm:text-sm lg:text-base">
            All rights reserved © Copyright
          </p>
        </div>
      </div>
    }
    </div>
  );
};

export default Footer;
