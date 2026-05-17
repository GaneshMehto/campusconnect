import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RecruiterDashboard from './dashboards/RecruiterDashboard';
import RecruiterApplicantsPage from './RecruiterApplicantsPage';
import RecruiterJobsPage from './RecruiterJobsPage';
import RecruiterInterviewsPage from './RecruiterInterviewsPage';

export default function RecruiterRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RecruiterDashboard />} />
      <Route path="/jobs" element={<RecruiterJobsPage />} />
      <Route path="/applicants" element={<RecruiterApplicantsPage />} />
      <Route path="/interviews" element={<RecruiterInterviewsPage />} />
    </Routes>
  );
}
