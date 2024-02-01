const resetPasswordTemplate = async (firstName, newPassword) => {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
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
          .pass {
            color: #007BFF;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
        
          <h1>Password Reset Successful</h1>
          <p>Hello <b>${firstName}</b>,</p>
          <p>Your password has been reset successfully. Your new password is: <b class= "pass">${newPassword}</b>.</p>
          <p>If you did not initiate this change, please contact us immediately.</p>
          <p>Thank you</p>
          <p>Best regards,<br>VotingApp API, Developed by <b> Atul Verma</b></p>
        </div>
      </body>
      </html>
      `;
  };
  
  export default resetPasswordTemplate;
  