// Script to submit application to WindBorne Systems
// Fill in your information below and run: node submit-application.js

const APPLICATION_ENDPOINT = 'https://windbornesystems.com/career_applications.json';

// ===== FILL IN YOUR INFORMATION BELOW =====

const applicationData = {
  career_application: {
    name: "YOUR_NAME_HERE",
    email: "YOUR_EMAIL_HERE",
    role: "Junior Web Developer",
    notes: "YOUR_COLLABORATION_SENTENCE_HERE. I chose weather data APIs because WindBorne's mission is improving weather forecasting—visualizing their balloon constellation alongside real-time atmospheric conditions shows the environmental context they're measuring and operating within.",
    submission_url: "YOUR_VERCEL_URL_HERE",  // e.g., https://windborne-tracker.vercel.app
    portfolio_url: "YOUR_PORTFOLIO_PROJECT_URL_HERE",
    resume_url: "YOUR_RESUME_URL_HERE"
  }
};

// ===== DO NOT MODIFY BELOW THIS LINE =====

async function submitApplication() {
  // Validate that fields have been filled in
  const requiredFields = [
    'name', 'email', 'notes', 'submission_url', 'portfolio_url', 'resume_url'
  ];
  
  const missingFields = requiredFields.filter(field => 
    applicationData.career_application[field].includes('YOUR_') || 
    applicationData.career_application[field].includes('_HERE')
  );
  
  if (missingFields.length > 0) {
    console.error('❌ Error: Please fill in the following fields:');
    missingFields.forEach(field => console.error(`  - ${field}`));
    process.exit(1);
  }
  
  console.log('📤 Submitting application to WindBorne Systems...\n');
  console.log('Application data:');
  console.log(JSON.stringify(applicationData, null, 2));
  console.log('\n');
  
  try {
    const response = await fetch(APPLICATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationData)
    });
    
    const responseData = await response.text();
    
    console.log(`\nResponse status: ${response.status}`);
    console.log(`Response body: ${responseData}\n`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Your application has been submitted!');
      console.log('You should hear back from WindBorne within a day or two (up to a week).');
    } else {
      console.error('❌ FAILED! Status code:', response.status);
      console.error('The application was not accepted. Check the response body above for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error submitting application:', error.message);
    process.exit(1);
  }
}

// Run the submission
submitApplication();

