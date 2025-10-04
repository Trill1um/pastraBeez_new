export const BeeBackground = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
    <div className="absolute top-20 left-10 w-16 h-16 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute top-40 right-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
    <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/25 rounded-full blur-lg animate-pulse delay-2000"></div>
    <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-300/15 rounded-full blur-xl animate-pulse delay-3000"></div>
  </div>
);