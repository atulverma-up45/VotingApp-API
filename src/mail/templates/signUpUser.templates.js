const signUpUserTemplate = async(firstName, email, password)=>{
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to VotingApp</title>
        <style>
          body {
            font-family: Gilroy;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: black;
          }
          p {
            color: #2d2d2d;
          }
          
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to VotingApp!</h1>
          <p>Congratulations ${firstName}!</p>
          <p>
            Your registration was successful. You are now part of our community. Get
            ready to explore and enjoy all the exciting features we have to offer.
          </p>
    
          <p><strong>Your account details:</strong></p>
          <ul>
            <li><strong>Email Address:</strong> ${email}</li>
            <li><strong>Password:</strong> ${password}</li>

          </ul>
    
          <p>Log in to your account and start experiencing Our VotingApp today!</p>
          <p>Best regards,<br>VotingApp API, Developed by <b> Atul Verma</b></p>
        </div>
      </body>
    </html>
    `
}

export default signUpUserTemplate;