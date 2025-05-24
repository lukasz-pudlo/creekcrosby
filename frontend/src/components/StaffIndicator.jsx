import React from 'react';
import { useAuth } from '../context/AuthContext';
import './EditableText.css';

const StaffIndicator = () => {
    const { isStaff, user, logout } = useAuth();

    if (!isStaff) return null;

    return (
        <>
            <div className="staff-mode-indicator">
                ✏️ Edit Mode - {user.username}
            </div>
            <div className="staff-controls">
                <button onClick={() => window.open('/admin/', '_blank')}>
                    Open Admin
                </button>
                <button onClick={logout}>
                    Logout
                </button>
            </div>
        </>
    );
};

export default StaffIndicator;