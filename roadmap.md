# p1
add trix for rich text support 
- add editor to edit form, done
- add trix editor to create form, done
- store trix info, done
- display trix info in post view, done
- accurately display post snippets in home view, in process
    - initally updated shortBody model method to try to convert html to text. this is ok but some issues (including nsbs, and removing spaces). i might want to either improve the conversion function, or find another way, like storing text and html or something, and pulling from body text field in db for the snippet. 
- reference: https://github.com/basecamp/trix

add cancel button on edit post screen (and new post screen if needed), with warning dialog if info has been typed

- publish this on domain
    - have admin view for CRUD, and user view for just Read
    - get domain
    - move all this to private github repo (make public once all code is clean and security is there)
    - update it on heroku and put behind the domain

# Backlog
Save info when i'm editing or creating a new post
Remove potential for sql inject with how i store and display trix as raw html
Only allow admin to see post create/update/delete buttons
    Can maybe use admin parameter in route and pug if/then statement to show button if it exists 
Combine edit and form views to keep code dry
ensure header avatar and name is centered on homepage and post page

Hook up config file for running db since that seems to be the standard
Style delete modal 
Auto-run seeder when db syncs so don’t have to do it manually in terminal
If post not found, show not found error on error page.
Make page title dynamic depending on route/post
Make urls show post title in place of post id


Streamline heroku publishing and CI/CD workflow
    Can set node modules to be cached
    https://help.heroku.com/ZIUXB1QL/why-isn-t-my-build-using-the-cached-node-modules
    Check file tense
    Add app name next time i run command
    Since node modules are in git ignore file, this could throw it off
    See if i can have it on a permanent link of some kind
    Maybe setup some type of staging enviro on heroku that doesn’t have to reload the node modules everytime. Or even better, make changes auto-propogate. 
    Probably should do this using github to heroku to since i can review code changes on github and see that github code matches local machine code