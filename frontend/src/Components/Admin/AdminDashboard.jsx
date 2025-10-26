import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/helper';

const AdminDashboard = () => {
    const user = getUser();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout(() => {
            navigate('/login');
        });
    };
    
    return (
        <div className="admin-dashboard">
            {/* Header with Logout Button */}
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            
            <div className="user-info">
                <h3>Welcome, {user?.name} 👋</h3>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> <span className="role-badge">{user?.role}</span></p>
                <p><strong>User ID:</strong> {user?.id}</p>
            </div>
            
            <div className="admin-actions">
                <h4>Admin Actions:</h4>
                <div className="action-buttons">
                    <button className="btn btn-primary">Manage Users</button>
                    <button className="btn btn-secondary">View Analytics</button>
                    <button className="btn btn-warning">System Settings</button>
                </div>
            </div>
            
            <style jsx>{`
                .admin-dashboard {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e9ecef;
                }
                .dashboard-header h1 {
                    margin: 0;
                    color: #2c3e50;
                }
                .logout-btn {
                    background: #dc3545;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.3s ease;
                }
                .logout-btn:hover {
                    background: #c82333;
                    transform: translateY(-2px);
                }
                .user-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #007bff;
                }
                .role-badge {
                    background: #007bff;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8em;
                    font-weight: bold;
                }
                .admin-actions {
                    margin-top: 30px;
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .admin-actions h4 {
                    margin-top: 0;
                    color: #2c3e50;
                }
                .action-buttons {
                    display: flex;
                    gap: 15px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .btn-primary { 
                    background: #007bff; 
                    color: white; 
                }
                .btn-primary:hover { 
                    background: #0056b3; 
                }
                .btn-secondary { 
                    background: #6c757d; 
                    color: white; 
                }
                .btn-secondary:hover { 
                    background: #545b62; 
                }
                .btn-warning { 
                    background: #ffc107; 
                    color: black; 
                }
                .btn-warning:hover { 
                    background: #e0a800; 
                }
                .btn-danger {
                    background: #dc3545;
                    color: white;
                }
                .btn-danger:hover {
                    background: #c82333;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;