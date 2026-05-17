import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Building, Clock, ChevronRight, Bookmark, ArrowRight, Zap, Target, FileText } from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Mock data fetching, replacing with real API later
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      return { 
        stats: { applied: 12, interviewing: 2, offers: 1 },
        profileCompletion: 75,
        recommendedJobs: [
          { id: 1, title: 'Frontend Developer Intern', company: 'TechNova', location: 'Remote', salary: '$3K-$5K/mo', type: 'Internship', match: 92 },
          { id: 2, title: 'Software Engineer', company: 'GlobalSystems', location: 'San Francisco, CA', salary: '$100K-$130K/yr', type: 'Full-time', match: 85 },
          { id: 3, title: 'UX/UI Designer', company: 'CreativePulse', location: 'New York, NY', salary: '$80K-$110K/yr', type: 'Full-time', match: 78 }
        ]
      }; 
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4 mb-6" />
          <div className="grid gap-6 md:grid-cols-3">
             {Array.from({ length: 3 }).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-2xl" />
             ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3 mt-6">
             <Skeleton className="h-96 md:col-span-2 rounded-2xl" />
             <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400 text-lg">
              Here's what's happening with your job search today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/profile">Edit Profile</Link>
            </Button>
            <Button asChild>
              <Link to="/jobs">Find Jobs</Link>
            </Button>
          </div>
        </div>

        {/* Profile Completion & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Completion Card */}
          <Card className="col-span-1 md:col-span-3 lg:col-span-1 border-brand-100 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/20 dark:to-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Profile Strength
                <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400">Intermediate</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{dashboardData?.profileCompletion}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-brand-500 transition-all duration-1000 ease-in-out" 
                  style={{ width: `${dashboardData?.profileCompletion}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Add your resume and skills to stand out to more recruiters.</p>
              <Button variant="link" className="px-0 h-auto font-medium text-brand-600 dark:text-brand-400 group" asChild>
                <Link to="/profile">
                  Complete Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Application Stats */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="flex flex-col justify-center">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium text-sm">Applications</span>
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">{dashboardData?.stats?.applied || 0}</div>
              </CardContent>
            </Card>
            <Card className="flex flex-col justify-center">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-brand-500 dark:text-brand-400 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="font-medium text-sm">Interviewing</span>
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">{dashboardData?.stats?.interviewing || 0}</div>
              </CardContent>
            </Card>
            <Card className="flex flex-col justify-center hidden lg:flex border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-medium text-sm">Offers</span>
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">{dashboardData?.stats?.offers || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Jobs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Recommended for You</h3>
              <Button variant="ghost" asChild className="text-slate-500">
                <Link to="/jobs">See all <ChevronRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </div>
            
            <div className="space-y-4">
              {dashboardData?.recommendedJobs.map(job => (
                <Card key={job.id} className="group hover:shadow-md transition-all border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <Building className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-lg truncate group-hover:text-brand-600 transition-colors">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h4>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50 shrink-0">
                          {job.match}% Match
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">
                        {job.company}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {job.salary}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      <Button className="w-full sm:w-auto flex-1">Apply Now</Button>
                      <Button variant="outline" size="icon" className="shrink-0 w-10 sm:w-auto">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Center / Upcoming */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Upcoming</h3>
            
            <Card>
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-md">Interviews & Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-4">
                    <div className="flex gap-4 border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400 shrink-0">
                        <span className="text-xs font-bold uppercase">OCT</span>
                        <span className="text-lg font-bold leading-none">24</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-slate-900 dark:text-white">Technical Interview</h5>
                        <p className="text-xs text-slate-500 mt-1">TechNova • Online • 2:00 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                        <span className="text-xs font-bold uppercase">NOV</span>
                        <span className="text-lg font-bold leading-none">01</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-slate-900 dark:text-white">Application Deadline</h5>
                        <p className="text-xs text-slate-500 mt-1">GlobalSystems • Software Engineer</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 text-center">
                      <Button variant="outline" className="w-full text-xs" asChild>
                         <Link to="/interviews">View Calendar</Link>
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
