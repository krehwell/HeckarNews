# HeckarNews
Hacker News Clone. Demo: https://forum.krehwell.com/

![image of frontpage heckarnews](https://i.imgur.com/MuXTuTa.png)

## Dependecies
- [Next.Js](https://nextjs.org/): React framework for building UI
- [Algolia](https://www.algolia.com/): Search item within app
- [Mongoosejs](https://mongoosejs.com/): MongoDb for database
- [Express](https://expressjs.com/): Back-end web framework for server
- [Node-Cron](https://www.npmjs.com/package/node-cron): Cron Job for automate task 
- [Node Mailer](https://nodemailer.com/): Send email within app
- [Node Mailer Mailgun](https://www.npmjs.com/package/nodemailer-mailgun-transport): Email provider/emailAPI
- [Bcrypt](https://www.npmjs.com/package/bcrypt): Password hash
- [React-Day-Picker](https://react-day-picker.js.org/): Select range day UI for react
- etc.

## Run & Installation
- `cd` to `website/` and `rest-api/` 
- `npm run dev` on both dir to run on localhost  

Website served at :3000 and Server served at :5000

## Project Structure
```bash
HeckarNews
  |- website 
    |- ... # front-end code
  |- rest-api 
    |- ... # back-end code
```

### Website
Next.Js is the main actor for building the UI. The front-end project structure:
```bash
website 
  |-  api             # all code request from back-end
  |-  components      # Header, Footer, etc.
  |-  pages           # routes
  |-  utils           # helper functions. apiBaseUrl.js, etc.
  |-  styles          # .css files
  |-  .env.local      # api key for Algolia
  |-  next.config.js  # .env for next app
```

This directory has `.env.local` which must be set up for Algolia API key:
```.env
# .env.local
ALGOLIA_APP_ID=...
ALGOLIA_PUBLIC_API_KEY=...
```

#### Front-end Flow
Each page which needs for authentication or request is done by simply calling any related function from `./api/`.  
Ex. getting item on front page:
```javascript
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
Each function on `./api/` is already map with `./utils/apiBaseUrl.js`. So, no need to bother about API URL code when running on development or production. Just change the url on `./next.config.js` for each development environment. 

#### Page Styles
All styles is using pure CSS which can be found at `./styles/`. The directory structure for styles is more or less map to be similar like `./pages/` for ease of use while the importing of all styles is done in `./pages/_app.js`.

### Rest-API
Express is the main actor for server. The back-end project structure:
``` bash
rest-api 
  |-  middlewares  # user authentication  
  |-  models       # MongoDb models
  |-  routes       # endpoint for each request
  |-  config.js    # configuration for particular response
  |-  index.js     # server initialization
```

This directory has `.env` for MongoDb auth (URI is defined in `./index.js`), Mailgun, and Algolia API key:
``` .env
# .env
# MONGODB ID/PASS
DB_USERNAME=...
DB_PASSWORD=...

# MAILGUN API KEY
MAILGUN_API_KEY=...

# ALGOLIA SEARCH API KEY
ALGOLIA_APP_ID=...
ALGOLIA_PRIVATE_API_KEY=...
```

#### Back-end Flow
Each routes in `./routes/` is defined per-functionality use case per-route. Folder Structure for `./routes/`:
```bash
rest-api 
  |-  routes
    |-  comments
    |-  emails
    |-  items
    |-  moderation
    |-  search
    |-  users
    |-  utils.js  # helper functions which mostly used by api.js. generateUniqueId, isValidDate, etc.
  |- ...
```
In each of it, there is `api.js` and `index.js` which work by each request type in __index.js__ (GET, POST, etc.) will call API functions from __api.js__ for it to process between Db and return result back to __index.js__ to be a response later. (`./routes/search/` only has `api.js` since it does not have any route definition)

##### Defined Endpoint (`routes/[slug]/index.js`)
The purpose of `index.js` is for routes definition, accept request, call `api.js` to process, and return response to client.  
Take an example of `./routes/user/index.js` for login workflow:
```javascript
// routes/user/index.js
app.put("/users/login", async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            throw { submitError: true };
        }
        
        // Ask for validation either user exist or not from api.js
        const response = await api.loginUser(
            req.body.username,
            req.body.password
        );
        
        ...
        res.cookie(...);
        
        // if everything goes fine then just response 
        res.json({ success: true });
    } catch (error) {
        if (!(error instanceof Error)) {
            // catch any known error thrown, such: credentialError, bannedError.
            res.json(error);
        } else {
            // any unknown error will be responsed as submitError.
            res.json({ submitError: true });
        }
    }
});
```
There is no callback in server code. All of them are using _async/await_ style. By using so, it is easier for server to catch any error and simply response to front-end with a reasonable message instead of returning the error itself. In the client side, it just has to check for this message for validation, ex:
- Res: { success: true } ➞ user is logged in,
- Res: { credentialError: true } ➞ username is not registered, or.
- Res: { bannedError: true } ➞ user has been banned, etc.

##### API (`routes/[slug]/api.js`)
API is solely for the bridge between Db and Server. All actions containing relation between them will be processed here. API will call DB and do checkers/validation within it. If everything is fine it will **return object** while if something is bad it will **throw object**.
The error thrown will be catch in `index.js` to be responsed later for client.  
Take an example of `./routes/user/api.js` for login API:
```javascript
// routes/user/api.js
module.exports = {
    loginUser: async (username, password) => {
        const user = await UserModel.findOne({ username }).exec();

        // if user not exist, throw credential error
        if (!user) {
            throw { credentialError: true };
        }

        // if pass is not correct, throw credential error
        const passwordIsMatch = await user.comparePassword(password);
        if (!passwordIsMatch) {
            throw { credentialError: true };
        }
        
        // if user is banned, throw banned error
        if (user.banned) {
            throw { bannedError: true };
        }

        // if everything is going fine, return 
        return {
            success: true,
            username: user.username,
            ...
        };
    },
}
```

#### Models
All models are basic MongoDb model. Except for user, it has a special middleware `UserSchema.pre` and extension method `UserSchema.methods.comparePassword`.
Middleware used for user is `.pre("save", ...)` action, it will hash the password using bcrypt before actually saving it to cloud.


## Credit
Thanks to internet. This project can be freely used without needing to be wised.  
This repository is under [GPL (Giant Penis License)](http://giant-penis-license.org/).  
  
Initially about to make a porn forum but turned out to be this instead.
