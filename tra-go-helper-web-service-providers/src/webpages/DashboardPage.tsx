import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import HistoryWebpage from './HistoryPage';
import SettingWebpage from './SettingPage';
import '../stylesheets/DashboardPage.css';
import firebase from 'firebase';
import Modal from 'react-modal';
import axios, { AxiosResponse, AxiosError } from 'axios';

interface NotificationsData {
    to: string;
    data: {
        title: string;
        body: string;
        datetime: string;
    };
    notification: {
        title: string;
        body: string;
    };
}

interface UserData {
    email: string;
    name: string;
    profilePicture: string;
    status: string;
    ID: string;
    ownerName: string;
    userUID: string;
}

interface RequestData {
    otherNotes: string;
    requestUID: string;
    serviceProviderEmail: string;
    name: string;
    progress: string;
    vehicleType: string;
}

interface vehicleOwnerData {
    name: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
    userUID: string;
    status: string;
    latitude: string;
    longitude: string;// Set default longitude, adjust as needed
    vehicleType: string;
}

interface vehicleOwnerDataLocation {
    vehicleType: string;
    email: string;
    latitude: string;
    longitude: string;
    userUID: string;
}

interface LocationData {
    latitude: string;
    longitude: string;
}

interface VehicleOwnerNotifData {
    email: string;
    name: string;
    phoneNumber: string;
    token: string;
    userUID: string;
}

interface AcceptedServiceRequest {
    name: string;
    otherNotes: string;
    phoneNumber: string;
    progress: string;
    requestUID: string;
    serviceProviderEmail: string;
    timestamp: string;
    vehicleOwnerEmail: string;
    vehicleType: string;
    profilePicture: string;
    userId: string;
    // Add other properties as needed based on your data structure
}

interface TrackingMapProps {
    serviceProviderLocation: { lat: number; lng: number };
    vehicleOwnerLocation: { lat: number; lng: number };
}

const sendNotification = (token: string, notificationTitle: string, notificationBody: string, datetime: string) => {
    // Set the API endpoint and headers
    const endpoint: string = 'https://fcm.googleapis.com/fcm/send';
    const headers: Record<string, string> = {
        'Authorization': 'key=AAAAZiEizQI:APA91bECJ127LAk8TZvIMB-G9kcCz34UfdWvTNsAAeSzdbYzqhSecX_LarMl4HRKyyJPXT5oBt0JleBlLN8NL5fSc9EnqTaaeMkuQ8vua4yQsn3Y0mE8PNZn7qp2TLkt4CibCJLVP_h9', // Replace with your FCM API key
        'Content-Type': 'application/json',
    };

    /*const notif: Notifications = {
        data: {
            title: notificationTitle,
            body: notificationBody,
            datetime: datetime || '',
        },
        to: token,
    };*/


    const notif: NotificationsData = {
        to: token,
        data: {
            title: notificationTitle,
            body: notificationBody,
            datetime: datetime || '',
        },
        notification: {
            title: notificationTitle,
            body: notificationBody,
        },
    };

    // Send the message via the FCM API using axios
    axios.post(endpoint, notif, { headers })
        .then((response: AxiosResponse) => {
            console.log('Successfully sent message:', response.data);
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Error sending message, status code:', error.response.status);
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error sending message, no response received');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', error.message);
            }
        });
};

const DashboardWebpage: React.FC = () => {
    const [tableData, setTableData] = useState<vehicleOwnerData[]>([]);
    const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard')
    const [isModalOpen, setModalOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [user, setUserData] = useState<UserData | null>(null);
    const [requestUser, setRequestUser] = useState<RequestData | null>(null);
    const [ownerUser, setOwnerUser] = useState<vehicleOwnerData | null>(null);
    const [TotalrequestCount, setRequestCount] = useState(0);
    const [cancelledrequestCount, setcancelledRequestCount] = useState(0);
    const [successrequestCount, setsuccessRequestCount] = useState(0);
    const [AcceptedrequestCount, setAcceptedRequestCount] = useState(0);
    const [acceptedRequests, setAcceptedRequests] = useState<AcceptedServiceRequest[]>([]);

    // Dashboard Logic after Login
    useEffect(() => {
        const fetchData = async () => {
            try {

                // const newUser = {
                //     otherNotes: 'none',
                //     serviceProviderEmail: 'markerade2@gmail.com',
                //     requestUID: 'c2ojP6PtMvYACTwYsbTRXjMS7RE2',
                //     vehicleOwnerEmail: 'loidforger@gmail.com',
                //     progress: '1',
                //     vehicleType: 'cr54161213'
                // };

                //   const requestUID = newUser.requestUID;
                //   const newUserRef = firebase.database().ref('serviceRequest').child(requestUID).set(newUser);

                //   console.log('New user added with key:', requestUID);


                // Clear existing data before updating
                setTableData([]);
                setOwnerUser(null);

                const user = firebase.auth().currentUser;

                //Display for ongoing request
                const fetchAcceptedRequests = async () => {
                    const user = firebase.auth().currentUser;

                    if (user) {
                        const serviceProviderEmail = user.email;
                        console.log('Service Provider Email:', serviceProviderEmail);

                        const acceptedRequestsRef = firebase.database().ref('acceptedServiceRequest')
                            .orderByChild('serviceProviderEmail').equalTo(serviceProviderEmail);

                        acceptedRequestsRef.on('value', (snapshot) => {
                            console.log('Snapshot for ongoing request:', snapshot.val());
                            const acceptedRequestsData: AcceptedServiceRequest[] = [];

                            snapshot.forEach((childSnapshot) => {
                                const acceptedRequest: AcceptedServiceRequest = childSnapshot.val() as AcceptedServiceRequest;
                                acceptedRequestsData.push(acceptedRequest);
                            });

                            // Update the state with the accepted service requests
                            setAcceptedRequests(acceptedRequestsData);
                        });
                    }
                };

                // Fetch accepted service requests when the component mounts
                fetchAcceptedRequests();


                if (user) {
                    const uid = user.uid;

                    const [serviceProviderSnapshot, userSnapshot] = await Promise.all([
                        firebase.database().ref(`serviceProvider/${uid}`).once('value'),
                        firebase.database().ref(`users/${uid}`).once('value')
                    ]);

                    const existingServiceProviderData = serviceProviderSnapshot.val() || {};
                    const fetchedUserData = userSnapshot.val();
                    const targetEmail = fetchedUserData?.email;

                    //Cancel Request Logic Counter

                    if (user?.email && targetEmail !== null) {
                        const serviceProviderEmail = user.email;
                        const cancelledrequestRef = firebase.database().ref('cancelledServiceRequest').orderByChild('serviceProviderEmail').equalTo(serviceProviderEmail);
                        cancelledrequestRef.on('value', async (snapshot) => {
                            let count = 0;

                            // Using for...of loop to allow await inside the loop
                            snapshot.forEach((childSnapshot) => {
                                const cancelledrequest: RequestData = childSnapshot.val();

                                // monintoring data pass through through console
                                console.log('Request:', cancelledrequest);
                                console.log('Request email:', cancelledrequest.serviceProviderEmail);
                                console.log('Owner UID:', cancelledrequest.requestUID);

                                if (cancelledrequest.serviceProviderEmail === user?.email) {
                                    console.log('Request email matches target email');
                                    count++;
                                    const ownerUID = cancelledrequest.requestUID;

                                    console.log('Cancelled Owner UID:', ownerUID);

                                }
                            })
                            setcancelledRequestCount(count);
                        });

                    }

                    //Success Request Data Counter
                    if (user?.email && targetEmail !== null) {
                        const serviceProviderEmail = user.email;
                        const successrequestRef = firebase.database().ref('successServiceRequest').orderByChild('serviceProviderEmail').equalTo(serviceProviderEmail);
                        successrequestRef.on('value', async (snapshot) => {
                            let count = 0;

                            // Using for...of loop to allow await inside the loop
                            snapshot.forEach((childSnapshot) => {
                                const successrequest: RequestData = childSnapshot.val();

                                // monintoring data pass through through console
                                console.log('Request:', successrequest);
                                console.log('Request email:', successrequest.serviceProviderEmail);
                                console.log('Owner UID:', successrequest.requestUID);

                                if (successrequest.serviceProviderEmail === user?.email) {
                                    console.log('Request email matches target email');
                                    count++;
                                    const ownerUID = successrequest.requestUID;

                                    console.log('Success Owner UID:', ownerUID);

                                }
                            })
                            setsuccessRequestCount(count);
                        });

                    }

                    //Accept Request Data Counter
                    if (user?.email && targetEmail !== null) {
                        const serviceProviderEmail = user.email;
                        const acceptedrequestRef = firebase.database().ref('acceptedServiceRequest').orderByChild('serviceProviderEmail').equalTo(serviceProviderEmail);
                        acceptedrequestRef.on('value', async (snapshot) => {
                            let count = 0;

                            // Using for...of loop to allow await inside the loop
                            snapshot.forEach((childSnapshot) => {
                                const acceptedrequest: RequestData = childSnapshot.val();

                                // monintoring data pass through through console
                                console.log('Request:', acceptedrequest);
                                console.log('Request email:', acceptedrequest.serviceProviderEmail);
                                console.log('Owner UID:', acceptedrequest.requestUID);

                                if (acceptedrequest.serviceProviderEmail === user?.email) {
                                    console.log('Request email matches target email');
                                    count++;
                                    const ownerUID = acceptedrequest.requestUID;

                                    console.log('Success Owner UID:', ownerUID);

                                }
                            })
                            setAcceptedRequestCount(count);
                        });

                    }

                    //Total and Pending request Table Display and Logic

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

                                if (request.serviceProviderEmail === user?.email && parseInt(request.progress) > 0 && parseInt(request.progress) < 100) {
                                    console.log('Request email matches target email');
                                    count++;
                                    const ownerUID = request.requestUID;

                                    console.log('Owner UID:', ownerUID);

                                    // Fetch owner UID from the service request
                                    if (ownerUID) {
                                        promises.push(
                                            (async () => {
                                                try {
                                                    // Clear existing data before updating
                                                    setTableData([]);
                                                    setOwnerUser(null);

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
                                                            status: getStatusText(request.progress), // Use request.progress instead of existingServiceProviderData.progress
                                                            latitude: '',
                                                            longitude: '',
                                                            vehicleType: ownerData.vehicleType
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
                            console.log('owner name: ', ownerUser?.name);
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

        // Cleanup the event listener when the component unmounts
        // Unsubscribe from the 'value' event and AuthStateChanged when the component unmounts
        return () => {
            const acceptedRequestsRef = firebase.database().ref('acceptedServiceRequest');
            acceptedRequestsRef.off('value');
            console.log('Event listener removed.');
            const requestsRef = firebase.database().ref('serviceRequest');
            requestsRef.off('value');
            unsubscribe();
        };
    }, [setRequestCount, setUserData, setTableData]);
    //First things to know the status is to be check here from classes and right after the data will be transffered to status Text
    const getStatusClass = (status: string) => {
        switch (status) {
            case "1":
                return "status-pending";
            case "25":
                return "status-received";
            case "50":
                return "status-en-route";
            case "75":
                return "status-check-repair";
            case "100":
                return "status-complete";
            case "0":
                return "status-cancel";
            default:
                return ""; // No class for unknown status
        }
    };
    //Here it will get the referrence from the getstatusclass in order to get the approriate Text to be displayed
    const getStatusText = (status: string) => {
        switch (status) {
            case "1":
                return "Pending";
            case "25":
                return "Received";
            case "50":
                return "En Route";
            case "75":
                return "Ongoing Repair";
            case "100":
                return "Complete";
            case "0":
                return "Cancelled";
            default:
                return "Unknown Status";
        }
    };


    //notification
    const [notificationCount, setNotificationCount] = useState(3);
    const [NotifModalVisible, setNotifModalVisible] = useState(false);

    //modal
    const [isModalVisible, setModalVisible] = useState(false);


    //map
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAZNytfQ7AIyGd12zHfAYKp-sWzOR2IzA8';
    const mapRef = useRef<HTMLIFrameElement>(null);
    const [selectedCustomerCoordinates, setSelectedCustomerCoordinates] = useState({ lat: 0, lng: 0 });
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [route, setRoute] = useState(null);
    const [serviceProviderLocation, setServiceProviderLocation] = useState(null);

    //notification
    const openNotificationModal = () => {
        console.log("Opening notification modal");
        setNotifModalVisible(true);
    }

    const closeNotificationModal = () => {
        console.log("Closing notification modal");
        setNotifModalVisible(false);
    };



    const getStatusTextModalDisplay = (progress: string) => {
        switch (progress) {
            case "1":
                return "Pending";
            case "25":
                return "Received";
            case "50":
                return "En Route";
            case "75":
                return "Ongoing Repair";
            case "100":
                return "Complete";
            case "0":
                return "Cancelled";
            default:
                return "Unknown Status";
        }
    };

    //set modal to visible and not
    const openModal = async (selectedOwnerUser: vehicleOwnerDataLocation) => {
        try {
            // Fetch the selected user's data using the userUID from vehicleOwner table
            const ownerSnapshot = await firebase.database().ref(`vehicleOwner/${selectedOwnerUser.userUID}`).once('value');
            const ownerData = ownerSnapshot.val();


            if (ownerData) {
                // Fetch additional data from the serviceRequest table based on userUID
                const serviceRequestSnapshot = await firebase.database().ref(`serviceRequest/${selectedOwnerUser.userUID}`).once('value');
                const serviceRequestData = serviceRequestSnapshot.val();


                // Display owner data
                const vehicleOwnerUserDataToDisplay: vehicleOwnerData = {
                    name: ownerData.name || 'OwnerName',
                    email: ownerData.email || 'email address for owner',
                    userUID: ownerData.userUID || 'RequestUID',
                    phoneNumber: ownerData.phoneNumber || 'phonenumber',
                    profilePicture: ownerData.profilePicture || 'profilePictureURL',
                    status: getStatusTextModalDisplay(serviceRequestData?.progress) || 'Unknown Status', // There is no 'progress' property in vehicleOwnerData; adjust as needed
                    latitude: '0',  // Set default latitude, adjust as needed
                    longitude: '0', // Set default longitude, adjust as needed
                    vehicleType: serviceRequestData?.vehicleType || 'DefaultVehicleType', // Include the vehicleType property
                };

                console.log('location test data transfer:', vehicleOwnerUserDataToDisplay);

                console.log('Before setting state in openModal:', selectedOwnerUser);
                // Update the state with the selected user's data
                setOwnerUser(vehicleOwnerUserDataToDisplay);
                console.log('After setting state in openModal:', selectedOwnerUser);

                // Fetch latitude and longitude from the location table using userUID
                const locationSnapshot = await firebase.database().ref(`vehicleOwnerLocation/${vehicleOwnerUserDataToDisplay.userUID}`).once('value');
                const locationData = locationSnapshot.val();

                if (locationData) {
                    // Display location data
                    const locationDataToDisplay: LocationData = {
                        latitude: locationData.latitude || '0',
                        longitude: locationData.longitude || '0',
                    };

                    console.log('coordinate of selected User: ', locationData);
                    setLocationData(locationDataToDisplay);
                    setSelectedCustomerCoordinates(locationData);
                } else {
                    console.error('Location data not found.');
                }

                console.log('Selected Owner User:', selectedOwnerUser);
                setModalVisible(true); // Set the modal visible after updating the state

            } else {
                console.error('Owner data not found.');
            }

        } catch (error) {
            console.error('Error fetching owner data:', error);
        }
    };

    const [selectedOwnerUser, setSelectedOwnerUser] = useState<vehicleOwnerDataLocation | null>(null);

    const handleAccept = async () => {
        try {
            console.log('Selected Owner User:', ownerUser);
            if (ownerUser && ownerUser.userUID) {
                // Update the progress to "25" in the serviceRequest table
                await firebase.database().ref(`serviceRequest/${ownerUser.userUID}`).update({
                    progress: '25',
                });

                const acceptedServiceRequestRef = firebase.database().ref(`acceptedServiceRequest/${ownerUser.userUID}`);

                // Create a record in the acceptedServiceRequest table
                const serviceRequestSnapshot = await firebase.database().ref(`serviceRequest/${ownerUser.userUID}`).once('value');
                const serviceRequestData = serviceRequestSnapshot.val();

                if (serviceRequestData) {
                    await acceptedServiceRequestRef.set({
                        profilePicture: ownerUser.profilePicture,
                        name: ownerUser.name,
                        phoneNumber: ownerUser.phoneNumber,
                        ...serviceRequestData,
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                    });
                } else {
                    console.error('Service request data not found.');
                }

                // Set the selected owner user
                setSelectedOwnerUser(ownerUser);


                // Close the modal after updating the data
                setModalVisible(false);
            } else {
                console.log('Selected Owner User:', selectedOwnerUser);
                console.error('selectedOwnerUser not found.');
            }

            const vehicleOwnerRef = firebase.database().ref('vehicleOwner').orderByChild('email').equalTo(ownerUser?.email!!);

            vehicleOwnerRef.once('value')
                .then((snapshot) => {
                    // Handle the data here
                    const data: { [key: string]: VehicleOwnerNotifData } = snapshot.val();

                    // Now 'data' is an object where keys are Firebase database keys,
                    // and values are objects conforming to the VehicleOwnerNotifData interface.

                    // Example: Accessing the first item in the data object
                    const firstItem: VehicleOwnerNotifData | undefined = data ? data[Object.keys(data)[0]] : undefined;

                    // Use the data as needed
                    sendNotification(firstItem?.token!!, "Request accepted", "Your request has been accepted","")
                    console.log('Data:', firstItem);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });


        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleDecline = async () => {
        try {
            console.log('Selected Owner User:', ownerUser);
            if (ownerUser && ownerUser.userUID) {
                // Update the progress to "25" in the serviceRequest table
                await firebase.database().ref(`serviceRequest/${ownerUser.userUID}`).update({
                    progress: '0',
                });

                const acceptedServiceRequestRef = firebase.database().ref(`cancelledServiceRequest/${ownerUser.userUID}`);

                // Create a record in the acceptedServiceRequest table
                const serviceRequestSnapshot = await firebase.database().ref(`serviceRequest/${ownerUser.userUID}`).once('value');
                const serviceRequestData = serviceRequestSnapshot.val();

                if (serviceRequestData) {
                    await acceptedServiceRequestRef.set({
                        ...serviceRequestData,
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                    });
                } else {
                    console.error('Service request data not found.');
                }

                // Set the selected owner user
                setSelectedOwnerUser(ownerUser);

                // Close the modal after updating the data
                setModalVisible(false);
            } else {
                console.log('Selected Owner User:', selectedOwnerUser);
                console.error('selectedOwnerUser not found.');
            }
            const vehicleOwnerRef = firebase.database().ref('vehicleOwner').orderByChild('email').equalTo(ownerUser?.email!!);

            vehicleOwnerRef.once('value')
                .then((snapshot) => {
                    // Handle the data here
                    const data: { [key: string]: VehicleOwnerNotifData } = snapshot.val();

                    // Now 'data' is an object where keys are Firebase database keys,
                    // and values are objects conforming to the VehicleOwnerNotifData interface.

                    // Example: Accessing the first item in the data object
                    const firstItem: VehicleOwnerNotifData | undefined = data ? data[Object.keys(data)[0]] : undefined;

                    // Use the data as needed
                    sendNotification(firstItem?.token!!, "Request declined", "Your request has been denied","")
                    console.log('Data:', firstItem);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error accepting request:', error);
        }
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
                center: { lat: selectedCustomerCoordinates.lat, lng: selectedCustomerCoordinates.lng },
                zoom: 14,
            };
            const map = new window.google.maps.Map(mapRef.current, mapOptions);

            const markerCoordinates = { lat: selectedCustomerCoordinates.lat, lng: selectedCustomerCoordinates.lng };
            const marker = new window.google.maps.Marker({
                position: markerCoordinates,
                map: map,
            });
        }
    }, [selectedCustomerCoordinates]);

    //message
    const [showChat, setShowChat] = useState<boolean>(false);
    const [openChats, setOpenChats] = useState([]);
    const [message, setMessage] = useState<string>('');
    const [selectedRequest, setSelectedRequest] = useState<AcceptedServiceRequest | null>(null);

    //En Route Process
    const handleEnRouteClick = async (request: AcceptedServiceRequest) => {
        const newProgress = "50"; // Set the desired progress value

        // Create a new object with the updated progress
        const updatedRequest: AcceptedServiceRequest = { ...request, progress: newProgress };

        try {
            // Update the state with the modified request
            setSelectedRequest(updatedRequest);

            // Update the progress in the serviceRequest node
            await firebase.database().ref(`serviceRequest/${request.requestUID}`).update({
                progress: newProgress,
            });

            // Update the progress in the acceptedServiceRequest node
            await firebase.database().ref(`acceptedServiceRequest/${request.requestUID}`).update({
                progress: newProgress,
            });

            // Perform any other logic related to updating the progress
            // ...
            const vehicleOwnerRef = firebase.database().ref('vehicleOwner').orderByChild('email').equalTo(request.vehicleOwnerEmail!!);

            vehicleOwnerRef.once('value')
                .then((snapshot) => {
                    // Handle the data here
                    const data: { [key: string]: VehicleOwnerNotifData } = snapshot.val();

                    // Now 'data' is an object where keys are Firebase database keys,
                    // and values are objects conforming to the VehicleOwnerNotifData interface.

                    // Example: Accessing the first item in the data object
                    const firstItem: VehicleOwnerNotifData | undefined = data ? data[Object.keys(data)[0]] : undefined;

                    // Use the data as needed
                    sendNotification(firstItem?.token!!, "Request en route", "Your request is now en route","")
                    console.log('Data:', firstItem);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    //Ongoing Procees
    const handleOngoingClick = async (request: AcceptedServiceRequest) => {
        const newProgress = "75"; // Set the desired progress value

        // Create a new object with the updated progress
        const updatedRequest: AcceptedServiceRequest = { ...request, progress: newProgress };

        try {
            // Update the state with the modified request
            setSelectedRequest(updatedRequest);

            // Update the progress in the serviceRequest node
            await firebase.database().ref(`serviceRequest/${request.requestUID}`).update({
                progress: newProgress,
            });

            // Update the progress in the acceptedServiceRequest node
            await firebase.database().ref(`acceptedServiceRequest/${request.requestUID}`).update({
                progress: newProgress,
            });

            // Perform any other logic related to updating the progress
            // ...
            const vehicleOwnerRef = firebase.database().ref('vehicleOwner').orderByChild('email').equalTo(request.vehicleOwnerEmail!!);

            vehicleOwnerRef.once('value')
                .then((snapshot) => {
                    // Handle the data here
                    const data: { [key: string]: VehicleOwnerNotifData } = snapshot.val();

                    // Now 'data' is an object where keys are Firebase database keys,
                    // and values are objects conforming to the VehicleOwnerNotifData interface.

                    // Example: Accessing the first item in the data object
                    const firstItem: VehicleOwnerNotifData | undefined = data ? data[Object.keys(data)[0]] : undefined;

                    // Use the data as needed
                    sendNotification(firstItem?.token!!, "Request on-going inspection", "Your request is now on-going inspection and repair","")
                    console.log('Data:', firstItem);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    //Complete Service Request
    const handleCompleteRequest = async (request: AcceptedServiceRequest) => {
        const newProgress = "100"; // Set the desired progress value

        // Create a new object with the updated progress
        const updatedRequest: AcceptedServiceRequest = { ...request, progress: newProgress };

        try {
            // Update the state with the modified request
            setSelectedRequest(updatedRequest);

            // Update the progress in the serviceRequest node
            await firebase.database().ref(`serviceRequest/${request.requestUID}`).update({
                progress: newProgress,
            });

            // Update the progress in the acceptedServiceRequest node
            await firebase.database().ref(`acceptedServiceRequest/${request.requestUID}`).update({
                progress: newProgress,
            });

            // Add the updated request to the successServiceRequest table under the selected user
            await firebase.database().ref(`successServiceRequest/${request.requestUID}`).set({
                ...updatedRequest,
                // Add any additional data you want to store in the successServiceRequest table
            });

            // Delete the entry in the acceptedServiceRequest node
            await firebase.database().ref(`acceptedServiceRequest/${request.requestUID}`).remove();

            // Perform any other logic related to updating the progress
            // ...

            //Add Verification Logic Here



            //to close the chat box once the transaction is completed and Verify
            const vehicleOwnerRef = firebase.database().ref('vehicleOwner').orderByChild('email').equalTo(request.vehicleOwnerEmail!!);

            vehicleOwnerRef.once('value')
                .then((snapshot) => {
                    // Handle the data here
                    const data: { [key: string]: VehicleOwnerNotifData } = snapshot.val();

                    // Now 'data' is an object where keys are Firebase database keys,
                    // and values are objects conforming to the VehicleOwnerNotifData interface.

                    // Example: Accessing the first item in the data object
                    const firstItem: VehicleOwnerNotifData | undefined = data ? data[Object.keys(data)[0]] : undefined;

                    // Use the data as needed
                    sendNotification(firstItem?.token!!, "Request complete", "Your request has been completed","")
                    console.log('Data:', firstItem);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            toggleChat();
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    //   useEffect(() => {
    //     const user = firebase.auth().currentUser;

    //     if (user) {
    //       const vehicleOwnerRef = firebase.database().ref(`vehicleOwner/${user.uid}`);
    //       const serviceRequestRef = firebase.database().ref('serviceRequest');

    //       Fetch the token from vehicleOwner
    //       vehicleOwnerRef.once('value', (vehicleOwnerSnapshot) => {
    //         const vehicleOwnerData: VehicleOwner | null = vehicleOwnerSnapshot.val();

    //         if (vehicleOwnerData) {
    //           const token = vehicleOwnerData.token;

    //           Update the corresponding serviceRequest with the token
    //           serviceRequestRef.orderByChild('userUID').equalTo(vehicleOwnerData.userUID).once('value', (serviceRequestSnapshot) => {
    //             serviceRequestSnapshot.forEach((serviceRequestChildSnapshot) => {
    //               const serviceRequestData: ServiceRequest = serviceRequestChildSnapshot.val();
    //               serviceRequestRef.child(serviceRequestChildSnapshot.key!).update({ token: token });
    //             });
    //           });
    //         }
    //       });

    //       Cleanup
    //       return () => {
    //         vehicleOwnerRef.off('value');
    //         serviceRequestRef.off('value');
    //       };
    //     }
    //   }, []);

    //   const handleSendMessage = () => {
    //     if (message.trim() !== '') {
    //       const newMessage = {
    //         sender: userDisplayName,
    //         content: message,
    //         timestamp: new Date().toLocaleString(),
    //       };

    //       Push the new message to the Firebase database
    //       firebase.database().ref('messages').push(newMessage);

    //       setMessage(''); // Clear the input after sending the message
    //     }
    //   };

    //show chat message
    const toggleChat = () => {
        console.log("Before toggling:", showChat);
        setShowChat((prevShowChat) => {
            const updatedState = !prevShowChat;
            console.log("After toggling:", updatedState);
            return updatedState;
        });
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



    //Labeling
    const viewDetailsLabel = "View Details";


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
                                {user ? (
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
                                        <h1 className='card-h1'>{TotalrequestCount}</h1>
                                        <span>Total Request</span>
                                    </div>
                                    <div>
                                        <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                    </div>
                                </div>

                                <div className='dashboard-card-single'>
                                    <div>
                                        <h1 className='card-h1'>{cancelledrequestCount}</h1>
                                        <span>Cancel Request</span>
                                    </div>
                                    <div>
                                        <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                    </div>
                                </div>

                                <div className='dashboard-card-single'>
                                    <div>
                                        <h1 className='card-h1'>{successrequestCount}</h1>
                                        <span>Success Request</span>
                                    </div>
                                    <div>
                                        <img src={require('../assets/icons8-email-48.png')} alt="" className="card-icon" />
                                    </div>
                                </div>

                                <div className='dashboard-card-single'>
                                    <div>
                                        <h1 className='card-h1'>{AcceptedrequestCount}</h1>
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
                                                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${locationData?.latitude},${locationData?.longitude}`}
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
                                                <input type="text" value={ownerUser?.name} readOnly />

                                                <label>Contact No.:</label>
                                                <input type="text" value={ownerUser?.phoneNumber} readOnly />

                                                <label>Plate Number:</label>
                                                <input type="text" value={ownerUser?.vehicleType} readOnly />

                                                <label>Status:</label>
                                                <input type="text" value={ownerUser?.status} readOnly />

                                                <div className="modal-button-container">
                                                    <button className="modal-accept-button" onClick={handleAccept}>Accept</button>
                                                    <button className="modal-decline-button" onClick={handleDecline}>Decline</button>
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
                                                            <td></td>
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
                                                                    {row.status === 'Pending' && (
                                                                        <>
                                                                            <td>{row.name}</td>
                                                                            {!isModalVisible && ( // Render the button only if the modal is not visible
                                                                                <td className="with-button">
                                                                                    <button className="view-button" id="viewDetails" onClick={() => openModal(row)}>
                                                                                        {viewDetailsLabel}
                                                                                    </button>
                                                                                </td>
                                                                            )}
                                                                            {!isModalVisible && (
                                                                                <td className={`with-button ${getStatusClass(row.status)}`}>
                                                                                    {(row.status)}
                                                                                </td>
                                                                            )}
                                                                        </>
                                                                    )}
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
                                {/*Chat Message */}
                                {showChat && (
                                    <div className={`chat-container ${showChat ? 'active' : ''}`}>
                                        {/* Navigation header */}
                                        <div className="chat-content">
                                            {acceptedRequests.length > 0 && (
                                                acceptedRequests.map((request) => (
                                                    <div key={request.userId}>
                                                        {/* Chat header */}
                                                        <div className="chat-header">
                                                            <img
                                                                src={request.profilePicture}
                                                                width="40px"
                                                                height="40px"
                                                                alt="User Avatar"
                                                                style={{
                                                                    borderRadius: '50%',
                                                                    objectFit: 'cover',
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    display: 'block'
                                                                }}
                                                            />
                                                            <h3>{request.name}</h3>
                                                            <span className="close-btn" onClick={toggleChat}>
                                                                &times;
                                                            </span>
                                                        </div>

                                                        {/* Chat messages */}
                                                        <div className="chat-body">
                                                            {/* Example messages, replace with actual chat messages */}
                                                            <div className="message">
                                                                <img src={request.profilePicture} width="40px" height="40px" alt="User Avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
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

                                                            {/* Add more chat messages as needed */}
                                                        </div>

                                                        {/* Send button */}
                                                        <button className="send-button">Send</button>

                                                        {/* Progress buttons */}
                                                        {request.progress === '25' && (
                                                            <button className='user-circle' onClick={() => handleEnRouteClick(request)}>
                                                                En Route
                                                            </button>
                                                        )}

                                                        {request.progress === '50' && (
                                                            <button className="send-button" onClick={() => handleOngoingClick(request)}>
                                                                Arrived & Repair Ongoing
                                                            </button>
                                                        )}

                                                        {request.progress === '75' && (
                                                            <button className="send-button" onClick={() => handleCompleteRequest(request)}>
                                                                Payed & Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
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
                                            {acceptedRequests.length > 0 ? (
                                                acceptedRequests.map((request) => (
                                                    <div key={request.requestUID} className='customer'>
                                                        <div className='info'>
                                                            <img src={request.profilePicture} width="40px" height="40px" alt="" className="customer-icon" />
                                                            <div>
                                                                <h4>{request.name}</h4>
                                                                <small>Vehicle Owner</small>
                                                            </div>
                                                        </div>
                                                        <hr />
                                                        <div className='info'>
                                                            <h4>Status: {getStatusText(request.progress)}</h4>
                                                        </div>
                                                        <hr />
                                                        <div className='contact'>
                                                            <button className='user-chat-circle' onClick={() => toggleChat(request.userId)}>
                                                                <img src={require('../assets/icons8-message-48.png')} alt="" className="card-icon" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ marginTop: '20px', marginLeft: '10px', marginRight: '10px', marginBottom: '20px' }}>
                                                    <center>No Ongoing Requests</center>
                                                </div>
                                            )}
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