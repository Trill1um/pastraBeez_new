import { useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useState, useEffect } from "react";

const BANK = {
  expired: {
    title: "Invalid Verification Link",
    message:
      "The verification link is missing required parameters. Please check your email and try again.",
  },
  sus: {
    title: "Suspicious Activity Detected",
    message: 
      `Please wait while we verify the following:\n
      IP address\n
      Email address\n
      Home address\n
      Phone number\n
      If you did not provide this information, you may want to check your privacy settings. Our security team has been notified.`,
  },
  who: {
    title: "User Not Found",
    message:
      "We couldn't find your account in our database.\nAre you sure you exist?\nPerhaps you're just a figment of someone else's imagination.\nIf you believe this is a mistake, please try again or contact support.",
  },
  success: {
    title: "Email Verification Complete!",
    message:
      "Your email has been successfully verified. You can now close this tab.",
  },
  verifying: {
    title: "Verifying Your Email...",
    message:
      "Please wait while we verify your email address. This may take a few moments.",
  },
};

const VerificationPage = () => {
  const verifyEmail = useUserStore((state) => state.checkCode);
  const isVerify = useUserStore((state) => state.isVerifying);
  const [messages, setMessages] = useState("");
  const [searchParams] = useSearchParams();
  const queries = Object.fromEntries(searchParams.entries());
  const { token, email } = queries;

  useEffect(() => {
    const onVerify = async () => {
      const response = await verifyEmail(token, email);
      switch (response) {
        case 410:
          setMessages("expired");
          break;
        case 400:
          setMessages("sus");
          break;
        case 404:
          setMessages("who");
          break;
          default:
          setMessages("success");
          break;
      }
    };
    onVerify();
  }, [token, email, verifyEmail]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-8 pb-8 bg-yellow-50">
      <div className="bg-white max-h-1/2 overflow-hidden p-8 rounded-lg max-w-3/5 shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">
          { isVerify? BANK["verifying"]?.title: 
          BANK[messages]?.title || "Verifying...Hold on a sec..."}
        </h2>
        <p className="whitespace-pre-line text-left text-amber-700">
          { isVerify? BANK["verifying"]?.message :
          BANK[messages]?.message || "Oh no. Oh no. Oh no.Oh no. Oh no.Oh no.Oh no. Oh no. Oh no. Oh no.Oh no. Oh no. Oh no. Oh no. ".repeat(1000)}
        </p>
      </div>
    </div>
  );
};

export default VerificationPage;