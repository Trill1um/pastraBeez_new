import { useEffect, useRef, useState, useCallback } from "react";

// CodeInput component (handles multi-box OTP input)
const CodeInput = ({ digits = 6, onComplete = () => {}, hintEmail = null }) => {
  const [values, setValues] = useState(Array(digits).fill(""));
  const [index, setIndex] = useState(0);
  const inputsRef = useRef([]);
  useEffect(() => {
    // focus the first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    const code = values.join("");
    if (code.length === digits && !values.includes("")) {
      console.log("Code complete:", code);
      // call onComplete asynchronously to avoid running during render
      Promise.resolve().then(() => onComplete(code, hintEmail));
    }
  }, [values, digits, onComplete, hintEmail]);

  const handleKeyDown = (e, idx) => {
    const next = [...values];
    let currIndex=index;
    if (e.key === "Backspace") {
      if (values[currIndex - 1]) {
        next[currIndex - 1] = "";
        currIndex--;
        inputsRef.current[currIndex - 1]?.focus();
      } else if (values[idx]) {
        next[idx] = "";
        inputsRef.current[idx - 1]?.focus();
      } else {
        inputsRef.current[currIndex - 1]?.focus();
      }
      setValues(next);
    } else if (e.key === "ArrowLeft") {
      inputsRef.current[Math.max(0, idx - 1)]?.focus();
    } else if (e.key === "ArrowRight") {
      inputsRef.current[Math.min(digits - 1, idx + 1)]?.focus();
    } else if (e.key >= "0" && e.key <= "9") {
      if (next[idx]) {
        next[idx] = e.key;
          inputsRef.current[Math.min(digits - 1, idx + 1)]?.focus();
      } else if (currIndex < digits) {
        next[currIndex] = e.key;
        currIndex ++;
        inputsRef.current[Math.min(digits - 1, currIndex)]?.focus();
        setValues(next);
      }
    }
    setIndex(currIndex);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData("text")
      .trim();
    const chars = text
      .split("")
      .filter((c) => /[0-9]/.test(c))
      .slice(0, digits);
    const next = [...values];
    for (let i = 0; i < digits; i++) {
      if (chars[i]) {
        next[i] = chars[i];
      } else {
        next[i] = "";
      }
    }
    setValues(next);
    setIndex(chars.length);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {hintEmail && (
        <p className="text-xs text-amber-700">
          A code was sent to <strong>{hintEmail}</strong>
        </p>
      )}
      <div className="flex gap-2 my-2">
        {Array.from({ length: digits }).map((_, i) => (
          <input
            key={"code-input-" + i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-amber-50 border-2 border-amber-200 focus:border-amber-400 focus:outline-none shadow-sm"
            value={values[i]}
            onChange={() => {}}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            aria-label={`Code digit ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const BeeOverlay = ({
  message,
  accept,
  decline,
  email = null,
  isCritical = false,
  verification = null,
  isCodeSent = false,
  coolDown = 0,
  style = "",
}) => {
  const onDecline = () => {
    let input;
    if (isCritical)
      input = confirm("Are you sure? Cancelled processes will not be saved.");
    if (!input) return;
    decline.fn();
  };
  const handleComplete = useCallback(async (code) => {
    if (verification) await verification(code, email);
  }, [verification, email]);
  return (
    <div
      className={`${style} fixed inset-0 z-50 flex items-center justify-center bg-black/30`}
    >
      <div className="bg-white rounded-2xl shadow-xl border-4 border-amber-300 p-6 max-w-sm min-w-3xs text-center relative">
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="text-5xl">🐝</span>
          <h2 className="bee-title text-lg font-bold text-amber-900">
            Buzz Alert!
          </h2>
          <p className="text-amber-700 text-sm">{message}</p>
        </div>

        {verification && isCodeSent && email && (
          <div className="w-full">
            {/* Bee-themed verification code input */}
            <CodeInput
              onComplete={handleComplete}
              hintEmail={email}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={accept.fn}
            className={`${
              coolDown
                ? "cursor-not-allowed opacity-90"
                : "btn-anim hover:bg-amber-500"
            }  px-4 py-2 rounded-xl bg-amber-400 text-white font-semibold transition`}
          >
            {accept.msg || "Yes"} {coolDown ? "(" + coolDown + ")" : ""}
          </button>
          <button
            onClick={onDecline}
            className="btn-anim px-4 py-2 rounded-xl bg-gray-100 text-amber-700 font-semibold hover:bg-amber-200 transition"
          >
            {decline.msg || "No"}
          </button>
        </div>
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">
          🍯
        </span>
      </div>
    </div>
  );
};

export default BeeOverlay;
