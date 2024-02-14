const newPollCreatedTemplate = async (req, res) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Poll Notification Mail VotingApp API</title>
    
        <style>
          body {
            font-family: Gilroy;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            line-height: 1.3;
          }
    
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
    
          h2 {
            color: black;
            font-weight: 600;
          }
    
          p {
            color: #2d2d2d;
          }
    
          strong {
            color: black;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Dear ${firstName},</p>
          <h2>New Poll Created!</h2>
          <p>
            A new poll has been created, and we invite you to participate by giving
            your vote.
          </p>
    
          <p>Poll Question: <strong>${question}</strong></p>
    
          <p>To vote, Open The App:</p>
    
          <p>Thank you for your participation!</p>
    
          <p>Best regards,<br />VotingApp API, Developed by <b> Atul Verma</b></p>
        </div>
      </body>
    </html>
    `;
};

export default newPollCreatedTemplate;
