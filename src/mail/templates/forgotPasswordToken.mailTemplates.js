const forgotPasswordTemplate = async (firstName, email, link) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Email</title>
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
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h2 {
                color: black;
            }
            p {
                color: #2d2d2d;
            }
            .reset-link {
                display: inline-block;
                padding: 10px 15px;
                background-color: #4285f4;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            }
            .note {
                color: #7b7b7b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Password Reset Request By ${firstName}</h2>
            <p>Hello ${email},</p>
            <p>We received a request to reset your password. To complete the process, please click on the link below:</p>
            <p><a href="${link}" class="reset-link" title="Reset Your Password">Reset Your Password</a></p>
            <p class="note">Note: This link is valid for a limited time. If you did not request a password reset, please ignore this email.</p>
        
            <p>Best regards,<br>VotingApp API, Developed by <b> Atul Verma</b></p>
        </div>
    </body>
    </html>
    `;
};

export default forgotPasswordTemplate