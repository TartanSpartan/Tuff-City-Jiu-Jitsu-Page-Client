// Need admin/authentication working to have this functional
// Page of forms to modify waiver and user attributes e.g. belt grades

import React from "react";
import { User, BeltGrade, Waiver } from "../requests";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "../App.scss";
import AdminForm from "./AdminForm";

// We use this function to create a dynamic drop down list based on, for example, the users!
function createSelectUserItems(users) { // TODO 1: Rewrite this to ensure it functions for both users and waivers
  console.log("These are the users", users);
  // console.log("These are the waivers", waivers);

  let items = [];
  for (let i = 0; i < users.length; i++) {
    items.push(
      <option key={i} data-set={`${users[i]}`} value={i}>
        {users[i].id + " " + users[i].first_name + " " + users[i].last_name}
      </option>
    );
  }
  console.log("Testing createSelectUserItems", items);
  console.log("This is the length of items", items.length);
  return items;
}

function createSelectWaiverItems(waivers) { 
  console.log("These are the waivers", waivers);
  // console.log("These are the waivers", waivers);

  let items = [];
  for (let i = 0; i < waivers.length; i++) {
    items.push(
      <option key={i} data-set={`${waivers[i]}`} value={i}>
        {waivers[i].id + " " + waivers[i].participant_name}
      </option>
    );
  }
  console.log("Testing createSelectWaiverItems", items);
  console.log("This is the length of items", items.length);
  return items;
}


// Change instructor_qualifications from an array into an object, on the Rails side

// function AdminPage(props) {
export class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    // this.onDropdownSelected = this.onDropdownSelected.bind(this);
    this.state = {
      // user:null,
      users: [],
      dues_paid: false,
      owns_gi: false,
      has_first_aid_qualification: false,
      first_aid_achievement_date: "",
      first_aid_expiry_date: "",
      belts: [],
    //   belt_grades: [],
      instructor_qualifications: [],
      instructor_qualification_achievement_date: "",
      waivers: [],
      currentUser: null,
      isAdmin: false,
      createSelectUserItems: [],
      createSelectWaiverItems: [],
      onDropdownSelectedUsers: "",
      onDropdownSelectedWaivers: "",
    };
  }
  

  componentDidMount() {
    User.all().then((users) => {
      this.setState({
        user:null,
        users: users,
        dues_paid: users.dues_paid,
        owns_gi: users.owns_gi,
        has_first_aid_qualification: users.has_first_aid_qualification,
        first_aid_achievement_date: users.first_aid_achievement_date,
        first_aid_expiry_date: users.first_aid_expiry_date,
        createSelectUserItems: createSelectUserItems(users),
        onDropdownSelectedUsers: this.onDropdownSelectedUsers,
      });
    });

    Waiver.all().then((waivers) => {
      this.setState({
        waiver:null,
        waivers: waivers,

        // We might not need many of the following, but in case we do, here they are for now; also it may be useful to have if we need a WaiverUpdatePage
        participant_name: waivers.participant_name,
        initials: waivers.initials,
        participant_email_address: waivers.participant_email_address,
        participant_address: waivers.participant_address,
        participant_signature: waivers.participant_signature,
        organization_witness_name: waivers.organization_witness_name,
        organization_witness_signature: waivers.organization_witness_signature,
        participant_date_of_birth: waivers.participant_date_of_birth,
        participant_phone: waivers.participant_phone,
        emergency_contact_name: waivers.emergency_contact_name,
        emergency_contact_number: waivers.emergency_contact_number,
        relationship: waivers.relationship,
        email: waivers.email,
        createSelectWaiverItems: createSelectWaiverItems(waivers),
        onDropdownSelectedWaivers: this.onDropdownSelectedWaivers,
      });
    });
  }

  onDropdownSelectedUsers(e, users) { // TODO 2: Can we adapt this to work for the waiver too?
    console.log("This is the selected user", users[e.target.value]);
    // this.setState({
    //   user: users[e.target.value]
    // });
    // this.state.user = users[e.target.value];
    return users[e.target.value];
  }

  onDropdownSelectedWaivers(e, waivers) { 
    console.log("This is the selected waiver", waivers[e.target.value]);
    // this.setState({
    //   user: users[e.target.value]
    // });
    // this.state.user = users[e.target.value];
    return waivers[e.target.value];
  }

  deleteUser(id) {
    User.destroy(id).then(() => {
      this.setState({
        users: this.state.users.filter((q) => q.id !== id),
      });
    });
  }

  // Need to find a way to use the current user id in functions like this!
  updateColorBox = (event) => {
    console.log("This is the event", event.target.value);
    let user_id = this.state.user.id;

    console.log("This s the user ID", user_id);
    this.setState( (state) => {
      if(state.users.length !== 0){
        if(state.users[user_id].belt_grades.length !== 0){
          state.users[user_id].belt_grades[0].belt_id = event.target.value;
        }
      }
    });
    // this.state.users[user_id].belt_grades[0].belt_id = event.target.value;
    this.forceUpdate();
  };

  updateGiBox = (event) => {
    let user_id = this.onDropdownSelected;
    this.setState((state) => {
      // state.users[user_id].owns_gi = event.target.value;
    });
    this.forceUpdate();
  };

  updateFirstAidBox = (event) => {
    let user_id = this.onDropdownSelected;
    this.setState((state) => {
      // state.users[user_id].has_first_aid_qualification = event.target.value;
    });
    this.forceUpdate();
  };

  // updateFirstAidDate??? = (event) => {
  //   let user_id = this.onDropdownSelected;
  //   this.setState((state) => {
  //     // state.users[user_id].first_aid_achievement_date = event.target.value;
  //   });
  //   this.forceUpdate();
  // };

  updateInstructorQualificationBox = (event) => {
    let user_id = this.onDropdownSelected;
    this.setState((state) => {
      // state.users[user_id].instructor_qualification.qualification_id = event.target.value;
    });
    this.forceUpdate();
  };

  // updateInstructorQualificationsDate??? = (event) => {
  //   let user_id = this.onDropdownSelected;
  //   this.setState((state) => {
  //     // state.users[user_id].instructor_qualification.achieved_at = event.target.value;
  //   });
  //   this.forceUpdate();
  // };


  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  simpleStringify = (object) => {
    var simpleObject = {};
    for (var prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }
      if (typeof object[prop] == "object") {
        continue;
      }
      if (typeof object[prop] == "function") {
        continue;
      }
      simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
  };

  updatePostRequest = (data, id) => {
    console.log("data is at admin page ", data);
    User.update(id, data).then((user) => {
      console.log(user);
      this.props.history.push(`/admin#/`); // Expect this to refresh the page, test that
      if (user.errors) {
        this.setState({ errors: user.errors });
      } else {
        // console.log("This is the history", this.props.history)
        this.props.history.push(`/admin`);
      }
    });
  };

  render() {
    console.log("admin's state", this.state);
    console.log("This!", this);
    return (
      <main>
        <div className="central">
          <h1 style={{ marginLeft: "-1rem" }}>USER ADMIN PAGE</h1>
        </div>
        <br />
        {
          <AdminForm
            users={this.state.users}
            waivers={this.state.waivers}
            history={this.props.history}
            errors={this.state.errors}
            key={this.state.id}
            onSubmit={this.updatePostRequest}
            onDropdownSelectedUsers={this.onDropdownSelectedUsers}
            onDropdownSelectedWaivers={this.onDropdownSelectedWaivers}
            createSelectUserItems={this.state.createSelectUserItems}
            createSelectWaiverItems={this.state.createSelectWaiverItems}
            changeSelectColorHandler={this.updateColorBox.bind(this)}
          />
        }
      </main>
    );
  }
}