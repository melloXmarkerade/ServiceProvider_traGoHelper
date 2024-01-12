import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import Modal from 'react-modal';
import '../stylesheets/HistoryPage.css';

interface TableRow {
  requestUID: string;
  vehicleType: string;
  vehicleOwnerEmail: string;
  serviceProviderEmail: string;
  ID: string;
  name: string;
  phoneNumber: string;
  email: string;
}

const HistoryPage: React.FC = () => {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TableRow | null>(null);

  const fetchData = async () => {
    try {
      const serviceRequestRef = db.ref('serviceRequest');
      const vehicleOwnerRef = db.ref('vehicleOwner');

      const [serviceRequestSnapshot, vehicleOwnerSnapshot] = await Promise.all([
        serviceRequestRef.once('value'),
        vehicleOwnerRef.once('value'),
      ]);

      const serviceRequestData: TableRow[] = [];
      const vehicleOwnerData: TableRow[] = [];

      serviceRequestSnapshot.forEach((childSnapshot) => {
        const childData = { ID: childSnapshot.key!, ...childSnapshot.val() };
        if (childData.progress === '0' || childData.progress === '100') {
          serviceRequestData.push(childData);
        }
      });

      vehicleOwnerSnapshot.forEach((childSnapshot) => {
        const childData = { ID: childSnapshot.key!, ...childSnapshot.val() };
        vehicleOwnerData.push(childData);
      });

      // Merge the data based on a common identifier (e.g., email)
      const mergedData = serviceRequestData.map((request) => ({
        ...request,
        ...(vehicleOwnerData.find((owner) => owner.email === request.vehicleOwnerEmail) || {}),
      }));

      setTableData(mergedData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching data:', error);
    }
  };

  const openProfile = (user: TableRow) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  const closeProfile = () => {
    setProfileOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {isLoading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
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
                  <td>{row.requestUID}</td>
                  <td>{row.vehicleType}</td>
                  <td className="AccountButton">
                    <button className="button-like" onClick={() => openProfile(row)}>
                      More Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isProfileOpen}
        onRequestClose={closeProfile}
        contentLabel="Account History Details"
        style={{
          overlay: {
            zIndex: 1000,
          },
          content: {
            zIndex: 1001,
          },
        }}
      >
        <div>
          <h2>Account History</h2>
          <div className="Account-panel">
            {selectedUser ? (
              <div className="DetailsPanel">
                <div className="DetailForm">
                  <table className="AProfileTable">
                    <tbody>
                      <h5>Vehicle Owner's Details</h5>
                      <tr>
                        <td>ID:</td>
                        <td>
                          <span className="user-detail">{selectedUser.ID}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Full Name:</td>
                        <td>
                          <span className="user-detail">{selectedUser.name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Email:</td>
                        <td>
                          <span className="user-detail">{selectedUser.vehicleOwnerEmail}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Phone Number:</td>
                        <td>
                          <span className="user-detail">{selectedUser.phoneNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Vehicle Type:</td>
                        <td>
                          <span className="user-detail">{selectedUser.vehicleType}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Request ID Number:</td>
                        <td>
                          <span className="user-detail">{selectedUser.requestUID}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <button onClick={closeProfile}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default HistoryPage;
