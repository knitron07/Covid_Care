Covid-Care

| Project | Link |
| ------ | ------ |
| Website |   https://serene-fortress-06561.herokuapp.com/
| Video Demo | 

## Features
- User authentication
- Password reset
- Secured Password
- Flash messages for incorrect email, password during login
- Flash messages for not password matching , password length less than 6 and not filling the required details during Signup
- Can't access any section without authentication
- Covid Tracker
- Danger Zone notifier
- Filter posts
- Covid positive patients information
- Range checker(COVID patients in the range of 500 m to 5 km)
- Email Notification for further help(nearby hospital,bed etc)
- Upload/Edit/Delete post 
- Upload images
- Comment section
- Speech to text
- Map view
- Flash Messages for every users actions
- See different States having active/recovered/confirmed cases after 5 seconds
- Share button

## Technology
- Express - fast node.js network app framework 
- MongoDB - Database
- AdminBro - An Auto-generated Admin Panel for your Node.js Application
- Connect-flash - for displaying flash messages
- Passport - authentication middleware for Node.js
- Nodemailer - sending mails
- SpeechRecognition - text to speech
- Multer - uploading files
- Cloudinary - uploading files(Heroku does not store your data)
- JWT - authorization using sessions
- Cookie-parser - parse cookies attached to the client request object

## Installation

It requires [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) to run.
```javascript
npm i
node app.js
```
