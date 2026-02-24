"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

interface UploadFormData {
  subjectName: string;
  className: string;
  schoolName: string;
  file: FileList;
}

export function AcademyDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UploadFormData>();
  const selectedFile = watch("file");

  const onSubmit = async (data: UploadFormData) => {
    setError(null);
    setSuccess(false);
    setIsUploading(true);

    if (!data.file || data.file.length === 0) {
      setError("Please select a PDF file");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("subjectName", data.subjectName);
    formData.append("className", data.className);
    formData.append("schoolName", data.schoolName);

    try {
      const res = await fetch("/api/pdfs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Upload failed");
      } else {
        setSuccess(true);
        reset();
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
    </div>
  );
}
