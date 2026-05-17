import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Search, MapPin, Briefcase, DollarSign, Bookmark, Building, Filter, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', searchTerm],
    queryFn: () => jobsApi.getAll()
  });

  // Mock filtering
  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (job.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Header */}
      <div className="bg-slate-950 px-6 py-12 md:py-16 text-center shrink-0">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Find your next opportunity.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-normal max-w-2xl mx-auto">
            Discover internships and full-time roles carefully curated for students and new graduates.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
              <Input 
                className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-brand-500"
                placeholder="Job title, company, or keywords..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-brand-600 hover:bg-brand-700">Search Roles</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b border-slate-200 dark:border-slate-800">
              <Filter className="h-5 w-5" /> Filters
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Job Type</h4>
              <div className="space-y-2">
                {['Full-time', 'Internship', 'Part-time', 'Contract'].map(type => (
                  <label key={type} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Location</h4>
              <div className="space-y-2">
                {['Remote', 'On-site', 'Hybrid'].map(loc => (
                  <label key={loc} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
                    {loc}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Job Feed */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-slate-500 font-medium">
                Showing {filteredJobs?.length || 0} recommended jobs
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="lg:hidden gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
                <div className="hidden sm:flex border border-slate-200 dark:border-slate-800 rounded-md p-1">
                   <Button variant="ghost" size="sm" className="h-7 w-8 p-0 bg-slate-100 dark:bg-slate-800">
                     <LayoutGrid className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
               Array.from({ length: 4 }).map((_, i) => (
                 <Card key={i} className="mb-4">
                   <CardContent className="p-6">
                     <Skeleton className="h-6 w-1/3 mb-2" />
                     <Skeleton className="h-4 w-1/4 mb-4" />
                     <Skeleton className="h-4 w-full mb-2" />
                     <Skeleton className="h-4 w-5/6" />
                   </CardContent>
                 </Card>
               ))
            ) : filteredJobs?.length > 0 ? (
               filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="group relative overflow-hidden bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-brand-800"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      {/* Company Logo Avatar */}
                      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                        <Building className="h-8 w-8 text-slate-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link to={`/jobs/${job.id}`} className="group-hover:text-brand-600 transition-colors focus:outline-none">
                              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight">
                                {job.title}
                              </h2>
                            </Link>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-300 mb-4">
                              {job.company?.name || 'Partner Company'}
                            </p>
                          </div>
                          
                          {/* Save Button */}
                          <button className="text-slate-400 hover:text-brand-600 transition-colors p-1">
                            <Bookmark className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-4">
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            <Briefcase className="h-4 w-4 text-slate-500" />
                            {job.employment_type?.replace('_', ' ') || 'Full Time'}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            {job.location || 'Remote'}
                          </span>
                          {job.salary_range && (
                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                              <DollarSign className="h-4 w-4 text-slate-500" />
                              {job.salary_range}
                            </span>
                          )}
                        </div>

                        {/* Skills/Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.requirements.slice(0, 4).map((req, i) => (
                              <Badge key={i} variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-normal">
                                {req}
                              </Badge>
                            ))}
                            {job.requirements.length > 4 && (
                              <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500 font-normal">
                                +{job.requirements.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {job.description || "We are looking for a talented individual to join our team..."}
                        </div>
                      </div>

                      {/* Call to action */}
                      <div className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col gap-2 shrink-0">
                         <Button className="w-full sm:w-32 shadow-sm font-medium">Apply</Button>
                         <span className="text-xs text-slate-400 text-center sm:text-right mt-1">
                           Posted {new Date(job.created_at).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                 <Briefcase className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                 <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No jobs found</h3>
                 <p className="text-slate-500 mt-1 max-w-sm mx-auto">Try tracking different keywords or adjust your filters.</p>
                 <Button variant="outline" className="mt-6" onClick={() => setSearchTerm('')}>Clear Search</Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
