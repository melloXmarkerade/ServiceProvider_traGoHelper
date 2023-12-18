import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/DashboardPage.css';

const DashboardWebpage: React.FC = () => {
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
                        <li className='dashboard-list'>
                            <a href='#' className='dashboard-active'>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>Dashboard</span>
                            </a>
                        </li>

                        <li className='dashboard-list'>
                            <a href='#' className='dashboard-a'>
                                <img src={require('../assets/icons8-history-48.png')} alt="" className="icon" />
                                <span>History</span>
                            </a>
                        </li>

                        <li className='dashboard-list'>
                            <a href='#' className='dashboard-a'>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>Settings</span>
                            </a>
                        </li>

                        <li className='dashboard-list'>
                            <a href='#' className='dashboard-a'>
                                <img src={require('../assets/icons8-dashboard-48.png')} alt="" className="icon" />
                                <span>Logout</span>
                            </a>
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
                        Dashboard
                    </h2>

                    <div className='dashboard-notification'>
                        <a href='#'>
                            <img src={require('../assets/icons8-notification-50.png')} alt="" className="icon-notification" />
                        </a>
                    </div>

                    <div className='dashboard-user-wrapper'>
                        <img src={require('../assets/profile.jpg')} width="40px" height="40px" alt="" className="profile-icon" />
                        <div>
                            <h4 className='dashboard-h4'>Jennifer Español</h4>
                            <small className='dashboard-small'>Service Provider</small>
                        </div>
                    </div>
                </header>

                <main>
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

                    {/*Table */}
                    <div className='recent-grid'>
                        <div className='projects'>
                            <div className='card'>
                                <div className='card-header'>
                                    <h3>Customer Requests</h3>
                                    <button>See all
                                        {/*<span className='arrow-right'>
                                    </span>*/}
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
                                                        <button className="view-button">View Details</button>
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
                                                        <button className="view-button">View Details</button>
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
                                                        <button className="view-button">View Details</button>
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
                                                        <button className="view-button">View Details</button>
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
                                                        <button className="view-button">View Details</button>
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
                                                        <button className="view-button">View Details</button>
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

                        <div className='customers'>
                            <div className='card'>
                                <div className='card-header'>
                                    <h3>Ongoing Request</h3>
                                    <button>See all
                                        {/*<span className='arrow-right'>
                                    </span>*/}
                                    </button>
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
                </main>
            </div>
        </div>
    );
}

export default DashboardWebpage;