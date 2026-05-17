import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Building, Calendar, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.my()
  });

  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'applied':
      case 'pending': return { color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock, label: 'Applied' };
      case 'reviewed': return { color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle2, label: 'Under Review' };
      case 'interview':
      case 'interviewing': return { color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400', icon: Calendar, label: 'Interview Scheduled' };
      case 'offered':
      case 'accepted': return { color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Offer Received' };
      case 'rejected': return { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Not Selected' };
      default: return { color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400', icon: Clock, label: status || 'Unknown' };
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Applications</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400 text-lg">Track your job and internship application statuses.</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {isLoading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <Card key={i} className="mb-4">
               <CardContent className="p-6">
                 <Skeleton className="h-6 w-1/3 mb-2" />
                 <Skeleton className="h-4 w-1/4" />
               </CardContent>
             </Card>
           ))
        ) : applications?.length > 0 ? (
          applications.map(app => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={app.id} className="overflow-hidden hover:shadow-md transition-all border-slate-200 dark:border-slate-800 group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Status vertical bar (visual accent) */}
                    <div className={`w-1.5 hidden md:block ${statusConfig.color.split(' ')[0]}`}></div>
                    
                    <div className="p-5 md:p-6 flex-1 flex flex-col md:flex-row gap-5 md:items-center justify-between">
                      <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 mt-1">
                          <Building className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-brand-600 transition-colors">
                            {app.job?.title || 'Unknown Role'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                             <span className="font-medium">{app.job?.company?.name || 'Company Name'}</span>
                             <span>•</span>
                             <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                        <Badge className={`px-3 py-1 text-sm font-medium border flex items-center gap-1.5 justify-center md:justify-start w-full md:w-auto shadow-none ${statusConfig.color}`}>
                           <StatusIcon className="h-4 w-4" />
                           {statusConfig.label}
                        </Badge>
                        <Button variant="ghost" size="sm" className="hidden md:flex gap-1 group-hover:text-brand-600">
                          View details <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950/50">
             <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No applications yet</h3>
             <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't applied to any jobs yet. Start exploring opportunities to build your career.</p>
             <Button size="lg" asChild>
                <Link to="/jobs">Find Jobs</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
