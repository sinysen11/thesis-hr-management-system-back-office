1. Install dependencies
     npm install
2. Setup environment variables
     Copy .env.example then create .env file
   
   # to generate jwt secret key please follow command below on your local terminal
     JWT_SECRET=your_jwt_secret_here
   #command
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
3. Run Project
     npm run dev

