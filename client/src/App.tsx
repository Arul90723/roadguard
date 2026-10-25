import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoBanner } from './components/DemoBanner';
import { ProximityAlertBanner } from './components/ProximityAlertBanner';
import { Navbar } from './components/Navbar';
import { IncidentModal } from './components/IncidentModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { ReportHazardPage } from './pages/ReportHazardPage';
import { MotionSensorPage } from './pages/MotionSensorPage';
import { RouteComparisonPage } from './pages/RouteComparisonPage';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { fetchIncidents, fetchRoadSegments, fetchDashboardStats, updateIncidentStatus, reopenIncident } from './services/api';
import { DashboardStats, Incident, IncidentStatus, RoadSegment } from './types';

const MainApp: React.FC = () => {
  const { currentUser, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [incList, segList, statsData] = await Promise.all([
        fetchIncidents(),
        fetchRoadSegments(),
        fetchDashboardStats(),
      ]);
      setIncidents(incList);
      setRoadSegments(segList);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: IncidentStatus,
    notes?: string,
    assignedTeam?: string,
    targetRepairDate?: string
  ) => {
    const updated = await updateIncidentStatus(id, {
      status,
      notes,
      assignedTeam,
      targetRepairDate,
      changedByName: currentUser?.displayName || 'Authority Officer',
    });
    setIncidents(prev => prev.map(i => (i.id === id ? updated : i)));
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated);
    }
    loadData();
  };

  const handleReopen = async (id: string, notes: string) => {
    const updated = await reopenIncident(id, {
      notes,
      reopenedByName: currentUser?.displayName || 'Field Auditor',
    });
    setIncidents(prev => prev.map(i => (i.id === id ? updated : i)));
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated);
    }
    loadData();
  };

  // Critical incidents for the Proximity Alert banner
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved');

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {/* Demo Banner */}
      <DemoBanner />

      {/* Critical Proximity Travel Warning Banner */}
      <ProximityAlertBanner
        criticalIncidents={criticalIncidents}
        onSelectIncident={incident => setSelectedIncident(incident)}
      />

      {/* Navbar with Auth Trigger */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <LandingPage
            stats={stats}
            incidents={incidents}
            onNavigate={tab => setActiveTab(tab)}
            onSelectIncident={incident => setSelectedIncident(incident)}
          />
        )}

        {activeTab === 'map' && (
          <MapPage
            incidents={incidents}
            roadSegments={roadSegments}
            selectedIncident={selectedIncident}
            onSelectIncident={incident => setSelectedIncident(incident)}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'report' && (
          <ReportHazardPage
            onReportSuccess={() => {
              loadData();
              setTimeout(() => setActiveTab('map'), 1500);
            }}
          />
        )}

        {activeTab === 'sensor' && <MotionSensorPage />}

        {activeTab === 'routes' && (
          <RouteComparisonPage
            incidents={incidents}
            onSelectIncident={incident => setSelectedIncident(incident)}
          />
        )}

        {activeTab === 'authority' && (
          <AuthorityDashboardPage
            incidents={incidents}
            roadSegments={roadSegments}
            stats={stats}
            onSelectIncident={incident => setSelectedIncident(incident)}
            onUpdateStatus={handleUpdateStatus}
            onReopenIncident={handleReopen}
          />
        )}

        {activeTab === 'docs' && <DocumentationPage />}
      </main>

      {/* Incident Detail / Operations Modal */}
      <IncidentModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        userRole={currentUser?.role}
        onUpdateStatus={handleUpdateStatus}
        onReopenIncident={handleReopen}
      />

      {/* Dedicated Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">ROADGUARD</span>
            <span>— Smart Road Safety & Infrastructure Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Built for Hackathon Submission</span>
            <span>•</span>
            <span className="text-cyan-400">Sample Zone: Kochi, Kerala</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
