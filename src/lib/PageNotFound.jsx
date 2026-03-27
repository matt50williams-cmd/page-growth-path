import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
      <p className="text-gray-500 text-lg mb-8">Page not found.</p>
      <button onClick={() => navigate("/")}
        className="bg-[#1877F2] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1457C0] transition-colors">
        Go Home
      </button>
    </div>
  );
}