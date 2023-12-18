import React from 'react';
import '../stylesheets/LandingPage.css';

const LandingWebPage: React.FC = () => {
    return (
        <div>
            <div className='landing-page-background-image'>
                <nav className='landing-page-navbar'>
                    <img src={require('../assets/icons8-tragohelper-50.png')} alt="" className='landing-page-icon-trago' />
                </nav>

                <div className='landing-page-content' id='home'>
                    <h1 className='landing-page-h1'>Welcome to Tra-Go Helper!</h1>
                    <h3 className='landing-page-h3'>Your Ultimate Solution for Emergency Automotive Repair Services!</h3>
                    <p className='landing-page-p'>Step into a world of innovation with TRA-GO Helper, where we present the ultimate solution for service providers catering to vehicle owners in distress. Our innovative tracking system is designed to enhance and streamline the delivery of automotive repair services, providing a lifeline to those stranded on the roads.</p>
                    <button className="landing-page-btn-start" onClick={() => window.location.href = "/loginRegister"}>Get Started</button>
                </div>
            </div>
        </div>
    );
};

export default LandingWebPage;
