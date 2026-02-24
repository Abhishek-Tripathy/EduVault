"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, FileText, CheckCircle2, Eye, Download, X, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { upload } from "@vercel/blob/client";

interface UploadFormData {
  subjectName: string;
  className: string;
  schoolName: string;
  file: FileList;
}

interface PdfResult {
  id: string;
  fileUrl: string;
  subjectName: string;
  className: string;
  schoolName: string;
  createdAt: string;
}

export function AcademyDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // My Uploads State
  const [myUploads, setMyUploads] = useState<PdfResult[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UploadFormData>();
  const selectedFile = watch("file");

  const fetchMyUploads = useCallback(async () => {
    setIsLoadingUploads(true);
    setUploadsError(null);
    try {
      const res = await fetch("/api/pdfs?mine=true");
      if (!res.ok) throw new Error("Failed to fetch uploads");
      const json = await res.json();
      setMyUploads(json.data || []);
    } catch (err) {
      setUploadsError("An error occurred while fetching your documents.");
    } finally {
      setIsLoadingUploads(false);
    }
  }, []);

  useEffect(() => {
    fetchMyUploads();
  }, [fetchMyUploads]);

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

  const onSubmit = async (data: UploadFormData) => {
    setError(null);
    setSuccess(false);
    setIsUploading(true);

    if (!data.file || data.file.length === 0) {
      setError("Please select a PDF file");
      setIsUploading(false);
      return;
    }

    try {
      // Step 1: Upload file directly from browser to Vercel Blob
      const file = data.file[0];
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/pdfs/upload",
      });

      // Step 2: Save only metadata + fileUrl to the database
      const res = await fetch("/api/pdfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: blob.url,
          subjectName: data.subjectName,
          className: data.className,
          schoolName: data.schoolName,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Upload failed");
      } else {
        setSuccess(true);
        reset();
        fetchMyUploads();
      }
    } catch (err) {
      setError("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Upload New PDF Document
        </h2>
        <p className="text-muted mb-6">
          Share your educational materials with students. Fill out the metadata below to make your document searchable.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm flex items-center gap-2 border border-green-200 dark:border-green-800"
          >
            <CheckCircle2 className="w-5 h-5" />
            File successfully uploaded and made available to students!
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Subject Name</label>
              <input
                {...register("subjectName", { required: "Subject is required" })}
                placeholder="e.g. Mathematics"
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.subjectName && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.subjectName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Class / Grade Level</label>
              <input
                {...register("className", { required: "Class is required" })}
                placeholder="e.g. 10th Grade"
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.className && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.className.message}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-foreground">School / Institute Name</label>
              <input
                {...register("schoolName", { required: "School is required" })}
                placeholder="e.g. Delhi Public School"
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.schoolName && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.schoolName.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-foreground">Select PDF File</label>
              <label 
                htmlFor="file-upload"
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md bg-background hover:bg-surface transition-colors cursor-pointer group"
              >
                <div className="space-y-1 text-center">
                  <FileText className={`mx-auto h-12 w-12 transition-colors ${selectedFile && selectedFile.length > 0 ? "text-primary" : "text-muted group-hover:text-primary"}`} />
                  <div className="flex text-sm text-muted justify-center">
                    <span className="relative font-medium text-primary group-hover:text-primary/80 w-full overflow-hidden text-ellipsis whitespace-nowrap px-4">
                      <span>
                        {selectedFile && selectedFile.length > 0 
                          ? selectedFile[0].name 
                          : "Upload a file or drag and drop"}
                      </span>
                      <input 
                        id="file-upload" 
                        type="file" 
                        accept=".pdf" 
                        className="sr-only" 
                        {...register("file", { required: "PDF file is required" })}
                      />
                    </span>
                  </div>
                  {!selectedFile || selectedFile.length === 0 ? (
                    <p className="text-xs text-muted">
                      PDF up to 10MB
                    </p>
                  ) : null}
                </div>
              </label>
              {errors.file && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.file.message as React.ReactNode}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full sm:w-auto bg-primary text-white font-medium py-2 px-8 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Uploads Section */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          My Published Documents
        </h2>

        {uploadsError && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm text-center border border-red-200 dark:border-red-800">
            {uploadsError}
          </div>
        )}

        {isLoadingUploads ? (
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
        ) : myUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myUploads.map((pdf) => (
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
          <div className="text-center py-12 bg-background rounded-xl border border-dashed border-border">
            <FileText className="w-12 h-12 text-border mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground">No documents published yet</h3>
            <p className="text-muted mt-1">Upload your first PDF document above to get started.</p>
          </div>
        )}
      </div>

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
