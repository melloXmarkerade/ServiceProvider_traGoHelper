import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import HistoryWebpage from './HistoryPage';
import SettingWebpage from './SettingPage';
import '../stylesheets/DashboardPage.css';
import { useUserContext } from './UserContext';
import firebase from 'firebase';

interface UserData {
    email: string;
    name: string;
    profilePicture: string;
    // Add other properties as needed
  }

const DashboardWebpage: React.FC = () => {
    //Declarations
    const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard')
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (user) {
            try {
              const uid = user.uid;
      
              // Fetch existing data from the serviceProvider node
              const serviceProviderSnapshot = await firebase.database().ref(`serviceProvider/${uid}`).once('value');
              const existingServiceProviderData = serviceProviderSnapshot.val() || {};
      
              // Fetch additional user data from the Realtime Database
              const userSnapshot = await firebase.database().ref(`users/${uid}`).once('value');
              const fetchedUserData = userSnapshot.val();
      
              // Combine existing data with new values (ShopName in this case)
              const userDataToDisplay = {
                name: fetchedUserData?.name || 'DefaultShopName',
                profilePicture: fetchedUserData?.profilePicture || null, // Assuming profilePicture is a URL
                // Add other properties as needed
                ...existingServiceProviderData,
              };
              
              console.log('User data fetched from the database:', userDataToDisplay);
              console.log('User data fetched from the database');
              setUserData(userDataToDisplay); // Update state with fetched data
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          } else {
            console.error('User not authenticated');
            // You may want to redirect to a login page or handle the unauthenticated state in another way
          }
        });
      
        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
      }, []);
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

    // //map
    // useEffect(() => {
    //     const script = document.createElement('script');
    //     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    //     script.async = true;
    //     script.defer = true;
    //     document.head.appendChild(script);

    //     return () => {
    //         document.head.removeChild(script);
    //     };
    // }, [apiKey]);

    // useEffect(() => {
    //     if (mapRef.current) {
    //         const mapOptions = {
    //             center: { lat: mapCoordinates.lat, lng: mapCoordinates.lng },
    //             zoom: 14,
    //         };
    //         const map = new window.google.maps.Map(mapRef.current, mapOptions);

    //         const markerCoordinates = { lat: 10.3387, lng: 123.91194 };
    //         const marker = new window.google.maps.Marker({
    //             position: markerCoordinates,
    //             map: map,
    //         });
    //     }
    // }, [mapCoordinates]);

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

                    <div className='dashboard-user-wrapper'>
                        <img src={userData?.profilePicture} width="40px" height="40px" alt="" className="profile-icon" />
                        <div>
                            <h4 className='dashboard-h4'>{userData?.name || 'UserName'}</h4>
                            <small className='dashboard-small'>Service Provider</small>
                        </div>
                    </div>
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
                                        <h1 className='card-h1'>54</h1>
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
                                                        <tr>
                                                            <td>William Luther Zambo</td>
                                                            <td className="with-button">
                                                                Tires
                                                                <button className="view-button" id='viewDetails' onClick={openModal} >View Details</button>
                                                            </td>
                                                            <td className="with-button">
                                                                <button className="action-button accept-button">Accept</button>
                                                                <button className="action-button decline-button">Decline</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Rosely Mae Cordova</td>
                                                            <td className="with-button">
                                                                Fuel
                                                                <button className="view-button" onClick={openModal}>View Details</button>
                                                            </td>
                                                            <td className="with-button">
                                                                <button className="action-button accept-button">Accept</button>
                                                                <button className="action-button decline-button">Decline</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Mark Stephen Adlawan</td>
                                                            <td className="with-button">
                                                                Undetermined
                                                                <button className="view-button" onClick={openModal}>View Details</button>
                                                            </td>
                                                            <td className="with-button">
                                                                <button className="action-button accept-button">Accept</button>
                                                                <button className="action-button decline-button">Decline</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>William Luther Zambo</td>
                                                            <td className="with-button">
                                                                Undetermined
                                                                <button className="view-button" onClick={openModal}>View Details</button>
                                                            </td>
                                                            <td className="with-button">
                                                                <button className="action-button accept-button">Accept</button>
                                                                <button className="action-button decline-button">Decline</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Rosely Mae Cordova</td>
                                                            <td className="with-button">
                                                                Undetermined
                                                                <button className="view-button" onClick={openModal}>View Details</button>
                                                            </td>
                                                            <td className="with-button">
                                                                <button className="action-button accept-button">Accept</button>
                                                                <button className="action-button decline-button">Decline</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Mark Stephen Adlawan</td>
                                                            <td className="with-button">
                                                                Undetermined
                                                                <button className="view-button" onClick={openModal}>View Details</button>
                                                            </td>
                                                            <td className="with-button">
                                                                <button className="action-button accept-button">Accept</button>
                                                                <button className="action-button decline-button">Decline</button>
                                                            </td>
                                                        </tr>
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