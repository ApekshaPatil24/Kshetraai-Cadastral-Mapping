import TopHeader from './TopHeader.jsx';
import WorkflowStepper from './WorkflowStepper.jsx';
import Sidebar from './Sidebar.jsx';
import StatusBar from './StatusBar.jsx';
import { Outlet } from 'react-router-dom';
import './AppShell.css';

export default function AppShell() {
  return (
    <div className="app-shell">
      <TopHeader />
      <WorkflowStepper />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
