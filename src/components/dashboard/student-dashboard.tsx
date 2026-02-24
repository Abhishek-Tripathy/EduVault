"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Download, Clock, X, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PdfResult {
  id: string;
  fileUrl: string;
  subjectName: string;
  className: string;
  schoolName: string;
  createdAt: string;
  academyEmail: string;
}

export function StudentDashboard() {
  const [results, setResults] = useState<PdfResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchPdfs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.append("subject", subjectFilter);
      if (classFilter) params.append("class", classFilter);
      if (schoolFilter) params.append("school", schoolFilter);

      const res = await fetch(`/api/pdfs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to search PDFs");
      }

      const json = await res.json();
      setResults(json.data || []);
    } catch (err) {
      setError("An error occurred while fetching documents.");
    } finally {
      setIsLoading(false);
    }
  }, [subjectFilter, classFilter, schoolFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPdfs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchPdfs]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Search Documents
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted uppercase tracking-wide">Subject</label>
            <input
              type="text"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="Filter by subject..."
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted uppercase tracking-wide">Class / Grade</label>
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Filter by class..."
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted uppercase tracking-wide">School / Institute</label>
            <input
              type="text"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              placeholder="Filter by school..."
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-muted">
          {isLoading ? "Searching..." : `Found ${results.length} documents`}
        </div>
      </div>

      {/* Results Grid */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm text-center border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-surface border border-border rounded-xl p-5 h-48">
              <div className="h-6 bg-border rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-border rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-border rounded w-2/3 mb-6"></div>
              <div className="h-10 bg-border rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((pdf) => (
            <div key={pdf.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(pdf.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <h3 className="font-bold text-foreground capitalize text-lg mb-1 truncate" title={pdf.subjectName}>
                  {pdf.subjectName}
                </h3>
                
                <div className="space-y-1 mt-3 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="w-16 font-semibold text-xs uppercase text-muted">Class:</span>
                    <span className="capitalize truncate text-foreground">{pdf.className}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-16 font-semibold text-xs uppercase text-muted">School:</span>
                    <span className="capitalize truncate text-foreground">{pdf.schoolName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-16 font-semibold text-xs uppercase text-muted">By:</span>
                    <span className="truncate text-foreground">{pdf.academyEmail}</span>
                  </p>
                </div>
              </div>
              
              <div className="border-t border-border p-4 bg-background grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPreviewUrl(pdf.fileUrl)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button 
                  onClick={() => handleDownload(pdf.fileUrl, `${pdf.subjectName}-${pdf.className}.pdf`)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <FileText className="w-12 h-12 text-border mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground">No documents found</h3>
          <p className="text-muted mt-1">Try adjusting your search filters or check back later.</p>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2">
          <div className="bg-surface w-full max-w-6xl h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border">
            <div className="flex justify-between items-center px-4 py-2 border-b border-border shrink-0">
              <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                Document Preview
              </h3>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="text-muted hover:text-foreground p-1.5 rounded-md hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <iframe 
                src={`${previewUrl}#view=FitH`} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
