import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import HistoryWebpage from './HistoryPage';
import SettingWebpage from './SettingPage';
import '../stylesheets/DashboardPage.css';
import firebase from 'firebase';
import Modal from 'react-modal';

interface UserData {
    email: string;
    name: string;
    profilePicture: string ;
    status: string;
    ID: string; 
    ownerName: string;
    userUID: string;
  }

  interface RequestData {
    requestUID: string;
    serviceProviderEmail: string;
    name: string;
    progress: string;
  }

  interface vehicleOwnerData {
    name: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
    userUID: string;
    status: string;
  }

const DashboardWebpage: React.FC = () => {
    const [tableData, setTableData] = useState<vehicleOwnerData[]>([]);
    const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard')
    const [isModalOpen, setModalOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [user, setUserData] = useState<UserData | null>(null);
    const [requestUser, setRequestUser] = useState<RequestData | null>(null);
    const [ownerUser, setOwnerUser] = useState<vehicleOwnerData | null>(null);
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const user = firebase.auth().currentUser;
            if (user) {
              const uid = user.uid;
      
              const [serviceProviderSnapshot, userSnapshot] = await Promise.all([
                firebase.database().ref(`serviceProvider/${uid}`).once('value'),
                firebase.database().ref(`users/${uid}`).once('value')
              ]);
      
              const existingServiceProviderData = serviceProviderSnapshot.val() || {};
              const fetchedUserData = userSnapshot.val();
      
              const targetEmail = fetchedUserData?.email;
      
              if (user?.email && targetEmail !== null) {
                const serviceProviderEmail = user.email;
                const requestsRef = firebase.database().ref('serviceRequest').orderByChild('serviceProviderEmail').equalTo(serviceProviderEmail);
      
                const promises: Promise<void>[] = [];
      
                requestsRef.on('value', async (snapshot) => {
                  let count = 0;
      
                  // Using for...of loop to allow await inside the loop
                  snapshot.forEach((childSnapshot) => {
                    const request: RequestData = childSnapshot.val();
                  
                    // monintoring data pass through through console
                    console.log('Request:', request);
                    console.log('Request email:', request.serviceProviderEmail);
                    console.log('Owner UID:', request.requestUID);
                  
                    if (request.serviceProviderEmail === user?.email) {
                      console.log('Request email matches target email');
                      count++;
                      const ownerUID = request.requestUID;
                  
                      console.log('Owner UID:', ownerUID);
                  
                      // Fetch owner UID from the service request
                      if (ownerUID) {
                        promises.push(
                          (async () => {
                            try {
                              // Fetch owner data from the vehicleOwner table
                              const ownerSnapshot = await firebase.database().ref(`vehicleOwner/${ownerUID}`).once(`value`);
                              const ownerData = ownerSnapshot.val();
                                
                              if (ownerData) {
                                // Display owner data
                                const vehicleOwnerUserDataToDisplay: vehicleOwnerData = {
                                    name: ownerData.name || 'OwnerName',
                                    email: ownerData.email || 'email address for owner',
                                    userUID: ownerData.userUID || 'RequestUID',
                                    phoneNumber: ownerData.phoneNumber || 'phonenumber',
                                    profilePicture: ownerData.profilePicture || 'profilePictureURL',
                                    status: getStatusText(request.progress)  // Use request.progress instead of existingServiceProviderData.progress
                                };
                                console.log('request status:', request.progress);
                                setOwnerUser(vehicleOwnerUserDataToDisplay);
                                console.log('owner Name', vehicleOwnerUserDataToDisplay);

                                 // Add owner data to tableData
                                 setTableData((prevTableData) => [...prevTableData, vehicleOwnerUserDataToDisplay]);
                              } else {
                                console.error('Owner data not found.');
                              }
                            } catch (error) {
                              console.error('Error fetching owner data:', error);
                            }
                          })()
                        );
                      } else {
                        console.error('Owner UID not found in the service request.');
                      }
                    }
                  })
                  
                  
                  // Wait for all promises to resolve
                  await Promise.all(promises);
                  console.log('owner name: ' , ownerUser?.name);
                  setRequestCount(count);
                });
              } else {
                console.error('User email or target email is null.');
              }
      
              const userDataToDisplay: UserData = {
                name: fetchedUserData?.name || 'DefaultShopName',
                profilePicture: fetchedUserData?.profilePicture || null,
                ownerName: fetchedUserData?.ownerName || null,
                userUID: fetchedUserData?.userUID || null,
                ...existingServiceProviderData,
              };
      
              console.log('User data fetched from the database:', userDataToDisplay);
              setUserData(userDataToDisplay);
            } else {
              console.error('User not authenticated. Wait for Admin to approve the account');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
      
        const unsubscribe = firebase.auth().onAuthStateChanged(fetchData);
      
        // Unsubscribe from the 'value' event and AuthStateChanged when the component unmounts
        return () => {
          const requestsRef = firebase.database().ref('serviceRequest');
          requestsRef.off('value');
          unsubscribe();
        };
      }, [setRequestCount, setUserData, setTableData]);

      const getStatusClass = (status: string) => {
        switch (status) {
            case "0":
                return "status-pending";
            case "1":
                return "status-ongoing";
            case "2":
                return "status-success";
            case "3":
                return "status-cancel";
            default:
                return ""; // No class for unknown status
        }
    };

      const getStatusText = (status: string) => {
        console.log('ProgressOutput:',status)
        switch (status) {
            case "0":
                return "Pending";
            case "1":
                return "Ongoing";
            case "2":
                return "Success";
            case "3":
                return "Canceled";
            default:
                return "Unknown Status";
        }
    };
      

       // Dependency array is empty to run the effect only once when the component mounts
    
 
    // useEffect(() => {
    //     const fetchAndSaveUserData = async () => {
    //       try {
    //         const currentUser = firebase.auth().currentUser;    
            
    //         if (!currentUser) {
    //             // Handle the case where the user is not authenticated
    //             console.error('User not authenticated');
    //             return;
    //           }
            
    //         if (currentUser) {
    //           const uid = currentUser.uid;
    
    //           // Fetch additional user data from the Realtime Database
    //           const userSnapshot = await firebase.database().ref(`users/${uid}`).once('value');
    //           const fetchedUserData = userSnapshot.val();
    
    //           // Save fetchedUserData to the Realtime Database
    //           await firebase.database().ref(`serviceProvider/${uid}`).set({
    //             ShopName: fetchedUserData?.ShopName || 'DefaultShopName',
    //             // Add other properties as needed
    //           });
              
    //           console.log('Fetched User Data:', fetchedUserData);
    //           setUserData(fetchedUserData);
    
    //           console.log('User data saved to the database');
    //           setUserData(fetchedUserData); // Update state with fetched data
    //         }
    //       } catch (error) {
    //         console.error('Error fetching or saving user data:', error);
    //       }
    //     };
    
    //     // Trigger the fetchAndSaveUserData function when the component mounts
    //     fetchAndSaveUserData();
    //   }, []);

    //notification
    const [notificationCount, setNotificationCount] = useState(3);
    const [NotifModalVisible, setNotifModalVisible] = useState(false);

    //modal
    const [isModalVisible, setModalVisible] = useState(false);

    //message
    const [showChat, setShowChat] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    //map
    const [mapCoordinates, setMapCoordinates] = useState({ lat: 10.3167, lng: 123.75 });
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAZNytfQ7AIyGd12zHfAYKp-sWzOR2IzA8';
    const mapRef = useRef<HTMLIFrameElement>(null);

    //notification
    const openNotificationModal = () => {
        console.log("Opening notification modal");
        setNotifModalVisible(true);
    }
    
    const closeNotificationModal = () => {
        console.log("Closing notification modal");
        setNotifModalVisible(false);
    };

    //set modal to visible and not
    const openModal = () => {
        setModalVisible(true);

    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const openProfile = () => {
        setProfileOpen(true);

    };

    const closeProfile = () => {
        setProfileOpen(false);
    };

    //map
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [apiKey]);

    useEffect(() => {
        if (mapRef.current) {
            const mapOptions = {
                center: { lat: mapCoordinates.lat, lng: mapCoordinates.lng },
                zoom: 14,
            };
            const map = new window.google.maps.Map(mapRef.current, mapOptions);

            const markerCoordinates = { lat: 10.3387, lng: 123.91194 };
            const marker = new window.google.maps.Marker({
                position: markerCoordinates,
                map: map,
            });
        }
    }, [mapCoordinates]);

    //show chat message
    const toggleChat = () => {
        setShowChat(!showChat);
    };

    //Auto-expand the textarea by setting its height to scrollHeight
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const handleMenuItemClick = (menu: string) => {
        setActiveMenuItem(menu);
    };


    //function notification



    return (
        <div>
            <input type='checkbox' id='nav-toggle' />
            <div className='dashboard-sidebar'>
                <div className='dashboard-siderbar-brand'>
                    <img src={require('../assets/icons8-tragohelper-50.png')} alt="" className="dashboard-icon-trago" />
                    <img src={require('../assets/logo_trago.png')} alt="" className="dashboard-logo-trago" />
                </div>

                <div className='dashboard-sidebar-menu'>
                    <ul>
                        <li className={`dashboard-list ${activeMenuItem === 'dashboard' ? 'dashboard-active' : ''}`}>
                            <Link to="/dashboard" onClick={() => handleMenuItemClick('dashboard')}>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        <li className={`dashboard-list ${activeMenuItem === 'history' ? 'dashboard-active' : ''}`}>
                            <Link to="/dashboard" onClick={() => handleMenuItemClick('history')}>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>History</span>
                            </Link>
                        </li>

                        <li className={`dashboard-list ${activeMenuItem === 'setting' ? 'dashboard-active' : ''}`}>
                            <Link to="/dashboard" onClick={() => handleMenuItemClick('setting')}>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>Settings</span>
                            </Link>
                        </li>

                        <li className={`dashboard-list ${activeMenuItem === 'logout' ? 'dashboard-active' : ''}`}>
                            <Link to="/" onClick={() => handleMenuItemClick('logout')}>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>Logout</span>
                            </Link>
                        </li>

                    </ul>
                </div>
            </div>

            <div className='dashboard-main-content'>
                <header className='dashboard-header'>
                    <h2 className='dashboard-h2'>
                        <label htmlFor='nav-toggle'>
                            <img src={require('../assets/icons8-menu-50.png')} alt="" className="dashboard-icon-menu" />
                        </label>
                        {activeMenuItem === 'dashboard' ? 'Dashboard' : activeMenuItem === 'history' ? 'History' : activeMenuItem === 'setting' ? 'Settings' : ''}
                    </h2>

                    <div className='dashboard-notification'>
                        <a href='#' className='notification-icon-container' onClick={openNotificationModal}>
                            <img src={require('../assets/icons8-notification-50.png')} alt="" className="icon-notification" />
                            {notificationCount > 0 && (
                                <div className='notification-dot'>{notificationCount}</div>
                            )}
                        </a>
                    </div>

                    <div className='dashboard-user-wrapper' onClick={openProfile}>
                        <img src={user?.profilePicture} width="40px" height="40px" alt="" className="profile-icon" />
                        <div>
                            <h4 className='dashboard-h4'>{user?.name || 'UserName'}</h4>
                            <small className='dashboard-small'>Service Provider</small>
                        </div>
                    </div>

                {/* Modal Account Profile*/}
                <Modal
                    isOpen={isProfileOpen}
                    onRequestClose={closeProfile}
                    contentLabel="Account Profile"
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
                    <h2>Account Profile</h2>
                    <div className="Account-panel">
                        {user? (
                        <div className="DetailsPanel">
                            <div className="DetailForm">
                            <table className="AProfileTable">
                                <tbody>
                                <tr>
                                    <td>ID:</td>
                                    <td>
                                    <span className='user-detail'>{user.userUID}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Full Name:</td>
                                    <td>
                                    <span className='user-detail'>{user.ownerName}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Shop Name:</td>
                                    <td>
                                    <span className='user-detail'>{user.name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Email:</td>
                                    <td>
                                    <span className='user-detail'>{user.email}</span>
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
                </header>


                {/*Notifications*/}
                {NotifModalVisible && (
                    <div className="notification-modal" id="notificationModal">
                         <span className="notification-modal-close" onClick={closeNotificationModal}>&times;</span>
                        <div className="notification-modal-content">
                            <div className="notification-modal-header">
                                <h1 className="notification-modal-title">Notifications</h1>
                                <div className="notification-modal-line"></div>
                            </div>
                            <ul className="notification-list">
                                <li className="notification-list-item">
                                    <div className='notification-body-detail'>
                                        <h3 className='notification-header-title'>New Request Received</h3>
                                        <p className='notification-content'>You have received a new request from a customer. Check it out now!</p>
                                    </div>
                                    <div className='notification-time-date'>
                                        <p className='notification-date'>2023-12-18</p>
                                        <p className='notification-time'>10:30 AM</p>
                                    </div>
                                    <div className="notification-line"></div>
                                </li>
                                <li className="notification-list-item">
                                    <div className='notification-body-detail'>
                                        <h3 className='notification-header-title'>Another Notification</h3>
                                        <p className='notification-content'>This is another notification message. Check it out!</p>
                                    </div>
                                    <div className='notification-time-date'>
                                        <p className='notification-date'>2023-12-19</p>
                                        <p className='notification-time'>2:45 PM</p>
                                    </div>
                                    <div className="notification-line"></div>
                                </li>
                                <li className="notification-list-item">
                                    <div className='notification-body-detail'>
                                        <h3 className='notification-header-title'>Important Update</h3>
                                        <p className='notification-content'>There is an important update. Please review the details.</p>
                                    </div>
                                    <div className='notification-time-date'>
                                        <p className='notification-date'>2023-12-20</p>
                                        <p className='notification-time'>8:00 AM</p>
                                    </div>
                                    <div className="notification-line"></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                <main>
                    {activeMenuItem === 'dashboard' && (
                        <div>
                            <div className='dashboard-cards'>
                                    <div className='dashboard-card-single'>
                                        <div>
                                            <h1 className='card-h1'>{requestCount}</h1>
                                            <span>Total Request</span>
                                        </div>
                                        <div>
                                            <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                        </div>
                                    </div>

                                <div className='dashboard-card-single'>
                                    <div>
                                        <h1 className='card-h1'>54</h1>
                                        <span>Cancel Request</span>
                                    </div>
                                    <div>
                                        <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                    </div>
                                </div>

                                <div className='dashboard-card-single'>
                                    <div>
                                        <h1 className='card-h1'>54</h1>
                                        <span>Success Request</span>
                                    </div>
                                    <div>
                                        <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                    </div>
                                </div>

                                <div className='dashboard-card-single'>
                                    <div>
                                        <h1 className='card-h1'>54</h1>
                                        <span>Accept Request</span>
                                    </div>
                                    <div>
                                        <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                    </div>
                                </div>
                            </div>

                            {/*Map */}
                            {isModalVisible && (
                                <div id="detailsModal" className="modal">
                                    <div className="modal-content">
                                        <span className="close" onClick={closeModal}>&times;</span>
                                        <div className="details-container">
                                            <iframe
                                                title="Google Maps"
                                                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${mapCoordinates.lat},${mapCoordinates.lng}`}
                                                width="500%"
                                                height="400px"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                allowFullScreen={true}
                                                aria-hidden="false"
                                                tabIndex={0}
                                            ></iframe>
                                            <div className="details">
                                                <h2 className='details-header'>View Details:</h2>
                                                <label>Customer Name:</label>
                                                <input type="text" value="William Luther Zambo" readOnly />

                                                <label>Service Type</label>
                                                <input type="text" value="Tires" readOnly />

                                                <label>Contact No.:</label>
                                                <input type="text" value="09777568085" readOnly />

                                                <label>Plate Number:</label>
                                                <input type="text" value="ABC123" readOnly />

                                                <div className="modal-button-container">
                                                    <button className="modal-accept-button">Accept</button>
                                                    <button className="modal-decline-button">Decline</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/*Table */}
                            <div className='recent-grid'>
                                <div className='projects'>
                                    <div className='card'>
                                        <div className='card-header'>
                                            <h3>Customer Requests</h3>
                                            <button>See all
                                            </button>
                                        </div>

                                        <div className='card-body'>
                                            <div className='table-responsive'>
                                                <table width='100%'>
                                                    <thead>
                                                        <tr>
                                                            <td>Customer Name</td>
                                                            <td>Service Selection</td>
                                                            <td>Status</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tableData.length === 0 ? (
                                                            <tr>
                                                            <td colSpan={3}>No data available</td>
                                                            </tr>
                                                        ) : (
                                                            tableData.map((row, index) => (
                                                            <tr key={index}>
                                                                <td>{row.name}</td>
                                                                <td className="with-button">
                                                                Tires
                                                                <button className="view-button" id="viewDetails" onClick={() => openModal(row)}>
                                                                    View Details
                                                                </button>
                                                                </td>
                                                                <td  className={`with-button ${getStatusClass(row.status)}`}>
                                                                {(row.status)}
                                                                </td>
                                                            </tr>
                                                            ))
                                                        )}
                                                        </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/*Chat Message */}
                                {showChat && (
                                    <div className={`chat-container ${showChat ? 'active' : ''}`}>
                                        {/* Navigation header */}
                                        <div className="chat-content">
                                            <div className="chat-header">
                                                <h3>Jennifer Español</h3>
                                                <span className="close-btn" onClick={toggleChat}>&times;</span>
                                            </div>

                                            {/* Chat messages go here */}
                                            <div className="chat-body">
                                                <div className="message">
                                                    <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="User Avatar" />
                                                    <div className="message-content">
                                                        <p>Hi! I have a question about your service offers.</p>
                                                        <span className="message-time">10:30 AM</span>
                                                    </div>
                                                </div>

                                                <div className="message sender">
                                                    <div className="message-content">
                                                        <p>Hello! How can I help you? </p>
                                                        <span className="message-time">10:35 AM</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="chat-input">
                                                <textarea className="input-box" placeholder="Type a message..." value={message} onChange={handleChange}></textarea>
                                                <button className="send-button">Send</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className='customers'>
                                    <div className='card'>
                                        <div className='card-header'>
                                            <h3>Ongoing Request</h3>
                                            <button>See all</button>
                                        </div>

                                        <div className='card-body'>
                                            <div className='customer'>
                                                <div className='info'>
                                                    <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="" className="customer-icon" />
                                                    <div>
                                                        <h4>Jennifer Español</h4>
                                                        <small>Vehicle Owner</small>
                                                    </div>
                                                </div>
                                                <div className='contact'>
                                                    <span className='user-circle'>
                                                        <img src={require('../assets/icons8-message-48.png')} alt="" className="card-icon" onClick={toggleChat} />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='customer'>
                                                <div className='info'>
                                                    <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="" className="customer-icon" />
                                                    <div>
                                                        <h4>Jennifer Español</h4>
                                                        <small>Vehicle Owner</small>
                                                    </div>
                                                </div>
                                                <div className='contact'>
                                                    <span className='user-circle'>
                                                        <img src={require('../assets/icons8-message-48.png')} alt="" className="card-icon" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='customer'>
                                                <div className='info'>
                                                    <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="" className="customer-icon" />
                                                    <div>
                                                        <h4>Jennifer Español</h4>
                                                        <small>Vehicle Owner</small>
                                                    </div>
                                                </div>
                                                <div className='contact'>
                                                    <span className='user-circle'>
                                                        <img src={require('../assets/icons8-message-48.png')} alt="" className="card-icon" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='customer'>
                                                <div className='info'>
                                                    <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="" className="customer-icon" />
                                                    <div>
                                                        <h4>Jennifer Español</h4>
                                                        <small>Vehicle Owner</small>
                                                    </div>
                                                </div>
                                                <div className='contact'>
                                                    <span className='user-circle'>
                                                        <img src={require('../assets/icons8-message-48.png')} alt="" className="card-icon" />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='customer'>
                                                <div className='info'>
                                                    <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="" className="customer-icon" />
                                                    <div>
                                                        <h4>Jennifer Español</h4>
                                                        <small>Vehicle Owner</small>
                                                    </div>
                                                </div>
                                                <div className='contact'>
                                                    <span className='user-circle'>
                                                        <img src={require('../assets/icons8-message-48.png')} alt="" className="card-icon" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMenuItem === 'history' && (
                        <div>
                            <HistoryWebpage />
                        </div>
                    )}

                    {activeMenuItem === 'setting' && (
                        <div>
                            <SettingWebpage />
                        </div>
                    )}

                </main>
            </div >
        </div >
    );
}

export default DashboardWebpage;