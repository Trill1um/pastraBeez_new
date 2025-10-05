const BeeOverlay = ({
  style = "",
  message,
  accept,
  decline,
  isCritical = false,
  addon = null,
}) => {
  const onDecline = () => {
    let shouldCancel;
    if (isCritical) shouldCancel = confirm("Are you sure? Cancelled processes will not be saved.");
    if (isCritical && !shouldCancel) return;
    decline.fn();
  };
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
        {addon}
        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={accept.fn}
            className={`btn-anim hover:bg-amber-500 px-4 py-2 flex rounded-xl bg-amber-400 text-white font-semibold transition`}
          >
            <pre className="flex bee-body">{accept.msg || "Yes"} {accept.time}</pre>
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
