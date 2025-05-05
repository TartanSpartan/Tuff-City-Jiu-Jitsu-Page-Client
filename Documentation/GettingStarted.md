# Getting Started

## System Dependencies

The client uses React v17.0.2 and Node v23.6.0, with npm v10.9.2. The React client, the Postgres database and the Rails API platforms can easily run on the same development machine using a fairly standard setup. However I test my network configuration by deploying each on different machines (the Postgres instance is on Docker and I may also dockerize the other two in production mode) using a Nginx reverse proxy configuration. 

## Configuration: Development Mode (Multiple Machines)

* Clone the repository to your local machine e.g. via `git clone git@github.com:TartanSpartan/Tuff-City-Jiu-Jitsu-Page-Client.git`

* Please refer to the [.env.example](.env.example) here, and the credentials.yml.example in the Rails repository for a general view of the required environment variables should you wish to duplicate my exact setup

* For some of the commands and directories below I assume a Debian/Ubuntu type of OS, please modify accordingly for your OS of choice

* After installing nginx, you will want to edit the `/etc/nginx/sites-enabled/default` file on each respective machine for the client and API; the client is described below, and see information about the API's configuration [here](https://github.com/TartanSpartan/Tuff-City-Jiu-Jitsu-Page-API/tree/main/Documentation/GettingStarted.md)

* The client serves a URL (e.g. https://myurl.org) on a private tailnet (you must set this up for yourself, e.g. via Headscale or Tailscale) as a proxy_pass for the server running on local IP address e.g. http://127.0.0.1:5500, defined as the first location entry `/`

* Routes defined specifically for the client e.g. to create a new waiver will go along the lines of https://myurl.org/waiver/new#/ and can easily be navigated to as one might expect via the top navbar

* The second location entry `/api` uses a proxy_pass to the API which serves over https, and likewise via another node on the same tailnet (i.e. abstracting a connection to another machine as a private URL)

* This will permit the standard api/v1/ Rails routes the project defines to be accessed via e.g. https://myurl.org/api/v1/belts/ allowing you to inspect the JSON sets for each

* While your browser will probably navigate by default to localhost:5500/#/ when the client server starts, redirect it instead to the client URL on the tailnet (e.g. https://myurl.org) for intended functionality

* If you ever have issues refreshing the page after a new start of the client server (perhaps after that computer restarts after downtime) then run `sudo systemctl restart nginx` and that should permit a refresh to go ahead

* If you are running the full stack on the same machine, run the React server in one terminal and the Rails server in another and follow the instructions below (which also apply for initial installation of dependencies for the multiple machines scenario)

## Initial Setup: Running It Locally

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Run 

### `npm install`

to pull in the required node dependencies, and 

### `npm install [package-name]`

to install a particular package.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode on the default port of 5500 (as set in package.json).
Open [http://localhost:5500](http://localhost:5500) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

Look here to cover (production builds and further information)(ProductionBuildsAndFurtherInformation.md).