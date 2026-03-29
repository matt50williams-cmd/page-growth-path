const API_BASE = import.meta.env.VITE_API_BASE || "https://pageaudit-engine.onrender.com";

export async function findFacebookCandidates({ pageName, businessName, website, email, city }) {
  try {
    const res = await fetch(`${API_BASE}/api/find-facebook-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: businessName || pageName,
        city: city || null,
        website_url: website || null,
      }),
    });

    const data = await res.json();
    return {
      candidates: data.candidates || [],
      websiteData: data.websiteData || null,
    };
  } catch (err) {
    console.error("findFacebookCandidates error:", err);
    return { candidates: [], websiteData: null };
  }
}