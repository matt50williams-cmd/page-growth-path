import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuditPreview() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/report-preview");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
    </div>
  );
}


