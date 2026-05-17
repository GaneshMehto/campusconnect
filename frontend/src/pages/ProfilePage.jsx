import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { usersApi, skillsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, FileText, Award, UploadCloud, Download, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState(null);
  const [studentForm, setStudentForm] = useState({ full_name: '', department: '', graduation_year: '', cgpa: '' });
  const [recruiterForm, setRecruiterForm] = useState({ full_name: '', phone: '' });

  const { data: skillsData } = useQuery({
    queryKey: ['my-skills'],
    queryFn: () => skillsApi.my(),
    enabled: user?.role === 'student'
  });

  useEffect(() => {
    if (user?.student_profile) {
      setStudentForm({
        full_name: user.student_profile.full_name || '',
        department: user.student_profile.department || '',
        graduation_year: user.student_profile.graduation_year || '',
        cgpa: user.student_profile.cgpa || '',
      });
    }
    if (user?.recruiter_profile) {
      setRecruiterForm({
        full_name: user.recruiter_profile.full_name || '',
        phone: user.recruiter_profile.phone || '',
      });
    }
  }, [user]);

  const updateStudentMutation = useMutation({
    mutationFn: (data) => usersApi.updateStudent(data),
    onSuccess: async () => {
      await refreshUser();
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.detail || 'Failed to update profile');
    }
  });

  const updateRecruiterMutation = useMutation({
    mutationFn: (data) => usersApi.updateRecruiter(data),
    onSuccess: async () => {
      await refreshUser();
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.detail || 'Failed to update profile');
    }
  });

  const uploadResumeMutation = useMutation({
    mutationFn: (f) => usersApi.uploadResume(f),
    onSuccess: async () => {
      toast.success('Resume uploaded successfully');
      setFile(null);
      await refreshUser();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.detail || 'Resume upload failed');
    }
  });

  const saveProfile = () => {
    if (user?.role === 'student') {
      updateStudentMutation.mutate({
        full_name: studentForm.full_name || null,
        department: studentForm.department || null,
        graduation_year: studentForm.graduation_year ? Number(studentForm.graduation_year) : null,
        cgpa: studentForm.cgpa ? Number(studentForm.cgpa) : null,
      });
    }
    if (user?.role === 'recruiter') {
      updateRecruiterMutation.mutate({
        full_name: recruiterForm.full_name || null,
        phone: recruiterForm.phone || null,
      });
    }
  };

  const uploadResume = () => {
    if (file) uploadResumeMutation.mutate(file);
  };

  const downloadResume = async () => {
    try {
      const blob = await usersApi.downloadResume();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Resume not available');
    }
  };

  const getProfileCompletion = () => {
    if (user?.role !== 'student') return 100; // Not applicable for recruiters here
    let score = 20; // Base score
    if (user?.student_profile?.full_name) score += 15;
    if (user?.student_profile?.department) score += 15;
    if (user?.student_profile?.graduation_year) score += 10;
    if (user?.student_profile?.cgpa) score += 10;
    if (user?.student_profile?.resume_url) score += 20;
    if (skillsData?.length > 0) score += 10;
    return score;
  };

  const isSaving = updateStudentMutation.isLoading || updateRecruiterMutation.isLoading;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center font-bold text-2xl">
            {user?.role === 'recruiter' 
              ? (user?.recruiter_profile?.full_name?.charAt(0) || 'R') 
              : (user?.student_profile?.full_name?.charAt(0) || 'S')}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal information and preferences.
            </p>
          </div>
        </div>
        <Button onClick={saveProfile} disabled={isSaving} className="shrink-0 shadow-sm">
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-brand-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Read-only)</label>
                <div className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">
                  {user?.email}
                </div>
              </div>

              {user?.role === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={studentForm.full_name} 
                      onChange={e => setStudentForm(prev => ({...prev, full_name: e.target.value}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department / Major</label>
                    <Input 
                      placeholder="Computer Science" 
                      value={studentForm.department} 
                      onChange={e => setStudentForm(prev => ({...prev, department: e.target.value}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Graduation</label>
                    <Input 
                      type="number"
                      placeholder="2025" 
                      value={studentForm.graduation_year} 
                      onChange={e => setStudentForm(prev => ({...prev, graduation_year: e.target.value}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cumulative GPA</label>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="3.8" 
                      value={studentForm.cgpa} 
                      onChange={e => setStudentForm(prev => ({...prev, cgpa: e.target.value}))} 
                    />
                  </div>
                </div>
              )}

              {user?.role === 'recruiter' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <Input 
                      placeholder="John Smith" 
                      value={recruiterForm.full_name} 
                      onChange={e => setRecruiterForm(prev => ({...prev, full_name: e.target.value}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <Input 
                      placeholder="+1 (555) 000-0000" 
                      value={recruiterForm.phone} 
                      onChange={e => setRecruiterForm(prev => ({...prev, phone: e.target.value}))} 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Specific Sections - Resume */}
          {user?.role === 'student' && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Resume & Document
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  
                  {user?.student_profile?.resume_url ? (
                    <div className="h-24 w-20 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded flex flex-col items-center justify-center shrink-0">
                      <FileText className="h-8 w-8 text-blue-500 mb-1" />
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">PDF</span>
                    </div>
                  ) : (
                    <div className="h-24 w-20 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded flex flex-col items-center justify-center shrink-0">
                      <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                      <span className="text-[10px] font-medium text-slate-500">No File</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload New Resume</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Supported formats: PDF, DOC, DOCX. Max size 5MB.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="file:bg-brand-50 file:text-brand-700 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400 dark:hover:file:bg-brand-900/50 cursor-pointer text-sm"
                      />
                      <Button 
                        disabled={!file || uploadResumeMutation.isLoading} 
                        onClick={uploadResume}
                        className="shrink-0"
                      >
                        {uploadResumeMutation.isLoading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>

                  {user?.student_profile?.resume_url && (
                    <Button variant="outline" onClick={downloadResume} className="shrink-0 gap-2 w-full md:w-auto">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connect profiles / social */}
          {user?.role === 'student' && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Social Profiles
                </CardTitle>
                <CardDescription>Link your external portfolios</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4"/> GitHub URL</label>
                      <Input placeholder="https://github.com/username" />
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4"/> LinkedIn URL</label>
                      <Input placeholder="https://linkedin.com/in/username" />
                   </div>
                 </div>
                 <div className="pt-2">
                   <Button variant="outline" size="sm">Save links</Button>
                 </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Meta */}
        <div className="space-y-6">
          
          {user?.role === 'student' && (
            <Card className="border-brand-200 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/20 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Profile Completion</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 transition-all duration-500" 
                      style={{ width: `${getProfileCompletion()}%` }}
                    />
                  </div>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{getProfileCompletion()}%</span>
                </div>
                {getProfileCompletion() < 100 && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Complete your profile to increase your visibility to top recruiters. Adding your resume, skills, and GPA improves your discovery rank.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg">Account Setup</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Type</span>
                <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Member Since</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none">Active</Badge>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
