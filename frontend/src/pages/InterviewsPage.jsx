import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Calendar, Clock, Video, MapPin, Building, ChevronRight, AlertCircle } from 'lucide-react';
import { interviewsApi } from '../services/api';

export default function InterviewsPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => interviewsApi.my(),
  });

  return (
    <DashboardLayout>
      <div className="text-xl font-semibold">Interview Schedule</div>
      <div className="text-sm text-slate-500">Upcoming interviews & details.</div>

      <div className="mt-5 grid gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="mb-4 overflow-hidden border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : items?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {items.map((i) => {
              const dateObj = new Date(i.scheduled_at);
              const isPast = dateObj < new Date();
              
              return (
                <Card key={i.id} className={`group relative overflow-hidden transition-all duration-200 ${isPast ? 'opacity-70 bg-slate-50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-800'}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={`w-2 hidden md:block ${isPast ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-500'}`}></div>
                      
                      <div className="p-5 md:p-6 flex-1 flex flex-col md:flex-row md:items-center gap-6 justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 border ${isPast ? 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700' : 'bg-brand-50 border-brand-100 text-brand-600 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-400'}`}>
                            <Calendar className="h-6 w-6" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                Application #{i.application_id} Interview
                              </h3>
                              {isPast && <Badge variant="secondary" className="text-xs">Past</Badge>}
                              {!isPast && <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 border-none shadow-none text-xs">Upcoming</Badge>}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm mt-2 text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              
                              <span className="flex items-center gap-1.5">
                                {i.mode?.toLowerCase() === 'online' || i.meeting_link ? (
                                  <><Video className="h-4 w-4 text-slate-400" /> {i.mode || 'Online'}</>
                                ) : (
                                  <><MapPin className="h-4 w-4 text-slate-400" /> {i.mode || 'In-person'}</>
                                )}
                              </span>
                            </div>
                            
                            {i.location && !i.meeting_link && (
                              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 flex items-start gap-1">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {i.location}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                          {i.meeting_link ? (
                            <Button 
                              asChild 
                              className="w-full sm:w-auto gap-2" 
                              variant={isPast ? "outline" : "default"}
                              disabled={isPast}
                            >
                              <a href={i.meeting_link} target="_blank" rel="noreferrer">
                                <Video className="h-4 w-4" />
                                Join Meeting
                              </a>
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full sm:w-auto gap-2" disabled>
                              <AlertCircle className="h-4 w-4" />
                              Link Pending
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950/50">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No interviews scheduled</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">You don't have any upcoming interviews at the moment. Keep applying to land your dream role!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
