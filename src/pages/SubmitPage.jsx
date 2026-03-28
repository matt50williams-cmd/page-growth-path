import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Search, Globe, MapPin, Clock, Video, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { storeUtmParams, getStoredUtmParams } from "@/utils/utm";
import { trackEvent, EVENTS } from "@/utils/tracking";

const TOTAL_STEPS = 7;
const API_BASE = "https://pageaudit-engine.onrender.com";
const FB_PHOTO = (username) => `${API_BASE}/api/fb-photo/${encodeURIComponent(username)}`;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

const extractDomain = (input) => {
  if (!input) return "";
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('/')[0].split('@').pop();
  const parts = domain.split('.');
  if (parts.length >= 2) return parts[parts.length - 2];
  return domain;
};

const BUSINESS_TYPES = [
  { value: "plumbing", label: "🔧 Plumbing", zipzoit: true },
  { value: "hvac", label: "❄️ HVAC / Heating & Cooling", zipzoit: true },
  { value: "roofing", label: "🏠 Roofing", zipzoit: true },
  { value: "electrical", label: "⚡ Electrical", zipzoit: true },
  { value: "restaurant", label: "🍽️ Restaurant / Food", zipzoit: false },
  { value: "retail", label: "🛍️ Retail / Shop", zipzoit: false },
  { value: "health", label: "💊 Health & Wellness", zipzoit: false },
  { value: "realestate", label: "🏡 Real Estate", zipzoit: true },
  { value: "attorney", label: "⚖️ Attorney / Legal", zipzoit: true },
  { value: "dental", label: "🦷 Dental / Medical", zipzoit: true },
  { value: "auto", label: "🚗 Auto Repair", zipzoit: true },
  { value: "other", label: "📋 Other", zipzoit: false },
];

const DID_YOU_KNOW = [
  "Pages that post 4–5 times per week grow 3x faster than those that post randomly.",
  "Facebook's algorithm rewards pages that respond to comments within the first 30 minutes.",
  "Local businesses that mention their city in posts see up to 40% more reach from nearby customers.",
  "Pages with a complete About section rank higher in Facebook search results.",
  "Video posts get 5x more reach than image posts on Facebook — even short 60-second videos.",
  "The best time to post for most businesses is between 1pm–4pm on weekdays.",
  "Businesses that respond to reviews get 35% more engagement on their posts.",
];

function DidYouKnow({ index }) {
  return (
    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
      <Lightbulb className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide mb-0.5">Did You Know?</p>
        <p className="text-xs text-gray-600 leading-relaxed">{DID_YOU_KNOW[index % DID_YOU_KNOW.length]}</p>
      </div>
    </div>
  );
}

function WhyWeAsk({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        <HelpCircle className="w-3.5 h-3.5" />
        Why do we ask this?
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-600 leading-relaxed">{children}</p>
        </div>
      )}
    </div>
  );
}

function StepProgress({ step }) {
  const messages = [
    "Let's get started! 🚀",
    "Great! Keep going...",
    "You're doing great!",
    "Almost there...",
    "Two more steps!",
    "One more step!",
    "Final step!",
  ];
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#1877F2]">{messages[step - 1]}</span>
        <span className="text-xs font-medium text-gray-400">Step {step} of {TOTAL_STEPS}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-[#1877F2] to-[#2563eb] h-2 rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
    </div>
  );
}

function OptionCard({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-150 flex items-center gap-3 ${selected ? "border-[#1877F2] bg-blue-50 shadow-sm" : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"}`}>
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#1877F2] bg-[#1877F2]" : "border-gray-300 bg-white"}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-sm font-medium ${selected ? "text-[#1877F2]" : "text-gray-700"}`}>{children}</span>
    </button>
  );
}

function generateVariations(name, email = "", website = "") {
  const raw = name.trim();
  const cleaned = raw.replace(/\s+/g, '');
  const lower = cleaned.toLowerCase();
  const title = raw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const withDots = raw.replace(/\s+/g, '.');
  const withDashes = raw.replace(/\s+/g, '-');
  const withUnder = raw.replace(/\s+/g, '_');
  const lowerDots = raw.toLowerCase().replace(/\s+/g, '.');
  const lowerDashes = raw.toLowerCase().replace(/\s+/g, '-');
  const emailDomain = extractDomain(email);
  const websiteDomain = extractDomain(website);
  const smart = [];
  if (emailDomain && emailDomain !== lower) { smart.push(emailDomain); smart.push(`the${emailDomain}`); }
  if (websiteDomain && websiteDomain !== lower) { smart.push(websiteDomain); smart.push(`the${websiteDomain}`); }
  const all = [
    ...smart, cleaned, lower, title,
    withDots, withDashes, withUnder,
    lowerDots, lowerDashes,
    `the${lower}`, `The${title}`,
    `${lower}official`, `${lower}page`,
    `${lower}biz`, `${lower}hq`,
    `real${lower}`, `get${lower}`,
    `my${lower}`, `${lower}pro`,
    `${lower}us`, `${lower}co`,
  ].filter(Boolean);
  return [...new Set(all)].slice(0, 20);
}

function isValidFacebookUrl(url) {
  if (!url) return false;
  if (!url.includes('facebook.com')) return false;
  if (url.includes('NOT_FOUND')) return false;
  if (url.includes('profile.php')) return false;
  const username = url.replace(/https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/$/, '').split('?')[0];
  if (/^\d+$/.test(username)) return false;
  if (username.length <= 4) return false;
  return true;
}

function FacebookPageFinder({ value, onChange, email, website, preloadedUrl }) {
  const [pageName, setPageName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [imgError, setImgError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [varIndex, setVarIndex] = useState(0);
  const [showVariations, setShowVariations] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [pasteUrl, setPasteUrl] = useState("");
  const [noMore, setNoMore] = useState(false);
  const [allVars, setAllVars] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [noFacebook, setNoFacebook] = useState(false);

  useEffect(() => {
    if (preloadedUrl && !confirmed && isValidFacebookUrl(preloadedUrl)) {
      const name = preloadedUrl
        .replace(/https?:\/\/(www\.)?facebook\.com\//i, '')
        .replace(/\/$/, '')
        .split('?')[0];
      setPreviewUrl(preloadedUrl);
      setImgSrc(FB_PHOTO(name));
      setPageName(name);
      setConfirmedName(name);
    }
  }, [preloadedUrl]);

  const handleSearch = () => {
    if (!pageName.trim()) return;
    setSearching(true);
    setImgError(false);
    setShowVariations(false);
    setNoMore(false);
    setVarIndex(0);
    const vars = generateVariations(pageName, email, website);
    const cleaned = pageName.trim().replace(/\s+/g, '');
    setAllVars(vars);
    setPreviewUrl(`https://www.facebook.com/${cleaned}`);
    setImgSrc(FB_PHOTO(cleaned));
    setConfirmed(false);
    onChange("");
    setSearching(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setConfirmedName(showVariations ? allVars[varIndex] : pageName.trim().replace(/\s+/g, ''));
    onChange(previewUrl);
    setShowVariations(false);
  };

  const handleNotRight = () => {
    const vars = generateVariations(pageName, email, website);
    setAllVars(vars);
    setShowVariations(true);
    setVarIndex(0);
    setImgError(false);
    onChange("");
    const v = vars[0];
    setPreviewUrl(`https://www.facebook.com/${v}`);
    setImgSrc(FB_PHOTO(v));
  };

  const handleNext = () => {
    const next = varIndex + 1;
    if (next >= allVars.length) {
      setNoMore(true);
      setPreviewUrl("");
      setImgSrc("");
    } else {
      setVarIndex(next);
      setImgError(false);
      const v = allVars[next];
      setPreviewUrl(`https://www.facebook.com/${v}`);
      setImgSrc(FB_PHOTO(v));
    }
  };

  const handleStartOver = () => {
    setConfirmed(false); setPreviewUrl(""); setImgSrc("");
    setImgError(false); setPageName(""); onChange("");
    setShowVariations(false); setAllVars([]); setConfirmedName("");
    setPasteUrl(""); setNoMore(false); setVarIndex(0);
    setShowHelp(false); setShowUpload(false); setNoFacebook(false);
  };

  const handlePaste = (e) => {
    const val = e.target.value;
    setPasteUrl(val);
    if (val.includes('facebook.com')) {
      const name = val.replace(/https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/$/, '').split('?')[0];
      onChange(val);
      setPreviewUrl(val);
      setConfirmedName(name);
      setImgSrc(FB_PHOTO(name));
      setConfirmed(true);
    }
  };

  const handleScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1];
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
                { type: 'text', text: 'Find the Facebook page URL in this screenshot. Return ONLY the URL like "https://www.facebook.com/pagename" or just the username. Nothing else.' }
              ]
            }]
          })
        });
        const data = await response.json();
        const extracted = data?.content?.[0]?.text?.trim();
        if (extracted && !extracted.includes('NOT_FOUND')) {
          let fbUrl = extracted.includes('facebook.com') ? extracted : `https://www.facebook.com/${extracted}`;
          let fbName = fbUrl.replace(/https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/$/, '').split('?')[0];
          setPreviewUrl(fbUrl);
          setImgSrc(FB_PHOTO(fbName));
          setConfirmedName(fbName);
          setPageName(fbName);
          setImgError(false);
          onChange("");
          setShowUpload(false);
          setNoMore(false);
          setShowVariations(false);
        }
        setUploadLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadLoading(false);
    }
  };

  const currentName = showVariations ? allVars[varIndex] : pageName.trim().replace(/\s+/g, '');

  if (noFacebook) {
    return (
      <div className="bg-blue-50 border-2 border-[#1877F2] rounded-2xl p-5 text-center">
        <p className="text-2xl mb-2">👍</p>
        <p className="font-bold text-gray-900 mb-1">No problem!</p>
        <p className="text-sm text-gray-500 mb-4">We'll include a guide on setting up your Facebook page for maximum impact as part of your report.</p>
        <button type="button" onClick={() => { setNoFacebook(false); onChange("NO_FACEBOOK"); }}
          className="bg-[#1877F2] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1457C0] transition-colors">
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!confirmed ? (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Facebook Page Name <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input type="text"
                placeholder="e.g. Allred Heating or RighteousNetwork"
                value={pageName}
                onChange={(e) => {
                  setPageName(e.target.value);
                  setPreviewUrl(""); setImgSrc("");
                  setShowVariations(false); setNoMore(false);
                  setVarIndex(0); onChange("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all" />
              <button type="button" onClick={handleSearch}
                disabled={!pageName.trim() || searching}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-5 py-3.5 text-sm font-bold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 shrink-0">
                {searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                Find
              </button>
            </div>
            {(email || website) && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">✓ Using your {website ? 'website + ' : ''}email to find better matches</p>
            )}
          </div>

          {previewUrl && !noMore && (
            <div className="bg-blue-50 border-2 border-[#1877F2] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide">Is this your page?</p>
                {showVariations && (
                  <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
                    {varIndex + 1} of {allVars.length}
                  </span>
                )}
              </div>
              <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-4 border border-gray-100 shadow-sm">
                {!imgError ? (
                  <img src={imgSrc} alt={currentName} onError={() => setImgError(true)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-2xl">f</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base truncate">{currentName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{previewUrl}</p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#1877F2] hover:underline font-semibold mt-1 inline-block">
                    Open on Facebook ↗
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-3 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors">
                  <Check className="w-4 h-4" /> Yes, that's it!
                </button>
                <button type="button" onClick={showVariations ? handleNext : handleNotRight}
                  className="flex-1 border-2 border-gray-200 text-gray-600 px-4 py-3 text-sm font-semibold rounded-xl hover:border-gray-400 transition-colors">
                  {showVariations ? `Next → (${allVars.length - varIndex - 1} left)` : "Not right"}
                </button>
              </div>
            </div>
          )}

          {noMore && (
            <div className="space-y-3">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-yellow-800 mb-1">😕 Having trouble finding your page?</p>
                <p className="text-xs text-yellow-700">Try one of these options below:</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button type="button" onClick={() => setShowHelp(!showHelp)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <span>📖 How to find your Facebook URL</span>
                  {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showHelp && (
                  <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
                    {[
                      { n: "1", icon: "📱", t: "Open Facebook", d: "Go to facebook.com or open the app" },
                      { n: "2", icon: "🔍", t: "Find your page", d: "Click on your business page name" },
                      { n: "3", icon: "🔗", t: "Copy the URL", d: "Copy everything in the address bar" },
                      { n: "4", icon: "📋", t: "Paste it below", d: "Paste in the URL box below" },
                    ].map(({ n, icon, t, d }) => (
                      <div key={n} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{n}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{icon} {t}</p>
                          <p className="text-xs text-gray-500">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button type="button" onClick={() => setShowUpload(!showUpload)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <span>📸 Upload screenshot — AI finds your URL</span>
                  {showUpload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showUpload && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-3">Screenshot your Facebook page and upload it — our AI reads it automatically!</p>
                    {uploadLoading ? (
                      <div className="flex items-center justify-center py-6 gap-3">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
                        <p className="text-sm text-gray-600 font-medium">AI reading your screenshot...</p>
                      </div>
                    ) : (
                      <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#1877F2] rounded-xl py-6 cursor-pointer hover:bg-blue-50 transition-colors">
                        <span className="text-3xl mb-2">📷</span>
                        <span className="text-sm font-bold text-[#1877F2]">Tap to upload screenshot</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP</span>
                        <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
              </div>

              <button type="button"
                onClick={() => window.open(`https://www.google.com/search?q=site:facebook.com+"${pageName}"`, '_blank')}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-gray-400 transition-colors text-left">
                <span className="text-xl">🔍</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">Search Google for your page</p>
                  <p className="text-xs text-gray-400">Opens a pre-filled search to find it</p>
                </div>
                <span className="text-xs text-gray-400">↗</span>
              </button>

              <button type="button" onClick={() => { setNoMore(false); setPreviewUrl(""); setShowVariations(false); setVarIndex(0); }}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-gray-400 transition-colors text-left">
                <span className="text-xl">✏️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Try a different name</p>
                  <p className="text-xs text-gray-400">Search with a different variation</p>
                </div>
              </button>

              <button type="button" onClick={() => setNoFacebook(true)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-gray-400 transition-colors text-left">
                <span className="text-xl">🚫</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">I don't have a Facebook page yet</p>
                  <p className="text-xs text-gray-400">No problem — we'll help you set one up!</p>
                </div>
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Or paste your Facebook URL directly:</p>
            <input type="url" placeholder="https://www.facebook.com/yourbusiness"
              value={pasteUrl} onChange={handlePaste}
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1877F2] transition-all" />
          </div>

          <div className="text-center">
            <button type="button" onClick={() => setNoFacebook(true)}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              I don't have a Facebook page yet
            </button>
          </div>
        </>
      ) : (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-3">
            {imgSrc && !imgError ? (
              <img src={imgSrc} alt={confirmedName}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-200 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">f</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="font-bold text-green-800 text-sm">Page Confirmed!</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{confirmedName}</p>
              <p className="text-xs text-green-600 truncate">{previewUrl || value}</p>
            </div>
          </div>
          <button type="button" onClick={handleStartOver}
            className="text-xs text-green-700 hover:underline font-semibold">
            Not right? Start over
          </button>
        </div>
      )}
    </div>
  );
}

export default function SubmitPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preloadedFbUrl, setPreloadedFbUrl] = useState("");
  const [seoScore, setSeoScore] = useState(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    businessType: "",
    city: "",
    facebook_url: "",
    mainGoal: [],
    postingFrequency: "",
    contentType: "",
  });

  useEffect(() => {
    storeUtmParams();
    trackEvent(EVENTS.INTAKE_STARTED);
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateEmailField = (email) => {
    const trimmed = email?.trim() || "";
    setEmailTouched(true);
    if (!trimmed) { setEmailError("Email is required"); return false; }
    if (!isValidEmail(trimmed)) { setEmailError("Please enter a valid email address"); return false; }
    setEmailError("");
    return true;
  };

  const fireBackgroundScrape = async (website, businessName, email) => {
    if (!website) return;
    setScrapeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/website/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: website,
          business_name: businessName,
          email: email,
        })
      });
      const data = await res.json();
      if (data.facebook_url && isValidFacebookUrl(data.facebook_url)) {
        setPreloadedFbUrl(data.facebook_url);
      }
      if (data.seo_score) setSeoScore(data.seo_score);
    } catch (err) {
      console.error('Background scrape failed:', err);
    } finally {
      setScrapeLoading(false);
    }
  };

  const goToStep = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.email.trim() && !emailError && isValidEmail(form.email);
    if (step === 2) return !!form.businessType;
    if (step === 3) return !!form.city.trim();
    if (step === 4) return form.mainGoal.length > 0;
    if (step === 5) return !!form.postingFrequency;
    if (step === 6) return !!form.contentType;
    if (step === 7) return !!form.facebook_url;
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const utm = getStoredUtmParams() || {};
      const fbUrl = form.facebook_url === "NO_FACEBOOK" ? "" : form.facebook_url;
      const res = await fetch(`${API_BASE}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          email: form.email,
          facebook_url: fbUrl,
          account_type: form.businessType,
          goals: form.mainGoal.join(", "),
          posting_frequency: form.postingFrequency,
          content_type: form.contentType,
          utm_source: utm.utm_source || null,
          utm_campaign: utm.utm_campaign || null,
          utm_adset: utm.utm_adset || null,
          utm_ad: utm.utm_ad || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.audit?.id) throw new Error(data?.error || "Audit creation failed");
      const auditId = data.audit.id;

      localStorage.setItem("pageAuditOrder", JSON.stringify({
        name: form.name,
        email: form.email,
        website: form.website,
        pageUrl: fbUrl,
        businessType: form.businessType,
        city: form.city,
        review_type: form.businessType || "Business",
        mainGoal: form.mainGoal,
        postingFrequency: form.postingFrequency,
        contentType: form.contentType,
        seoScore: seoScore,
        auditId,
      }));
      navigate("/analyzing");
    } catch (err) {
      console.error("[AUDIT ERROR]:", err);
      alert("Error creating audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-base text-black tracking-tight">PageAudit Pro</span>
          {scrapeLoading && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <div className="w-3 h-3 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              Finding your page...
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <StepProgress step={step} />

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm px-6 py-7">

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Let's get started!</h1>
                <p className="text-sm text-gray-400 mb-6">Tell us about yourself so we can personalize your audit.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Your Name <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="Jane Smith" value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type="email" placeholder="jane@yourbusiness.com" value={form.email}
                        onChange={(e) => { set("email", e.target.value); if (emailError) setEmailError(""); }}
                        onBlur={(e) => validateEmailField(e.target.value)}
                        className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-all pr-10 ${emailTouched && isValidEmail(form.email) ? "border-green-300 bg-green-50" : emailTouched && emailError ? "border-red-300" : "border-gray-100 focus:border-[#1877F2]"}`} />
                      {emailTouched && isValidEmail(form.email) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {emailTouched && emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      <Globe className="w-4 h-4 inline mr-1 text-[#1877F2]" />
                      Business Website <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input type="url" placeholder="https://yourbusiness.com" value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-start gap-2">
                      <span className="text-green-500 text-sm shrink-0">🎁</span>
                      <p className="text-xs text-green-700 font-medium">Add your website and get a <strong>FREE Website SEO Score</strong> included with your audit — limited time bonus!</p>
                    </div>
                    <WhyWeAsk>We scan your website to automatically find your Facebook page — no copy/pasting needed! We also analyze it for SEO issues and include a free score showing how Google sees your site.</WhyWeAsk>
                  </div>
                </div>
                <DidYouKnow index={0} />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What type of business are you?</h1>
                <p className="text-sm text-gray-400 mb-6">We use this to give you industry-specific strategies.</p>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map(({ value, label }) => (
                    <button key={value} type="button"
                      onClick={() => set("businessType", value)}
                      className={`text-left px-3 py-3 rounded-2xl border-2 transition-all text-sm font-medium ${form.businessType === value ? "border-[#1877F2] bg-blue-50 text-[#1877F2]" : "border-gray-100 bg-white hover:border-blue-200 text-gray-700"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <WhyWeAsk>Different business types need completely different Facebook strategies. A restaurant needs daily food photos. A plumber needs trust-building content. We tailor your entire report to your specific industry.</WhyWeAsk>
                <DidYouKnow index={1} />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What city is your business in?</h1>
                <p className="text-sm text-gray-400 mb-6">We pull local data to make your report more accurate.</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1 text-[#1877F2]" />
                    City & State
                  </label>
                  <input type="text" placeholder="e.g. Dallas, TX or Seattle, WA" value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1877F2] transition-all" />
                </div>
                <WhyWeAsk>We pull real-time data on what's working for {form.businessType || "businesses"} in your area right now. Your report will show exactly what local competitors are doing and how to beat them.</WhyWeAsk>
                <DidYouKnow index={2} />
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What's your main goal?</h1>
                <p className="text-sm text-gray-400 mb-6">Your entire action plan is built around this.</p>
                <div className="space-y-2">
                  {[
                    { val: "Grow followers", icon: "👥" },
                    { val: "Increase engagement", icon: "💬" },
                    { val: "Generate leads", icon: "💰" },
                    { val: "Build authority", icon: "⭐" },
                    { val: "Promote a cause", icon: "❤️" },
                  ].map(({ val, icon }) => (
                    <OptionCard key={val}
                      selected={form.mainGoal.includes(val)}
                      onClick={() => {
                        set("mainGoal", form.mainGoal.includes(val)
                          ? form.mainGoal.filter(x => x !== val)
                          : [...form.mainGoal, val]);
                      }}>
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>
                <WhyWeAsk>We write your 7-day action plan and 30-day roadmap specifically around this goal. A page trying to get leads needs completely different content than one trying to grow followers.</WhyWeAsk>
                <DidYouKnow index={3} />
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">How often do you post?</h1>
                <p className="text-sm text-gray-400 mb-6">This helps us assess your current posting strategy.</p>
                <div className="space-y-2">
                  {[
                    { val: "Daily", icon: "🔥" },
                    { val: "A few times a week", icon: "📅" },
                    { val: "Weekly", icon: "📆" },
                    { val: "Rarely or never", icon: "😴" },
                  ].map(({ val, icon }) => (
                    <OptionCard key={val} selected={form.postingFrequency === val} onClick={() => set("postingFrequency", val)}>
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>
                <WhyWeAsk>Posting frequency is one of the biggest factors in Facebook reach. Whether you post daily or rarely, we'll show you exactly what cadence works best for your business type.</WhyWeAsk>
                <DidYouKnow index={4} />
              </div>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">What do you post most?</h1>
                <p className="text-sm text-gray-400 mb-6">We'll analyze your content performance on this.</p>
                <div className="space-y-2">
                  {[
                    { val: "Videos", icon: "🎥" },
                    { val: "Images", icon: "📸" },
                    { val: "Text posts", icon: "✍️" },
                    { val: "Mixed content", icon: "🎨" },
                    { val: "Not sure yet", icon: "🤔" },
                  ].map(({ val, icon }) => (
                    <OptionCard key={val} selected={form.contentType === val} onClick={() => set("contentType", val)}>
                      {icon} {val}
                    </OptionCard>
                  ))}
                </div>
                <WhyWeAsk>Different content types perform very differently on Facebook. Videos get 5x more reach than images. We'll show you exactly what content mix will get you the most growth.</WhyWeAsk>
                <DidYouKnow index={5} />
              </div>
            )}

            {/* STEP 7 */}
            {step === 7 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {preloadedFbUrl ? "We found your page! 🎉" : "Find Your Facebook Page"}
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  {preloadedFbUrl
                    ? "We scanned your website and found this — is it correct?"
                    : "Search for your page so we can analyze it. Optional but makes your report much more accurate!"}
                </p>
                <FacebookPageFinder
                  value={form.facebook_url}
                  onChange={(url) => set("facebook_url", url)}
                  email={form.email}
                  website={form.website}
                  preloadedUrl={preloadedFbUrl}
                />
                {scrapeLoading && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    Still searching for your page...
                  </div>
                )}
                <DidYouKnow index={6} />
              </div>
            )}

            {/* Navigation */}
            <div className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button type="button" onClick={() => goToStep(step - 1)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="button"
                disabled={!canNext() || isSubmitting}
                onClick={() => {
                  if (step === 1) {
                    if (!validateEmailField(form.email)) return;
                    fireBackgroundScrape(form.website, form.name, form.email);
                  }
                  if (step < TOTAL_STEPS) goToStep(step + 1);
                  else handleSubmit();
                }}
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3.5 text-sm font-bold rounded-2xl hover:bg-[#1457C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-100">
                {step === TOTAL_STEPS
                  ? (isSubmitting ? "Submitting..." : "Get My Audit →")
                  : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










