import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Video, Clock, Filter, Plus } from 'lucide-react';

export default function RecruiterInterviewsPage() {
  return (
     <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Interviews</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Schedule and manage candidate interviews.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Schedule Interview
          </Button>
        </div>
      </div>

       <Card className="mt-8 border-dashed bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-20 w-20 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No upcoming interviews</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              You haven't scheduled any interviews yet. Select candidates from your pipeline to set up meetings.
            </p>
            <Button>Schedule Interview</Button>
          </CardContent>
       </Card>
    </div>
  );
}
