import React from "react";
import moment from "moment";

// Note: Currently this functionality is hardcoded into other pages, so adapt them to use this instead for modularity
function ShowCreatedAt(props) {
    return <small>Created at {moment(props.created_at).format("MMM Do, YYYY")}</small>;
}

export default ShowCreatedAt;