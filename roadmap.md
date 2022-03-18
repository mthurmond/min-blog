# p1
publish this to private github repo 
- remove all sensitive info from this code before i push it
    - store session secret secrets file. it's in app.js now. 
    - read this: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
update it on heroku, ideally by pushing to github repo, and publish to domain



# p2
figure out why treehouse course set session user id to user id in db. do this if i need to do it. 
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