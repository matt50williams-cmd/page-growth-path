import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import remarkGfm from "remark-gfm";
import { CheckCircle, Download, Share2, Copy, ClipboardCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_BASE = "https://pageaudit-engine.onrender.com";

function cleanMarkdown(text) {
  if (!text) return text;
  return text
    .replace(/^[ \t]*--[ \t]*$/gm, '---')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n').map(l => l.trimEnd()).join('\n');
}

function splitIntoSections(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const isHeading = /^#{1,3}\s+/.test(line);
    if (isHeading) {
      if (current) sections.push(current);
      const title = line.replace(/^#{1,3}\s+/, '').replace(/\*+/g, '').trim();
      current = { title, lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      if (!sections.length) sections.push({ title: '', lines: [line] });
      else sections[0].lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.lines.some(l => l.trim()));
}

const SECTION_META = {
  'executive summary': { icon: '📊', accent: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-700' },
  'growth blocker': { icon: '🚧', accent: 'border-l-red-400', badge: 'bg-red-50 text-red-700' },
  'action plan': { icon: '✅', accent: 'border-l-green-500', badge: 'bg-green-50 text-green-700' },
  '7-day': { icon: '📅', accent: 'border-l-green-500', badge: 'bg-green-50 text-green-700' },
  'content strategy': { icon: '💡', accent: 'border-l-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
  'content': { icon: '💡', accent: 'border-l-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
  'followers into': { icon: '💰', accent: 'border-l-purple-400', badge: 'bg-purple-50 text-purple-700' },
  'customers': { icon: '💰', accent: 'border-l-purple-400', badge: 'bg-purple-50 text-purple-700' },
  'roadmap': { icon: '🗺️', accent: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-700' },
  '30-day': { icon: '🗺️', accent: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-700' },
  'going on': { icon: '🔍', accent: 'border-l-blue-400', badge: 'bg-blue-50 text-blue-700' },
  'competitor': { icon: '🏆', accent: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-700' },
};

const DEFAULT_META = { icon: '📌', accent: 'border-l-gray-300', badge: 'bg-gray-50 text-gray-600' };

function getSectionMeta(title) {
  const lower = title.toLowerCase();
  for (const [key, meta] of Object.entries(SECTION_META)) {
    if (lower.includes(key)) return meta;
  }
  return DEFAULT_META;
}

const markdownComponents = {
  table: ({ children }) => (
    <div className="overflow-x-auto my-5 rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 text-gray-800 border-t border-gray-100">{children}</td>,
  tr: ({ children }) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
  ul: ({ children }) => <ul className="pl-5 space-y-2.5 my-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2.5 my-4">{children}</ol>,
  li: ({ children }) => (
    <li className="text-gray-800 leading-relaxed list-none flex gap-2.5 items-start">
      <span className="text-[#1877F2] font-bold mt-0.5 shrink-0">•</span>
      <span>{children}</span>
    </li>
  ),
  p: ({ children }) => <p className="text-gray-700 leading-[1.8] my-3 max-w-2xl">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-gray-900 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-sm">{children}</strong>,
  h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mt-8 mb-3 border-b-2 border-[#1877F2]/20 pb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold text-gray-900 mt-6 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold text-[#1877F2] mt-5 mb-2 uppercase tracking-wide">{children}</h3>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-[#1877F2] bg-blue-50 rounded-r-xl px-5 py-4 my-5 text-gray-800 italic text-sm leading-relaxed">{children}</blockquote>,
  hr: () => <hr className="border-gray-200 my-6" />,
};

function SectionedReport({ text }) {
  if (!text) return null;
  const cleaned = cleanMarkdown(text);
  const sections = splitIntoSections(cleaned);
  if (sections.length < 2) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6">
        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {sections.map((section, i) => {
        const meta = section.title ? getSectionMeta(section.title) : DEFAULT_META;
        return (
          <div key={i} className={`bg-white border border-gray-200 border-l-4 ${meta.accent} rounded-xl overflow-visible`}>
            {section.title && (
              <div className="px-5 pt-4 pb-3 flex items-center gap-2.5 border-b border-gray-100">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta.badge}`}>{meta.icon}</span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 leading-tight">{section.title}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-0.5">Section {i + 1}</p>
                </div>
              </div>
            )}
            <div className="px-5 pb-5 pt-3">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {section.lines.join('\n')}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Report() {
  const { id } = useParams();
  const { isLoadingAuth } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [rawText, setRawText] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const [error, setError] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReportFromData = (data) => {
    setSubmission({
      name: data.name || data.customer_name || "",
      email: data.email || "",
      facebook_url: data.pageUrl || data.facebook_url || "",
      mainGoal: data.mainGoal || data.goals || "",
    });
    const text = data.report_text || data.report || data.reportText || "";
    setRawText(text);
  };

  useEffect(() => {
    if (isLoadingAuth) return;
    setLoading(true);
    const loadReport = async () => {
      if (id && id !== ":id") {
        const tryLocal = (key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          try { return JSON.parse(raw); } catch { return null; }
        };
        const localData = tryLocal(`pageAuditReport_${id}`) || tryLocal("pageAuditReport");
        if (localData && (localData.report_text || localData.report || localData.reportText)) {
          setReportId(id);
          loadReportFromData(localData);
          setError(false);
          setLoading(false);
          return;
        }
        try {
          const token = localStorage.getItem('pageaudit_token');
          const res = await fetch(`${API_BASE}/api/audits/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const reportData = await res.json();
          if (reportData && !reportData.error) {
            setReportId(id);
            loadReportFromData(reportData);
            setError(false);
          } else {
            setError(true);
          }
        } catch (err) {
          setError(true);
        }
        setLoading(false);
        return;
      }
      const savedReport = localStorage.getItem("pageAuditReport");
      if (!savedReport) { setError(true); setLoading(false); return; }
      try {
        const data = JSON.parse(savedReport);
        setReportId(data._localId || id);
        loadReportFromData(data);
        setError(false);
      } catch (e) {
        setError(true);
      }
      setLoading(false);
    };
    loadReport();
  }, [id, isLoadingAuth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDownloadPDF = () => window.print();

  const handleShare = () => {
    if (!reportId) { alert("Unable to create share link"); return; }
    navigator.clipboard.writeText(`${window.location.origin}/report/${reportId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyReport = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawText || '').then(() => {
        setReportCopied(true);
        setTimeout(() => setReportCopied(false), 2500);
      });
    }
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <span className="font-bold text-sm tracking-tight">PageAudit Pro</span>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-20 text-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Report Found</h1>
            <p className="text-gray-500 text-sm mb-6">We couldn't load your report. Please start a new audit.</p>
            <a href="/" className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#1457C0] transition-colors">Start New Audit</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans text-black">
      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <span className="font-bold text-sm tracking-tight shrink-0">PageAudit Pro</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-8">
        {submission && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-br from-[#0f2a6b] via-[#1877F2] to-[#2563eb] px-8 py-10 text-white">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">PageAudit Pro — Confidential Report</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">Facebook Growth Audit</h1>
              <p className="text-blue-200 text-lg font-medium mb-8">Personalized Strategy Report</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {submission.name && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Prepared For</p>
                    <p className="text-white font-bold text-sm truncate">{submission.name}</p>
                  </div>
                )}
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Date</p>
                  <p className="text-white font-bold text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                {submission.mainGoal && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Primary Goal</p>
                    <p className="text-white font-bold text-sm truncate">{submission.mainGoal}</p>
                  </div>
                )}
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Report Type</p>
                  <p className="text-white font-bold text-sm">Full Strategy Audit</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-t-0 border-gray-200 px-8 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">✓ Completed</span>
                {submission.facebook_url && (
                  <a href={submission.facebook_url.startsWith('http') ? submission.facebook_url : `https://${submission.facebook_url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#1877F2] hover:underline truncate max-w-[200px]">
                    {submission.facebook_url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyReport}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${reportCopied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {reportCopied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {reportCopied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-all">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button onClick={handleShare}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        )}

        {rawText ? (
          <SectionedReport text={rawText} />
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8 shadow-sm text-center">
            <p className="text-red-600 font-semibold">Report failed to generate. Please try again.</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 pb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold text-gray-500">PageAudit Pro</span>
          <span>Confidential Report</span>
        </div>
      </div>
    </div>
  );
}