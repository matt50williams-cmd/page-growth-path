import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ScanRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const repCode = searchParams.get("rep");
    if (repCode) {
      localStorage.setItem("pageaudit_rep_code", repCode.toLowerCase().trim());
    }
    navigate("/", { replace: true });
  }, [navigate, searchParams]);

  return null;
}
