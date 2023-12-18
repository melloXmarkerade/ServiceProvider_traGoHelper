import React, { FormEvent, useState, ChangeEvent } from 'react';
import '../stylesheets/LoginRegisterPage.css';
import firebase from 'firebase';
import { db, auth, storageRef } from '../firebase';
import ErrorModal from './ErrorModal';
import SuccessModal from './SuccessModal';
import EmptyFieldModal from './EmptyFieldModal';

const LoginRegisterWebpage: React.FC = () => {
    //Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    //Valdation Modal
    const [showModal, setShowModal] = useState(false);
    const [fieldsEmpty, setFieldsEmpty] = useState(false);
    
    const handleLogin = async () => {
        try {
          // Sign in with email and password
          await firebase.auth().signInWithEmailAndPassword(email, password);
    
          // Get the current user
          const currentUser = firebase.auth().currentUser;
          // Store user data in the Realtime Database
          if (currentUser) {
            const uid = currentUser.uid;
            const email = currentUser.email;

            await firebase.database().ref(`users/${currentUser.uid}`).set({
              email: currentUser.email,
              // Additional user data can be stored here
            });
            
            console.log(`User ID: ${uid}`);
            console.log(`Email: ${email}`);
            // Redirect to the dashboard or perform other actions
            // Example using Navigate from React Router:
            // Note: This assumes you have a <Route path="/dashboard" ... /> defined in your React Router setup
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error logging in:', error);
    
          // Display an error message
          setErrorMessage('Incorrect credentials. Please try again.');
          setShowModal(true);
        }
      };

      const closeModal = () => {
        // Close the modal
        setShowModal(false);
        setFieldsEmpty(false);
      };

  //Registration
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    Confirmpassword: string;
    firstname: string;
    middlename: string;
    lastname: string;
    shopname: string;
    username: string;
    busineesContactNum: string;
    businessType: string;
    businessAddress: string;
    businessRegistrationNum: string;
    dateofEstablishment: string;
    businessOperatingHours: {
        start: string;
        end: string;
      };
    businessDescription: string;
    status: string;
    selectedServices: { [key: string]: boolean }; // Add index signature
  }>({
    email: '',
    password: '',
    Confirmpassword: '',
    firstname: '',
    middlename: '',
    lastname: '',
    shopname: '',
    username: '',
    busineesContactNum: '',
    businessType: '',
    businessAddress: '',
    businessRegistrationNum: '',
    dateofEstablishment: '',
    businessOperatingHours: {
        start: '',
        end: '',
      },
    businessDescription: '',
    status: 'Pending',
    selectedServices: {}, // Add this line to initialize selectedServices
  });

    const handleTimeChange = (type: 'start' | 'end', e: ChangeEvent<HTMLInputElement>): void => {
        // Ensure the time value is in 'HH:mm' format
        const formattedTime = e.target.value;
    
        setFormData((prevData) => ({
        ...prevData,
        businessOperatingHours: {
            ...prevData.businessOperatingHours,
            [type]: formattedTime,
        },
        }));
    };
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setFormData({
          ...formData,
          [e.target.id || e.target.name]: e.target.value,
        });
      };

    
    // Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    //registration Logic
    const handleRegistration = async (e: FormEvent) => {
      e.preventDefault();
  
      try {
        // Create a new user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(
          formData.email,
          formData.password,
        );
        

        
        const selectedServicesArray = Object.entries(formData.selectedServices)
        .filter(([_, selected]) => selected)
        .map(([service, _]) => service);

            // Upload files to Firebase Storage
            const businessPermitFileInput = document.getElementById('businessPermitFile') as HTMLInputElement;
            const identificationPhotoFileInput = document.getElementById('identificationPhotoFile') as HTMLInputElement;
            const profilePictureFileInput = document.getElementById('profilepicturefile') as HTMLInputElement;

            const businessPermitFile = businessPermitFileInput?.files?.[0];
            const identificationPhotoFile = identificationPhotoFileInput?.files?.[0];
            const profilePictureFile = profilePictureFileInput?.files?.[0];

            if (!businessPermitFile || !identificationPhotoFile || !profilePictureFile) {
            throw new Error('Business permit file, identification photo file, or profile picture file is missing.');
            }

            // Storage references
            const businessPermitFileRef = storageRef.child(`businessPermits/${formData.email}-${Date.now()}-${businessPermitFile.name}`);
            const identificationPhotoFileRef = storageRef.child(`identificationPhotos/${formData.email}-${Date.now()}-${identificationPhotoFile.name}`);
            const profilePicturePhotoFileRef = storageRef.child(`profilePhotos/${formData.email}-${Date.now()}-${profilePictureFile.name}`);

            // Upload files concurrently
            await Promise.all([
            businessPermitFileRef.put(businessPermitFile),
            identificationPhotoFileRef.put(identificationPhotoFile),
            profilePicturePhotoFileRef.put(profilePictureFile),
            ]);

            // Get file URLs
            const businessPermitFileURL = await businessPermitFileRef.getDownloadURL();
            const identificationPhotoFileURL = await identificationPhotoFileRef.getDownloadURL();
            const profilePicturePhotoFileURL = await profilePicturePhotoFileRef.getDownloadURL();



        // Save additional user information to the database
        await db.ref('RequestAcc').push({
          email: formData.email,
          password: formData.password,
          Confirmpassword: formData.Confirmpassword,
          FirstName: formData.firstname,
          MiddleName: formData.middlename,
          LastName: formData.lastname,
          ShopName: formData.shopname,
          username: formData.username,
          busineesContactNum: formData.busineesContactNum,
          businessType: formData.businessType,
          businessAddress: formData.businessAddress,
          businessRegistrationNum: formData.businessRegistrationNum,
          dateofEstablishment: formData.dateofEstablishment,
          businessOperatingHours: formData.businessOperatingHours,
          businessDescription: formData.businessDescription,
          selectedServices: selectedServicesArray,
          businessPermitFileURL,
          identificationPhotoFileURL,
          profilePicturePhotoFileURL,  
          status: 'Pending',
          // Add other user information here
        });
        const serviceProviderRef = db.ref('serviceProvider');
        const newServiceProviderRef = serviceProviderRef.push({
            email: formData.email,
            password: formData.password,
            Confirmpassword: formData.Confirmpassword,
            FirstName: formData.firstname,
            MiddleName: formData.middlename,
            LastName: formData.lastname,
            name: formData.shopname,
            username: formData.username,
            businessType: formData.businessType,
            phoneNumber: formData.busineesContactNum,
            address: formData.businessAddress,
            registrationNumber: formData.businessRegistrationNum,
            establishmentDate: formData.dateofEstablishment,
            businessOperatingHours: formData.businessOperatingHours,
            description: formData.businessDescription,
            businessPermitFileURL,
            identificationPhotoFileURL,
            profilePicture: profilePicturePhotoFileURL,
            status: 'Pending',
            serviceOffers: selectedServicesArray,
            token: '',
            type: 'tires',
            userUID: '', // Placeholder for now
            // Add other user information here
        });

        // Get the UID of the newly pushed data
        const userUID = newServiceProviderRef.key;

        // Update the data with the retrieved UID
        newServiceProviderRef.update({
        userUID,
        });

          
  
        // Continue with the registration process or redirect the user
        console.log('User registered successfully:', userCredential.user);

        // Reset form data after successful registration
        setFormData({
            email: '',
            password: '',
            Confirmpassword: '',
            firstname: '',
            middlename: '',
            lastname: '',
            shopname: '',
            username: '',
            busineesContactNum: '',
            businessType: '',
            businessAddress: '',
            businessRegistrationNum: '',
            dateofEstablishment: '',
            businessOperatingHours: {
                start: '',
                end: '',
              },
            businessDescription: '',
            status: 'Pending',
            selectedServices: {},
        });
        setShowSuccessModal(true);

        setTimeout(() => {
            window.location.reload();
          }, 5000); // 3000 milliseconds = 3 seconds
  
      } catch (error) {
        console.error('Error registering user:', error);

        if (error instanceof Error && 'code' in error) {
            if (error.code === 'auth/email-already-in-use') {
              setErrorMessage('This email address is already in use.');
            } else if (error.code === 'auth/weak-password') {
              setErrorMessage('The password is too weak. Please choose a stronger password.');
            } else {
              // For other errors, display a generic error message
              setErrorMessage('An error occurred during registration. Please try again.');
            }
          } else {
            // If 'error' doesn't have a 'code' property, display a generic error message
            setErrorMessage('An unknown error occurred during registration. Please try again.');
          }
        
          setShowModal(true);   
      }
    };

    const handleCheckboxChange = (service: string | number) => {
        setFormData((prevData) => ({
          ...prevData,
          selectedServices: {
            ...prevData.selectedServices,
            [service]: !prevData.selectedServices[service],
          },
        }));
      };
      



    // Transition for both login and registration
    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);

    const toggleForm = (): void => {
        setShowRegisterForm(!showRegisterForm);
    };

    /* Progress Bar */
    const previousButton = document.querySelectorAll(".register-btn-prev") as NodeListOf<HTMLButtonElement>;
    const nextButton = document.querySelectorAll(".register-btn-next") as NodeListOf<HTMLButtonElement>;
    const progress = document.getElementById("progress") as HTMLElement;
    const formSteps = document.querySelectorAll(".step") as NodeListOf<HTMLDivElement>;
    const progressStep = document.querySelectorAll(".progress-step") as NodeListOf<HTMLDivElement>;

    let formStepNumber = 0;

    function updateProgressBar() {
        const totalSteps = progressStep.length - 1;
        const completedSteps = formStepNumber;
        const progressWidth = (completedSteps / totalSteps) * 100 + "%";

        if (formStepNumber < 0 || formStepNumber > totalSteps) {
            console.error("Invalid form step index:", formStepNumber);
            // Handle the error, for example, set formStepNumber to a valid index
            formStepNumber = Math.min(Math.max(formStepNumber, 0), totalSteps);
        }

        console.log('formStepNumber:', formStepNumber);
        console.log('totalSteps:', totalSteps);
        
        // Update the width of the progress bar
        progress.style.width = progressWidth;

        // Update the active class for each step
        progressStep.forEach((step, index) => {
            if (index <= completedSteps) {
                step.classList.add("progress-step-active");
            } else {
                step.classList.remove("progress-step-active");
            }
        });
    }


    nextButton.forEach(btn => {
        btn.addEventListener('click', () => {
            formStepNumber++;
            updateFormSteps();
            updateProgressBar();
        });
    });

    previousButton.forEach(btn => {
        btn.addEventListener('click', () => {
            formStepNumber--;
            updateFormSteps();
            updateProgressBar();
        });
    });

    function updateFormSteps() {
        formSteps.forEach((step) => {
            if (step.classList.contains("step-active")) {
                step.classList.remove("step-active");
            }
        });
    
        if (formStepNumber >= 0 && formStepNumber < formSteps.length) {
            const currentStep = formSteps[formStepNumber];
            if (currentStep) {
                currentStep.classList.add("step-active");
            } else {
                console.error(`Form step at index ${formStepNumber} is undefined.`);
            }
        } else {
            console.error(`Invalid form step index: ${formStepNumber}`);
        }
    }

    
    return (
        <div className='login-register-background'>
            <div className='login-register-container'>
                <div className='left-side-content'>
                    <img src={require('../assets/logo_trago.png')} alt="" className="left-side-logo-image" />
                    <div className='left-side-text'>
                        <p className='left-caption-content'>Fast and quality automobile service</p>
                    </div>
                </div>

                {/*For Login*/}
                <div className={`logreg-box ${showRegisterForm ? 'active' : ''}`}>
                    <div className='form-box login'>
                     <form>
                            <header className='header-login-content'>Login</header>
                            <p className='paragraph-login-content'>Login to access your account</p>

                            <div className='login-input-box'>
                                <img src={require('../assets/icons8-email-48.png')} alt="" className="login-icon-email" />
                                <input type='email' id='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete='off' />
                            </div>

                            <div className='login-input-box'>
                                <img src={require('../assets/icons8-password-49.png')} alt="" className="login-icon-password" />
                                <input type='password' id='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete='off'  />
                            </div>

                            <div className='login-forgot'>
                                <a href='#'>Forgot Password?</a>
                            </div>
                                <button type='submit' className='login-btn' onClick={handleLogin}>Login</button>
                                {showModal && <ErrorModal errorMessage={errorMessage} onClose={closeModal} />}
                                {showModal && (<ErrorModal errorMessage={fieldsEmpty ? 'Please fill in all fields.' : errorMessage} onClose={closeModal}/>)}
                            <div className='login-register'>
                                <span>Don't have an account? <a href='#' className='regsiter-link' onClick={toggleForm}>Register</a></span>
                            </div>
                        </form>
                    </div>

                    {/*For Register*/}
                    <div className='form-box register'>
                        <form action='#' id='registration-form'>
                            <header className='header-register-content'>Register</header>
                            <p className='paragraph-register-content'>Create your Tra-Go Helper account</p>

                            <div className='progressbar'>
                                <div className='progress' id='progress'></div>

                                <div className='progress-step progress-step-active' data-title='Account'></div>
                                <div className='progress-step' data-title='Information'></div>
                                    <div className='progress-step' data-title='Details'></div>
                                <div className='progress-step' data-title='Service'></div>
                                <div className='progress-step' data-title='Upload'></div>
                            </div>

                            {/*Step One*/}
                            <div className='step step-active' id='step-1'>
                                <div className='register-input-box'>
                                    <input type='text' name="firstname" value={formData.firstname} onChange={handleChange} className='register-text-input' id='firstname' placeholder='Enter your business name' required />
                                    <label htmlFor='firstname' className='register-label'>First Name</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='text' name="middlename" value={formData.middlename} onChange={handleChange} className='register-text-input' id='middlename' placeholder='Enter your business name' required />
                                    <label htmlFor='middlename' className='register-label'>Middle Name</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='text' name="lastname" value={formData.lastname} onChange={handleChange} className='register-text-input' id='lastname' placeholder='Enter your business name' required />
                                    <label htmlFor='lastname' className='register-label'>Last Name</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='text' className='register-text-input' name='username' id='username' placeholder='Enter your username'  value={formData.username} onChange={handleChange} required />
                                    <label htmlFor='username' className='register-label'>Username</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='email' className='register-text-input' id='email' placeholder='Enter your email address'  value={formData.email} onChange={handleChange} required autoComplete='off' />
                                    <label htmlFor='email' className='register-label'>Email Address</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='password' className='register-text-input' id='password' placeholder='Enter your password' value={formData.password} onChange={handleChange} required autoComplete='off' />
                                    <label htmlFor='password' className='register-label'>Password</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='password' className='register-text-input' id='Confirmpassword' placeholder='Re-type your password' value={formData.Confirmpassword} onChange={handleChange} required autoComplete='off' />
                                    <label htmlFor='Confirmpassword' className='register-label'>Confirm Password</label>
                                </div>

                                <button type='button' className='register-btn-next'>Next</button>

                                <div className='register-login'>
                                    <span>Already have an account? <a href='#' className='login-link' onClick={toggleForm}>Login</a></span>
                                </div>
                            </div>

                            {/*Step Two*/}
                            <div className='step' id='step-2'>
                
                                <div className='register-input-box'>
                                    <input type='text' name="shopname" value={formData.shopname} onChange={handleChange} className='register-text-input' id='shopname' placeholder='Enter your business name' required />
                                    <label htmlFor='shopname' className='register-label'>Business Name</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='text' name='busineesContactNum' value={formData.busineesContactNum} onChange={handleChange} className='register-text-input' id='busineesContactNum' placeholder='Enter your contact no.' required autoComplete='off' />
                                    <label htmlFor='busineesContactNum' className='register-label'>Business Contact No.</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='text' name='businessType' value={formData.businessType} onChange={handleChange} className='register-text-input' id='businessType' placeholder='Enter type [e.g., Sole, Partnership, LLC, Corp, Co-op]' required autoComplete='off' />
                                    <label htmlFor='businesstype' className='register-label'>Business Type</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='text' name='businessAddress' value={formData.businessAddress} onChange={handleChange} className='register-text-input' id='businessAddress' placeholder='Enter your business address' required autoComplete='off' />
                                    <label htmlFor='businessAddress' className='register-label'>Business Address</label>
                                </div>

                                <div className='button-container'>
                                    <button type='button' className='register-btn-prev' >Previous</button>
                                    <button type='button' className='register-btn-next' >Next</button>
                                </div>


                            </div>


                            {/*Step Three*/}
                            <div className='step' id='step-3'>
                                <div className='register-input-box'>
                                    <input type='text' name='businessRegistrationNum' value={formData.businessRegistrationNum} onChange={handleChange} className='register-text-input' id='businessRegistrationNum' placeholder='Enter registration number' required autoComplete='off' />
                                    <label htmlFor='businessRegistrationNum' className='register-label'>Business Registration Number</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='date' name='dateofEstablishment' value={formData.dateofEstablishment} onChange={handleChange} className='register-text-input' id='dateofEstablishment' placeholder='Enter date of establishment' required autoComplete='off' />
                                    <label htmlFor='dateofEstablishment' className='register-label'>Date of Establishment</label>
                                </div>

                                <div className='register-input-box'>
                                <input type='time' name='businessOperatingHoursStart' value={formData.businessOperatingHours.start} onChange={(e) => handleTimeChange('start', e)} className='register-text-input' id='businessOperatingHoursStart' required autoComplete='off' />
                                <label htmlFor='businessOperatingHoursStart' className='register-label'>Business Operating Hours Start</label>
                                </div>

                                <div className='register-input-box'>
                                    <input type='time' name='businessOperatingHoursEnd' value={formData.businessOperatingHours.end} onChange={(e) => handleTimeChange('end', e)} className='register-text-input' id='businessOperatingHoursEnd' required autoComplete='off'/>
                                    <label htmlFor='businessOperatingHoursEnd' className='register-label'>Business Operating Hours End</label>
                                </div>

                                <div className='register-text-area'>
                                    <div className='floating-label'>
                                        <textarea typeof='text' name='businessDescription' value={formData.businessDescription} onChange={handleChange}  className='text-area-input' id="businessDescription" placeholder="Enter your business description" required autoComplete='off'></textarea>
                                        <label htmlFor="businessDescription" className='label-text-area'>Business Description</label>
                                    </div>
                                </div>

                                <div className='button-container'>
                                    <button type='button' className='register-btn-prev' >Previous</button>
                                    <button type='button' className='register-btn-next' >Next</button>
                                </div>
                            </div>

                            {/*Step Four*/}
                            <div className='step' id='step-4'>
                                <div className='register-center'>
                                    <div className='register-menu'>
                                        <div className='register-title'>Select Service Offers</div>
                                        <div className='register-menu-container'>
                                            <div className='register-menu-list'>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1"  onChange={() => handleCheckboxChange("Air Filter Replacement")}/>
                                                    <label htmlFor="opt1"> Air filter replacemet </label>
                                                </div>

                                                <div>
                                                    <input type="checkbox" name="role" id="opt1"  onChange={() => handleCheckboxChange("Antifreeze added")}/>
                                                    <label htmlFor="opt1"> Antifreeze added </label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Aftermarket alarm removal")}/>
                                                    <label htmlFor="opt1"> Aftermarket alarm removal</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Battery replacemet")}/>
                                                    <label htmlFor="opt1"> Battery replacemet </label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Brake service")}/>
                                                    <label htmlFor="opt1"> Brake service </label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Electrical system")}/>
                                                    <label htmlFor="opt1"> Electrical system </label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Fuel cap tightening")}/>
                                                    <label htmlFor="opt1"> Fuel cap tightening</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Ignition system")}/>
                                                    <label htmlFor="opt1"> Ignition system </label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Maintenance (Schedule)")}/>
                                                    <label htmlFor="opt1"> Maintenance (Schedule)  </label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Oil change & filter replacement")}/>
                                                    <label htmlFor="opt1"> Oil change & filter replacement</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Oxygen sensor replacement<")}/>
                                                    <label htmlFor="opt1"> Oxygen sensor replacement</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Spark plug replacement")}/>
                                                    <label htmlFor="opt1"> Spark plug replacement</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Tire service")}/>
                                                    <label htmlFor="opt1"> Tire service</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Wheel alignment")}/>
                                                    <label htmlFor="opt1"> Wheel alignment</label>
                                                </div>
                                                <div>
                                                    <input type="checkbox" name="role" id="opt1" onChange={() => handleCheckboxChange("Wiper blades replacement")}/>
                                                    <label htmlFor="opt1"> Wiper blades replacement</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='button-container'>
                                    <button type='button' className='register-btn-prev' >Previous</button>
                                    <button type='button' className='register-btn-next' >Next</button>
                                </div>

                            </div>

                            {/*Step 5 */}
                            <div className='step' id='step-5'>
                                <div className='title-file'>Business Permit
                                    <div className='input-box-file'>
                                        <input type='file' id='businessPermitFile' className='input-file' required autoComplete='off' />
                                    </div>
                                </div>

                                <div className='title-file'>Identification Photo
                                    <div className='input-box-file'>
                                        <input type='file' id='identificationPhotoFile' className='input-file' required autoComplete='off' />
                                    </div>
                                </div>

                                <div className='title-file'>Profile Picture
                                    <div className='input-box-file'>
                                        <input type='file' id='profilepicturefile' className='input-file' required autoComplete='off' />
                                    </div>
                                </div>

                                <div className='button-container'>
                                    <button type='button' className='register-btn-prev' >Previous</button>
                                    <button type='button' className='register-btn-submit'  onClick={handleRegistration} >Submit</button>
                                    {showModal && <ErrorModal errorMessage={errorMessage} onClose={closeModal} />}
                                    {showModal && (<ErrorModal errorMessage={fieldsEmpty ? 'Please fill in all fields.' : errorMessage} onClose={closeModal}/>)}
                                     {/* Success Modal */}
                                </div>
                                
                                    
                                {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
                            </div>
                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginRegisterWebpage;