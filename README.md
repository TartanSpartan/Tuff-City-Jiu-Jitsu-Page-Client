# README

<div align="center">
    <p style="text-align: center;">
        <h1>Tuff City Jiu Jitsu Club Website Project: React Client</h1>
    </p>
</div>

<p align="center">
    <img src="src/img/tuff_logo.jpg" width="350" title="Teaching practical self defence in westernmost Canada">
</p>

# Project Description: Renewed Development

Here is my React on Rails project to serve as a website for the Tofino "Tuff City" Jiu Jitsu Club. This website is intended to be a good resource for jiu-jitsu clubs around the world who are interested in developing support material for their training. This codebase is the React client/frontend side of it. Please also check out the server-side [Rails API](https://github.com/TartanSpartan/Tuff-City-Jiu-Jitsu-Page-API) on GitHub, which is the webserver backend for the application, running on a Postgres16 database.

There are [previous versions of the website](https://github.com/TartanSpartan/Tuff-City-Jiu-Jitsu-Webpage/tree/development), based on older gemsets in the API, but development has been resumed in these new repositories with new gems and a more focused approach. Many of the controllers, models etc still have relevant logic and have been ported over. Eventually I will also be looking to upgrade the node dependencies in this React client to a modern framework. Meanwhile the frontend aesthetics and overall functionality continues to be augmented regularly.

# Key folders and files

* Dependencies are defined in the [package.json](package.json) and [package-lock.json](package-lock.json) files

* The src/components/ folder contains each key component of the app

* [SCSS](App.scss) is used for styling. The app is not mobile-optimized yet but that will be implemented subsequently for a nice, responsive design. For the time being desktop views are prioritized

* Everything is all bound together by the App.js file

* The src/img/ folder contains several useful image assets

* [requests.js](requests.js) bridges the client to the API and database, allowing us to make several important CRUD actions on various endpoints

* To facilitate this, please ensure that the Rails server is running and accessible on your network configuration alongside the React one

* Refer to the [Rails API](https://github.com/TartanSpartan/Tuff-City-Jiu-Jitsu-Page-API) ReadMe for more information

# Roadmap for improved development, performance and deployment:

Testing frameworks along the lines of Rspec for Rails e.g. Jest or Mocha.

Third party monitoring services, perhaps Google Analytics, etc.

A full and performant implementation of production builds and deployment.

# Further information

For more information, please see the internal links below:

- [Getting Started](Documentation/GettingStarted.md)
- [Motivation and Planned Features](Documentation/MotivationAndPlannedFeatures.md)
- There are some novel features, such as:
- [Frontend Oauth implementation for Google and traditional form-based sign-in](src/components/SignInPage.js) [and sign-up](src/components/SignUpPage.js)
- [Waiver](src/components/NewWaiverForm.js) [forms with signature drawing functionality](src/components/UpdateWaiverForm.js) 