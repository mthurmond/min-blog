
# p1
Add edit button to each post page
Add delete button to each post page
Add trix back in for entering post body, and display trix content if possible

# Backlog
Only allow admin to see post create/update/delete buttons
    Can maybe use admin parameter in route and pug if/then statement to show button if it exists 
Combine edit and form views to keep code dry

Hook up config file for running db since that seems to be the standard
Style delete modal 
Auto-run seeder when db syncs so don’t have to do it manually in terminal
If post not found, show not found error on error page.


Streamline heroku publishing and CI/CD workflow
    Can set node modules to be cached
    https://help.heroku.com/ZIUXB1QL/why-isn-t-my-build-using-the-cached-node-modules
    Check file tense
    Add app name next time i run command
    Since node modules are in git ignore file, this could throw it off
    See if i can have it on a permanent link of some kind
    Maybe setup some type of staging enviro on heroku that doesn’t have to reload the node modules everytime. Or even better, make changes auto-propogate. 
    Probably should do this using github to heroku to since i can review code changes on github and see that github code matches local machine code