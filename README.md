# HeckarNews
Hacker News Clone. Demo: https://heckarnews.herokuapp.com/

![image of frontpage heckarnews](https://i.imgur.com/MuXTuTa.png)

## Dependecies
- [Next.Js](https://nextjs.org/): React framework for building UI
- [Algolia](https://www.algolia.com/): Search item within app
- [mongoosejs](https://mongoosejs.com/): MongoDB for database
- [Express](https://expressjs.com/): Back-end web framework for server
- [Node-Cron](https://www.npmjs.com/package/node-cron): Cron Job for automate task 
- [Node Mailer](https://nodemailer.com/): Send email within app
- [Node Mailer Mailgun](https://www.npmjs.com/package/nodemailer-mailgun-transport): Email provider/emailAPI
- [React-Day-Picker](https://react-day-picker.js.org/): Select range day UI for react
- [Bcrypt](https://www.npmjs.com/package/bcrypt): Hash password for safety
- etc.

## Project Structure
```bash
HeckarNews
  |- website 
    |- ... # front-end code
  |- rest-api 
    |- ... # back-end code
```

### Website
Next.Js is the main actor for building the UI. The front-end project structure is
```bash
website 
  |- api  # all code request from back-end
  |- components  # Header, Footer, etc.
  |- pages  # routes
  |- utils  # helper functions. apibaseurl.js, etc.
```

This directory has `.env.local` which must set up for Algolia API key:
```
ALGOLIA_APP_ID=...
ALGOLIA_PUBLIC_API_KEY=...
```

#### Front-end Flow
Each page which needs for authentication or request on each page is done by simply calling any related function from `./api/`.
ex:  
getting item on front page
``` javascript
// page/index.js
import getRankedItemsByPage from "../api/items/getRankedItemsByPage.js"; /* GET ITEM API */ 

export default function Index({ items, authUserData, ... }) {
    ...
}

export async function getServerSideProps({ req, query }) {
    const page = 1;
    const apiResult = await getRankedItemsByPage(page, req);
    
    return {
        props: {
            items: (apiResult && apiResult.items) || [],
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            ...
        },
    };
}
```
