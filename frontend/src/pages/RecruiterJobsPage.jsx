import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Edit2, Archive, MoreVertical, MapPin, Building, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export default function RecruiterJobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.getAll()
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Job Listings</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Manage and track your active role postings.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Job</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="flex flex-col h-full rounded-2xl">
               <CardHeader className="pb-2">
                 <Skeleton className="h-6 w-3/4 mb-2" />
                 <Skeleton className="h-4 w-1/2" />
               </CardHeader>
               <CardContent className="flex-1 mt-4">
                 <Skeleton className="h-4 w-full mb-2" />
                 <Skeleton className="h-4 w-4/5 pb-2" />
                 <div className="flex gap-2 mt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                 </div>
               </CardContent>
             </Card>
          ))
        ) : (jobs?.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl group relative bg-white dark:bg-slate-950/50">
              <div className="absolute top-4 right-4 z-10 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 dark:bg-slate-900/50 bg-white/50 backdrop-blur-sm shadow-sm md:opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-600">
                       <Archive className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={job.is_active ? 'default' : 'secondary'} className="mb-2">
                    {job.is_active ? 'Active' : 'Closed'}
                  </Badge>
                </div>
                <CardTitle className="leading-tight text-xl mb-1 pr-6 group-hover:text-brand-600 transition-colors">
                  {job.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-slate-500">
                   <Building className="h-3.5 w-3.5" />
                   {job.company?.name || 'Your Company'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4 flex-1">
                 <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 opacity-70" />
                      {job.location}
                    </div>
                    <div>
                      <span className="opacity-70 mr-1">•</span>
                      {job.employment_type?.replace('_', ' ')}
                    </div>
                    {job.salary_range && (
                      <div>
                        <span className="opacity-70 mr-1">•</span>
                        {job.salary_range}
                      </div>
                    )}
                 </div>
                 
                 <div className="mt-auto pt-4 flex gap-2">
                   {job.requirements?.slice(0, 3).map(req => (
                     <Badge key={req} variant="outline" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[10px] uppercase font-medium">
                       {req}
                     </Badge>
                   ))}
                  </div>
              </CardContent>

              <CardFooter className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 py-3 flex justify-between items-center text-sm">
                 <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">0</span> candidates
                 </div>
                 <span className="text-xs text-slate-400">
                   Posted {new Date(job.created_at).toLocaleDateString()}
                 </span>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
             <Briefcase className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No jobs posted</h3>
             <p className="text-slate-500 mt-1 max-w-sm mx-auto">Get started by creating your first job listing to start receiving applications.</p>
             <Button className="mt-4">Create Job</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
