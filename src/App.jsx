import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import NewBookingForm from './components/NewBookingForm';
import HangarStatus from './components/HangarStatus';
import CalendarView from './components/CalendarView';
import BookingHistory from './components/BookingHistory';
import Settings from './components/Settings';
import BookingDetailModal from './components/BookingDetailModal';
import FlightTransitionOverlay from './components/FlightTransitionOverlay';
import LoginForm from './components/LoginForm';
import { deleteBooking, fetchBookings } from './services/bookingService';
import { getStoredUser, logout } from './services/authService';

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('welcome');
  const [preselectedHangar, setPreselectedHangar] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Flight Flying Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetTab, setTargetTab] = useState(null);

  // Fetch initial data from MongoDB API on mount and on refresh if authenticated
  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [refreshKey, currentUser]);

  const handleSelectTab = (tabId) => {
    if (tabId === activeTab && !isTransitioning) return;
    setTargetTab(tabId);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    setIsTransitioning(false);
    setTargetTab(null);
  };

  // Toggle Sidebar / Navbar state
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Trigger state refresh for live reactivity across all views
  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Toast Notification helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveTab('welcome');
    showToast('Logged out of station account.', 'info');
  };

  // Navigate to New Booking screen with optional preselected hangar
  const handleNavigateToNewBooking = (hangarName = null) => {
    setPreselectedHangar(hangarName);
    handleSelectTab('new-booking');
  };

  // Handle Delete directly from Modal
  const handleDeleteFromModal = async (id) => {
    if (window.confirm(`Delete booking ${id}?`)) {
      await deleteBooking(id);
      showToast('Booking deleted.', 'success');
      setSelectedBookingDetail(null);
      triggerRefresh();
    }
  };

  // Tab Title mapping
  const getTabTitle = (tabId = activeTab) => {
    switch (tabId) {
      case 'welcome': return 'Welcome to GMR Aero Technic MRO';
      case 'dashboard': return 'MRO Control Dashboard';
      case 'new-booking': return 'Schedule New Hangar Booking';
      case 'calendar': return 'Planning Calendar & Timelines';
      case 'booking-history': return 'Booking Logs & History';
      case 'hangar-status': return 'Hangar Bay Operational Status';
      case 'settings': return 'System Settings & Config';
      default: return 'GMR Aero Technic MRO';
    }
  };

  // UNAUTHENTICATED GATE: If user is not logged in, render LoginForm first
  if (!currentUser) {
    return (
      <>
        <LoginForm 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            triggerRefresh();
          }}
          showToast={showToast}
        />
        
        {/* Toast Notification Container */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // If user is on Welcome landing page, display standalone full-screen Welcome view
  if (activeTab === 'welcome') {
    return (
      <div className="app-container" key={refreshKey}>
        {/* Flight Takeoff Transition Overlay */}
        <FlightTransitionOverlay
          isTransitioning={isTransitioning}
          targetTabTitle={getTabTitle(targetTab)}
          onTransitionComplete={handleTransitionComplete}
        />

        <WelcomePage onGetStarted={(tabId) => handleSelectTab(tabId)} />
      </div>
    );
  }

  return (
    <div className="app-container" key={refreshKey}>
      {/* Flight Takeoff Transition Overlay */}
      <FlightTransitionOverlay
        isTransitioning={isTransitioning}
        targetTabTitle={getTabTitle(targetTab)}
        onTransitionComplete={handleTransitionComplete}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        isOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeTabTitle={getTabTitle()}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="page-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateToNewBooking={handleNavigateToNewBooking}
              onViewBookingDetail={(b) => setSelectedBookingDetail(b)}
              showToast={showToast}
              triggerRefresh={triggerRefresh}
            />
          )}

          {activeTab === 'new-booking' && (
            <NewBookingForm
              preselectedHangar={preselectedHangar}
              showToast={showToast}
              onBookingCreated={() => {
                triggerRefresh();
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'hangar-status' && (
            <HangarStatus
              onNavigateToNewBooking={handleNavigateToNewBooking}
              onViewBookingDetail={(b) => setSelectedBookingDetail(b)}
              showToast={showToast}
              triggerRefresh={triggerRefresh}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onViewBookingDetail={(b) => setSelectedBookingDetail(b)}
              showToast={showToast}
              refreshTrigger={triggerRefresh}
            />
          )}

          {activeTab === 'booking-history' && (
            <BookingHistory
              onViewDetail={(b) => setSelectedBookingDetail(b)}
              showToast={showToast}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              showToast={showToast}
              onDatabaseReset={() => {
                triggerRefresh();
                setActiveTab('dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* Booking Detail Modal */}
      {selectedBookingDetail && (
        <BookingDetailModal
          booking={selectedBookingDetail}
          onClose={() => setSelectedBookingDetail(null)}
          onDelete={handleDeleteFromModal}
        />
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
