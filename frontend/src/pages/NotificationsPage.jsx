import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { notificationsApi } from '../services/api';
import { Bell, Check, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.my(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-notifications-count']);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-notifications-count']);
    },
  });

  const unreadCount = items?.filter(n => !n.is_read)?.length || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-brand-500 text-white rounded-full px-2.5 py-0.5 text-sm">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400 text-lg">Stay updated on your applications and interviews.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => markAllReadMutation.mutate()}
          disabled={unreadCount === 0 || markAllReadMutation.isLoading}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3 pt-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="mb-3 border-transparent shadow-sm">
              <CardContent className="p-5 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : items?.length > 0 ? (
          items.map((n) => (
            <Card 
              key={n.id} 
              className={`group flex items-start p-5 transition-all duration-200 border-l-4 ${!n.is_read ? 'bg-white dark:bg-slate-900 shadow-sm border-brand-500 dark:border-brand-500' : 'bg-slate-50/50 dark:bg-slate-950 border-transparent dark:border-transparent opacity-75 hover:opacity-100'}`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                  <Bell className="h-5 w-5" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-semibold text-base ${!n.is_read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
                      {new Date(n.created_at).toLocaleDateString() !== new Date().toLocaleDateString() ? (
                         new Date(n.created_at).toLocaleDateString()
                      ) : (
                         <><Clock className="h-3 w-3" /> Today at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${!n.is_read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {n.message}
                  </p>
                  
                  {!n.is_read && (
                    <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:text-brand-300 dark:hover:bg-brand-900/30"
                        onClick={() => markReadMutation.mutate(n.id)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
             <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">You're all caught up</h3>
             <p className="text-slate-500 mt-1 max-w-sm mx-auto">You don't have any notifications right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
