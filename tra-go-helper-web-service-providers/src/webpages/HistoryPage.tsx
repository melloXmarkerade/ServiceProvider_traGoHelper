import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/DashboardPage.css';

const HistoryWebpage: React.FC = () => {
    const [activePanel, setActivePanel] = useState<string>('DashboardPage');
    
    return (
        <div>
            <h1>History Page</h1>
        </div>
    );
}

export default HistoryWebpage;