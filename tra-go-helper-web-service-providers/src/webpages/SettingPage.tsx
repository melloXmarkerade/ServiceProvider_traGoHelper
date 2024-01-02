import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { db } from '../firebase';
import TermsCondi from './TermsAndConditionsPage';
import '../stylesheets/SettingPage.css';
import bigImage from '../assets/icons8-setting-50.png';

const SettingsWebpage: React.FC = () => {
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState<{ ID: string; password: string } | null>(null);
  const [username, setUsername] = useState<string>(''); 

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userSnapshot = await db.ref(`RequestAcc/${username}`).get();

        if (userSnapshot.exists()) {
          const userData = { ID: userSnapshot.key, ...userSnapshot.val() };
          setUser(userData);
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [username]);

  const openTermsModal = () => {
    setTermsModalOpen(true);
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
  };

  const closeModals = () => {
    setTermsModalOpen(false);
    setPasswordModalOpen(false);
  };

  const handleChangePassword = async () => {
    try {
      if (currentPassword !== user?.password) {
        console.error('Current password is incorrect');
        return;
      }
      if (newPassword !== confirmPassword) {
        console.error('New password and confirm password do not match');
        return;
      }

      await db.ref(`RequestAcc/${username}`).update({ password: newPassword });

      closeModals();
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  return (
    <div className="settings-container">
      <img src={bigImage} alt="Big Image" className="big-image" />
      <div className="button-container">
        <button className="custom-button" onClick={openTermsModal}>
          Terms and Conditions
        </button>
        <button className="custom-button" onClick={openPasswordModal}>
          Change Password
        </button>
      </div>

      {/* Modal for "Terms and Conditions" */}
      <Modal isOpen={isTermsModalOpen} onRequestClose={closeModals}>
        <div className="modal-content">
          <h2>Terms and Conditions</h2>
          <TermsCondi />
          <button onClick={closeModals}>Close</button>
        </div>
      </Modal>

      {/* Modal for "Change Password" */}
      <Modal isOpen={isPasswordModalOpen} onRequestClose={closeModals}>
        <div className="modal-content">
          <h2>Change Password</h2>

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button onClick={handleChangePassword}>Submit</button>
          <button onClick={closeModals}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsWebpage;
