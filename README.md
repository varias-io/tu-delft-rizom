# Rizom - Transactive Memory System scores for Slack
This Slack app has been created to make it easier for teams to gauge their wellbeing using TMS (transactive memory system) scores. The app allows users to create TMS surveys for channels within their Slack workspace.

# Features

This section describes the pieces of functionality that the app offers. All of this can be found on the homepage of the app, unless specified otherwise

## Creating surveys

The user can choose a channel, and click the "Create Survey" button. The available channels are those public channels in the workspace that the user is a member of. A new survey will be created, the participants will be the users who are in the selected channel.

If the user tries to create a survey with no channel selected, a warning will be shown.

A message will be sent to the relevant channel with a button that lets users fill out the latest survey.

## List of surveys

The surveys that the user is a part of are visible on the homepage.

They are grouped by channels such that for any group of channels, only the latest one is displayed. The groups are ordered alphabetically.

For each survey displayed, there is a button that, when pressed, displays a line chart showing the progress of each aspect of TMS as well as the overall score, over the course of the surveys done in this channel.

For every survey displayed, the channel and the starting date are clearly visible. The TMS score is also visible, with a radar chart showing the different aspects of TMS after clicking a button. The number of people eligible to fill out and the number of people who have completed the survey are shown. The user's own progress within the 15 questions of the survey are also displayed.

TODO: There is a "View Participation" button, which, when pressed, displays a list of the users eligible to fill in the survey, with indication of each user's progress.

TODO: The TMS score (and breakdown), participation ratio and "View Participation" button are only shown if any of the following cases applies:
 - The user is the creator of the survey
 - The participation of the survey is over 80%

## Filling out surveys

Each survey displayed on the homepage that hasn't been completed by the user has a "Fill in Survey" button, which leads to a series of modal elements popping up, each containing a single question for the survey.

The question modal contains the number of the question, the question itself, and the aspect of TMS the question belongs to. It also displays the channel the survey is associated with. Beside the "X" and "Close" buttons which simply close the modal (not saving the answer given to the current question), there is also a green "Next" button (or "Submit" for the last question), which saves the answer given to the current question and displays the modal for the next question (or closes the modal for the last question).

If anything causes the modal to close ("X" button, "Close" button or "Submit" button), the homepage is refreshed to reflect the current state of the system.

Once the user has answered a question for a given survey, it cannot be changed anymore. Of course, a different answer can be given in a different survey.

TODO: After clicking the "Fill in Survey" button, regardless of what question is coming up, the first modal displayed is a warning that each answer given is final for the given survey. After confirming, the user is taken to the relevant question.

# Contribution

If you'd like to contribute to this project, you can find out how in the following section

## Dependencies

The project relies on a couple of technologies which are not contained in this repository, they are:
- Node.js and npm
- Docker
Please make sure these are installed on your machine when you start working. Docker also needs to be running in order for the application to start properly.

## Creating a Slack App

To have a dummy app that you can use for development, you need to create one. Since it utilizes keys and tokens that are arguably private, we decided not to share these over Git, and so it is easiest if every developer has their own set of these.

Navigate to [this page](api.slack.com/apps/new) and click "Create New App". If it prompts for a configuration, just select "From scratch". Name the app, choose a workspace safe for experiments, and click "Create App".

You should be redirected to the dashboard of your new app. Look to the left: this menu helps you find the settings you're looking for. Let's set this up!

First, you need to give your app certain permissions (scopes) within the workspace. To do this, go to **Features > OAuth & Permissions**. Navigate to the **Scopes** section, the **Bot Token Scopes** subsection, and click "Add an OAuth Scope". Now you can add permissions, let's add the following ones:

- channels:history
- channels:join
- channels:read
- chat:write
- commands
- im:history
- im:read
- im:write
- mpim:history
- mpim:read
- mpim:write
- users:read

You should also go to **Features > App Home** and make sure "Home Tab" and "Messages Tab" are turned on.

Now you can scroll up and click the "Install to Workspace" button, and click "Allow". Congrats, now an app that you created exists in your workspace! But how do you connect it to your functionality?

As explained earlier, you will have to use those keys and tokens. More specifically, you need to copy the ".env.example" file and create the ".env" file in the same directory. Don't worry, it is git-ignored so your keys won't be leaked. But where do you find the appropriate values?

Some of them are on your app dashboard:

- *SLACK_BOT_TOKEN*: **Features > OAuth & Permissions** > OAuth Tokens for Your Workspace > Bot User OAuth Token
- *SLACK_SIGNING_SECRET*:  **Settings > Basic Information** > App Credentials > Signing Secret
- *SLACK_CLIENT_ID*:  **Settings > Basic Information** > App Credentials > Client ID
- *SLACK_CLIENT_ID*:  **Settings > Basic Information** > App Credentials > Client ID

Some of them are database-specific, but the settings we went with are:

- *DB_USER*: postgres
- *DB_PASSWORD*: password
- *DB_NAME*: rizzom
- *DATABASE_URL*: just change the formatted variables (e.g. *$DB_USER*) to the values given to those fields

We'll get back to the remaining field (*ENDPOINT*) later.

## Setting up the development environment

After cloning the repository, please enter the "Super Sigma App" directory:
```sh
cd "Super Sigma App"
```
First, you need to make sure that all npm packages are up to date. To do this, run:
```sh
npm i
```
Now you need to generate the database with the correct structure. Please keep in mind that you will need to this every time you're trying to run the app with a different database structure (i.e. a different set of migrations) than the last one you used. We set up a simple script for this:
```sh
npm run migration:run
```
You can use DataGrip or any similar database manager to check whether it worked. You should see some appropriate tables under "public", like "survey" and "channel".

## Responding to requests

The way that the Slack API generally works is the following: on user interaction (if the app is set to listen to the given event), the API sends an POST request to a certain URL, the URL that the application is listening to. By default, it is just port 9000 (or whatever is specified in .env) of the machine that is running the source code.

To make this URL accessible, you can use a service like [ngrok](https://ngrok.com/docs/getting-started/) or [nginx](https://docs.nginx.com/). If you work at Varias, ask Kacper about the reverse proxy system he set up for this project, you should be able to get a constant, custom URL to use.

Got the link? Great. From now on, it will be referred to as *[your URL]*.

Start by setting the *ENDPOINT* variable in .env to *[your URL]*.

There are a couple places on your dashboard as well where you will need to input this URL, with some alterations.

Before you do anything, make sure your app is running:
```sh
npm run start:dev
```
Also make sure that it is accessible from *[your URL]*. You can check this by sending a GET request to it through your browser (or Curl/Postman if you're feeling fancy). If you get a 404, you're all set!

Now let's let your app know what URL it should send its POST requests to! Go to your dashboard and set the following things:

1. **Features > Interactivity & Shortcuts** - Turn on "Interactivity" and set the Request URL to *[your URL]*/slack/events.
2. **Features > OAuth & Permissions** - Set "Redirect URLs" to *[your URL]*/auth/callback.
3. **Features > Event Subscriptions** - Turn on "Enable Events" and set the Request URL to *[your URL]*/slack/events. Go to "Subscribe to bot events" and add the following bot user events:
    - app_home_opened
    - message.channels
    - message.groups
    - message.im
    - message.mpim
4. **Settings > Manage Distribution** - Click the "Add to Slack" button in "Share Your App with Your Workspace". Click "Allow". It should take you to a page specified in src/utils/appSetup.ts (It is currently a very popular music video from the 80's.)

You should now have the app respond to requests! Go to its home page in your Slack workspace and try interacting with it!

## The structure of the source code

This section goes through all of the directories in our src folder, describes their purpose and how you should add functionality.

### **assets**

This directory is for temporarily storing images displayed to the user. Right now, these images are limited to the charts displaying the TMS scores.

### **components**

Our frontend is built up from JSX-like components. This directory contains the non-top-level components that can be used *within* a view to display something to the user.

### **entities**

This directory contains the entities used by TypeORM and for the database structure. If you change something here, please run 
```sh
npm run migration:generate
```
to generate a migration (into the **migrations** directory) and
```sh
npm run migration:run
```
to restructure your database based on the changes. You might run into some issues if you have stuff saved in your database, in this case drop all your tables and run 
```sh
npm run migration:run
```
again.

### **events**

This directory contains the handlers for the various events, actions and commands that our app is listening to. If you create a new file, make sure to export it in events/index.ts in a similar way to the already existing ones.

### **migrations**

This is where the migrations for creating the database structure are stored. For further explanation, see the section on **entities** above.

### **pages**

Our frontend is built up from JSX-like components. This directory contains the top-level components that can be used as a view to display something to the user, namely modals and home pages.

### **seeding**

During development, you may find it useful to fill the database with dummy data to manually test some piece of functionality. This directory contains the source files for this.

### **test**

This directory contains the automated tests for the project.

### **utils**

There are pieces of functionality that are reusable and/or are built upon calls to the Slack API or the database. These functions can be found in **utils**. If you create a new file, make sure to export it in utils/index.ts in a similar way to the already existing ones.