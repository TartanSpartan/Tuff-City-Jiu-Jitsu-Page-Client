// Try to do a console.log(return value) to find the errant "<" which is an error complained about in the browser console

function getJwt(){
  return localStorage.getItem("jwt");
}

// Determine whether to introduce authorization in headers based on JWT

// TODO: Make a uniform format for requests, following after the example of Create Waiver, for good error handling and logging of responses

export const Token = {
  create (params) {
    return fetch(
      `${process.env.REACT_APP_BASE_URL}/api/v1/tokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      }
     ).then(res => {
       if (res.status === 200) {
         return res.json();
       } else {
         return {error: "Something went wrong!"};
       }
     });
  }
}

// Handling fetch requests for sessions, users etc

export const Syllabus = {
  // Fetch one syllabus from the server
  one(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/syllabi/${id}`, {
      credentials: "include",
    }).then((res) => res.json());
  },

  // Fetch all syllabi from the server
  all(params) {
    return fetch(
      `${process.env.REACT_APP_BASE_URL}/syllabi/${params.id}/syllabi_full?user_id=${encodeURIComponent(params.user_id)}`,
      {
        credentials: "include"
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        return data;
      });
  },

  // try .then chaining (i.e. at the end), then console.log the return value, because not all of the syllabus is being returned
};

export const Video = {
  // Fetch all videos from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos`, {
      credentials: "include",
    }).then((res) => res.json());
  },

  find(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log("This is the find video response", res);
      return res.json();
    });
  },

  group(id) { // Search based on the technique_id
    return fetch (`${process.env.REACT_APP_BASE_URL}/techniques/${id}/videos`, {
      credentials: "include",
    }).then((res) => {
      console.log("This is the group search video response", res);
      return res.json();
    });
  },

  // Destroy a video
  destroy(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => res.json());
  },

  // Update a video- really to delete one country rather than the other's URL
  update(id, data){
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos/${id}`, {
      credentials: "include",
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      console.log("Are we hitting this for the video update?");
      return res.json();
    });

  },

};

export const Belt = {
  // Fetch all belts from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/belts`, {
      credentials: "include",
    }).then((res) => res.json());
  },

  find(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/belts/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log("This is the belt response", res);
      return res.json();
    });
  },

  // // Fetch one belt from the server
  // one() {
  //   return fetch(`${REACT_APP_BASE_URL}/belts`, {
  //     credentials: "include"
  //   }).then(res => res.json());
  // },
};

export const TechniqueType = {
  // Fetch all technique types from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/technique_types`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/technique_types/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },
};

export const Technique = {
  // Fetch all techniques from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques_find`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  // Create a technique
  create(params) {
    console.log("############## technique test", params);
    // Params is an object that represents a technique
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).then((res) => res.json());
  },
  // Fetch a single technique
  one(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .catch(console.error);
  },

  // Update a technique

  // Try to debug this
  update(id, params) {
    console.log("this is from request js and the technique params", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      console.log("Are we hitting this?");
      return res.json();
    });
  },

  // Destroy a technique
  destroy(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => res.json());
  },

  // Get the details of a technique so that it may be updated
  details(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());
  },
};

export const Waiver = {
  // Fetch all waivers from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers_find`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  // Create a waiver
  create(params) {
    console.log("Creating waiver with params:", params);
    // Params is an object that represents a waiver
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).then((res) => {
      if (!res.ok) {
        console.error("Failed to create waiver, status:", res.status);
        throw new Error("Failed to create waiver");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Waiver created successfully:", data);
      return data;
    })
    .catch((err) => {
      console.error("Error creating waiver:", err);
    });
  },
  // Fetch a single waiver
  one(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .catch(console.error);
  },

  // Update a waiver

  // Try to debug this
  update(id, params) {
    console.log("this is from request js and the waiver params for update", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      console.log("Response status for upadtge:", res.status)
      return res.json();
    })
    .catch(console.error);
  },

  // Destroy a waiver
  destroy(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => {
      console.log("Response status for destroy:", res.status)
      return res.json();
    })
    .catch(console.error);
  },

  // Get the details of a waiver so that it may be updated (potential feature)
  details(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      method: "GET",
      credentials: "include",
    }).then((res) => {
      console.log("Response status for details:", res.status)
      return res.json();
    })
    .catch(console.error);
  },
};

// export const Session = {
//   // Create a session
//   create(params) {
//     return fetch(`${process.env.REACT_APP_BASE_URL}/session`, {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         // "Access-Control-Allow-Origin": "*",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(params),
//     }).then((res) => res.json());
//   },

export const Session = {
  // Create a session aka, sign-in
  async create(params) {
    try {
      console.log("From requests session.create: Params being sent to the backend:", params);
      console.log("Step 2: Hitting create.Session, sending sign-in request to backend with following params:", params);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          // "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      console.log("Step 3: Received raw response from the API:", response);
      console.log("Step 3.5: Received status from the API:", response.status);
      

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      // We need to attach the response status to the data object to aid handling of it in the createSession process
      const status = response.status;
      console.log("Step 4: Parsed JSON response:", data);

      if (!response.ok) {
        console.error("Error status:", status);
        console.error("Error message:", data.error || "An unknown error occurred during session creation");
        // Now we have the data including the status for processing in createSession

        // Handle specific erros
        if (status === 404) {
          return { error: "User not found. Please check your email and try again.", status};
        } else if (status === 500) {
          return { error: "Server error. Please try again later.", status};
        } else {
        return { error: data.status || "An unexpected error occurred.", status };
       } 
      }

      // throw new Error("Network response was not ok for session.create");
      // throw new Error(errorData.error || `Sign-in failed with status code ${response.status}`);

      // const data = await response.json();
      // console.log("Parsed session data", data)

      console.log("Session response status:", status);
      console.log("Is user logged in?", data.logged_in);
      console.log("User data:", data.user);

      // if (data.status === 200) {
      //   console.log("Step 5: User signed in successfully! Unless you can't see Admin Page, in which case more debugging is required...");
      return { ...data, status };
    } catch (error) {
      console.error("Session creation error: ", error.message);
      // throw error; // By re-throwing the error we can attempt to handle it
      return { error: "Network error. Please check your connection and try again.", status: 500 };
    }
  }, 

    // Destroy a session aka, sign-out
    async destroy() {
      console.log("Step 1: Starting the session destroy process")
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/session`, {
          method: "DELETE",
          credentials: "include",
      });

      console.log("Step 2: Received response from the DELETE request:", response);


      if (!response.ok) {
        console.error("Step 3: Network response was not ok:", response.statusText);
        throw new Error("Network response was not ok for session.destroy")
      }

      const data = await response.json();
      console.log("Step 4: Session successfully destroyed. Parsed response data:", data);
      console.log("Successful sign-out upon session destruction", data);
      return data;
  
    } catch (error){
      console.error ("Step 5: Unable to destroy session due to error:", error);
      throw error;
    }
  },
};

export const User = {
  // Fetch all users from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/users`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  // Current user
  current() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/users/current`, {
      method: "GET",
      credentials: "include",
    })
    .then((res) =>{
      if (!res.ok) {
        throw new Error("Network response was not ok for current user block"); // New error handling approach for the console
      }
      // console.log("This is the res", res.json());
      return res.json(); // Otherwise the response is valid, so return it
    })
    .then((data) => {
      console.log("Current user fetched as data:", data);
      return data;
    })
    .catch((error) => {
      console.error('Error for current user fetch:', error);
      return null; // Don't return anything significant if an error is caught
  });
},

  // Create a user
  create(params) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/users`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: params }),
    }).then((res) => res.json());
  },

  // Destroy a user
  destroy(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => res.json());
  },

  // Update a user
  update(id, params) {
    console.log("this is from request js and the user params", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/users/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      // return res.json();
      return JSON.stringify(res);
    });
  },

  // Helper request to check if an email address has already been taken
  checkEmail: async (email) => {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/email_available?email=${email}`);
    const data = await response.json();
    return data.available;
  }  

};

export const InstructorQualification = {

  // Create an instructor qualification
  create(params) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ instructor_qualification: params }),
    }).then((res) => res.json());
  },

  // Fetch all instructor qualifications from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  // Update an instructor qualification
  update(id, params) {
    console.log("this is from request js and the instructor qualification params", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  },
};

export const BeltGrade = {

  // Create a belt_grade
  create(params) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ belt_grade: params }),
    }).then((res) => res.json());
  },

  // Fetch all belt_grades from the server
  getAll() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades/${id}`, {
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  // Update a belt grade
  update(id, params) {
    console.log("this is from request js and the belt_grade params", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  },
};

// console.log("This is the session", process.env.REACT_APP_BASE_URL);
