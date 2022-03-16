# p1
implement admin and user views 
- v0: add admin table in db, create record for me as admin (both via sqlite3 shell)
    - create model for the users table, then create form that allows me to create a user
    - 
    - learn to work w/ sequelize shell, or sqlite shell (create table and record)
    - then stop db from dropping each time server reloads
    - add login form behind /admin route
    - when admin logged in, create session and store user id
    - pass logged in variable to view to show/hide buttons
    - create middleware for /create, /edit, /destroy get and post routes to throws error "must be logged in as admin" if they're visited and user not logged in (i.e. no session or session id)

- v1: user doesn't see create button, or edit/delete buttons but admin does
    - first complete detailed express auth example: https://teamtreehouse.com/library/rest-api-authentication-with-express
    - can consider this one instead too: https://teamtreehouse.com/library/user-authentication-with-express-and-mongo
    - then use some of this knowledge to create the simpler version outlined below. 

v1 user authentication & authorization details
- admin goes to /admin, enters pw, then is authenticated. 
- after that, admin authorized to view create/edit/delete buttons on index and post pages, the create/edit and delete forms, and can execute those forms (i.e. execute post/destroy routes)
- will need conditional logic on
    - pug templates for index and post to only show buttons if user auth'd as admin
    - routes for viewing forms and posting/deleting data, so only user auth'd as admin can see/do these things


publish this to private github repo 
update it on heroku, ideally by pushing to github repo, and publish to domain

# p2
pass in title as parameter to each route so user can see correct page titles (home, create post, delete post, etc)
add cancel button on edit post screen (and new post screen if needed), with warning dialog if info has been typed
Save info when i'm editing or creating a new post
ensure header avatar and name is centered on homepage and post page

# backlog
Remove potential for sql inject with how i store and display trix as raw html
Combine edit and form views to keep code dry

Hook up config file for running db since that seems to be the standard
Style delete modal 
Auto-run seeder when db syncs so don’t have to do it manually in terminal
If post not found, show not found error on error page.
Make urls show post title in place of post id
Make page title dynamic depending on route/post


Streamline heroku publishing and CI/CD workflow
    Can set node modules to be cached
    https://help.heroku.com/ZIUXB1QL/why-isn-t-my-build-using-the-cached-node-modules
    Check file tense
    Add app name next time i run command
    Since node modules are in git ignore file, this could throw it off
    See if i can have it on a permanent link of some kind
    Maybe setup some type of staging enviro on heroku that doesn’t have to reload the node modules everytime. Or even better, make changes auto-propogate. 
    Probably should do this using github to heroku to since i can review code changes on github and see that github code matches local machine code