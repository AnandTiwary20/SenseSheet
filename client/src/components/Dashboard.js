import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartBar, FaChartLine, FaChartPie, FaFileUpload, FaSignOutAlt } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: 'New Visualization',
      description: 'Create a new data visualization from scratch',
      icon: <FaFileUpload className="dashboard-icon" />,
      link: '/upload',
      buttonText: 'Get Started'
    },
    {
      title: 'View Reports',
      description: 'Access your saved visualizations and reports',
      icon: <FaChartBar className="dashboard-icon" />,
      link: '/reports',
      buttonText: 'View All'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and insights',
      icon: <FaChartLine className="dashboard-icon" />,
      link: '/analytics',
      buttonText: 'Explore'
    },
    {
      title: 'Templates',
      description: 'Use pre-built templates for quick visualization',
      icon: <FaChartPie className="dashboard-icon" />,
      link: '/templates',
      buttonText: 'Browse Templates'
    }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1>Welcome back, {currentUser?.name || 'User'}!</h1>
            <p className="welcome-message">What would you like to visualize today?</p>
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {dashboardCards.map((card, index) => (
            <div key={index} className="dashboard-card">
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.link} className="btn btn-primary">
                {card.buttonText}
              </Link>
            </div>
          ))}
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-details">
                <p>You created a new bar chart</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📈</div>
              <div className="activity-details">
                <p>Your line chart was viewed 15 times</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-details">
                <p>You saved a new template</p>
                <span className="activity-time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>SenseSheet 2025 | Made with ❤️ by Anand</p>
      </footer>
    </div>
  );
};

export default Dashboard;
