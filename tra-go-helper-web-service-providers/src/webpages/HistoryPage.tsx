import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase.js';  

import '../stylesheets/HistoryPage.css';

interface TableRow {
    requestUID: string;
    vehicleType: string;
    vehicleOwnerEmail: string;
    serviceProviderEmail: string;
    ID: string;
}

const HistoryPage: React.FC = () => {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userAccountsRef = db.ref('serviceRequest');
  
        userAccountsRef.on('value', (snapshot) => {
          const data: TableRow[] = [];
          snapshot.forEach((childSnapshot) => {
            const childData = { ID: childSnapshot.key!, ...childSnapshot.val() };
            if (childData.status === 'done') {
              data.push(childData);
            }
          });
  
          setTableData(data);
          setIsLoading(false);
        });
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []); 
  

  const refreshData = () => {
    setIsLoading(true);
    fetchData();
  };

  
  const handleMoreDetails = (ID: string) => {
    navigate(`...${ID}`);
  };

  return (
    <div>
      {isLoading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vehicle Owner</th>
              <th>Service Provider</th>
              <th>Request Number</th>
              <th>Vehicle Plate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={5}>No more request accounts</td>
              </tr>
            ) : (
              tableData.map((row, index) => (
                <tr key={index} className="Border">
                  <td>{row.vehicleOwnerEmail}</td>
                  <td>{row.serviceProviderEmail}</td>
                  <td>{row.requestUID}</td>
                  <td>{row.vehicleType}</td>
                  <td className="AccountButton">
                    <button className="button-like" onClick={() => handleMoreDetails(row.ID)}>
                      More Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryPage;

function fetchData() {
  throw new Error('Function not implemented.');
}

