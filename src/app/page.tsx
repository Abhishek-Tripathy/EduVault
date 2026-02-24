"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Search, Shield, Upload } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user, isLoading } = useAuth();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const floatingVariants: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Floating Icons Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden md:block opacity-30 dark:opacity-20">
        <motion.div variants={floatingVariants} animate="animate" className="absolute top-[20%] left-[15%] text-primary">
          <BookOpen className="w-16 h-16" />
        </motion.div>
        <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: "1s" }} className="absolute top-[30%] right-[20%] text-zinc-400">
          <Upload className="w-12 h-12" />
        </motion.div>
        <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: "2s" }} className="absolute bottom-[25%] left-[25%] text-zinc-400">
          <Shield className="w-14 h-14" />
        </motion.div>
        <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: "3s" }} className="absolute bottom-[30%] right-[15%] text-primary/70">
          <Search className="w-20 h-20" />
        </motion.div>
      </div>

      <motion.div 
        className="z-10 flex flex-col items-center max-w-4xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          The Ultimate Academic Vault
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground mb-6 drop-shadow-sm">
          Empowering Education with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">EduVault</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted max-w-2xl mb-10 leading-relaxed bg-background/80 backdrop-blur-sm p-4 rounded-xl">
          A lightning-fast, secure, and modern platform for Academies to publish resources and for Students to instantly search, preview, and download them. 
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {!isLoading && user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-border font-bold text-lg text-foreground hover:bg-surface transition-all hover:scale-105 active:scale-95 bg-background/50 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border w-full max-w-3xl border-t border-border pt-8 relative z-20 bg-background/50 backdrop-blur-md rounded-2xl p-4 shadow-sm">
           <div className="flex flex-col items-center">
             <span className="text-3xl font-black text-foreground">10x</span>
             <span className="text-xs text-muted font-medium uppercase mt-1">Faster Search</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-3xl font-black text-foreground">Secure</span>
             <span className="text-xs text-muted font-medium uppercase mt-1">JWT Auth</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-3xl font-black text-foreground">Edge</span>
             <span className="text-xs text-muted font-medium uppercase mt-1">Redis Cache</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-3xl font-black text-primary">Free</span>
             <span className="text-xs text-muted font-medium uppercase mt-1">Forever</span>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
