"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AcademyDashboard } from "@/components/dashboard/academy-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { Loader } from "@/components/loader";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-primary">{user.name}</span>
        </h1>
        <p className="text-muted text-sm">You are logged in as an {user.role}</p>
      </div>
      
      {user.role === "ACADEMY" ? <AcademyDashboard /> : <StudentDashboard />}
    </div>
  );
}
