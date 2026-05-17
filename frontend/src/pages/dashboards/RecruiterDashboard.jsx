import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi, analyticsApi } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Briefcase, CalendarCheck, TrendingUp } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

export default function RecruiterDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: async () => {
      // Fetch data for the dashboard statistics
      // Let's assume some API responses or fallback to empty data
      return { stats: { totalJobs: 12, totalApplicants: 145, upcomingInterviews: 4 } }; 
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           {Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-32 w-full rounded-xl" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats?.totalApplicants || 0}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{dashboardData?.stats?.upcomingInterviews || 0}</div>
             <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">12.5%</div>
             <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart and Activity Feed will be implemented here */}
      <h3 className="text-xl font-bold mt-10 mb-4">Pipeline Summary & Analytics</h3>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
         <Card className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-dashed">
            <p className="text-slate-500">Analytics visualization coming soon</p>
         </Card>
          <Card className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-dashed">
            <p className="text-slate-500">Activity stream coming soon</p>
         </Card>
      </div>

    </div>
  )
}
