import {
  LayoutDashboard,
  Building2,
  Cpu,
  Layers,
  Network,
  FileText,
} from 'lucide-react';
import type { AppTab } from '../types';

const NAV_ITEMS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'company', label: 'Company', icon: <Building2 size={18} /> },
  { id: 'models', label: 'AI Models', icon: <Cpu size={18} /> },
  { id: 'usecases', label: 'Use Cases', icon: <Layers size={18} /> },
  { id: 'mcp', label: 'MCP Servers', icon: <Network size={18} /> },
  { id: 'report', label: 'Report', icon: <FileText size={18} /> },
];

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">✦</span>
        <div>
          <div className="brand-title">AI ROI Calculator</div>
          <div className="brand-sub">Azure AI Edition</div>
        </div>
      </div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <p className="footer-text">
          Based on Azure AI pricing.
          <br />
          Costs are estimates only.
        </p>
      </div>
    </nav>
  );
}
