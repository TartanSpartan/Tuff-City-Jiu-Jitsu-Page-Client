// Note: this page has been retooled into SyllabusShowPage.js. So this page will be deactivated for now then later retooled into an index of syllabi e.g. UK 2011, 2021, Canada 2018 etc.

import React, {useState} from 'react';
import { Technique, TechniqueType, Syllabus, Belt } from '../requests';
import moment from "moment";
import Belts from "./Belts";
import Button from "react-bootstrap/Button";
import { Nav } from 'react-bootstrap'
import "../App.scss";


export class SyllabusIndexPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        // Populate the list of techniques through fetching them from the server and allow the page to load
        techniques: [],
        technique_types: [],
        belts : [],
        belts_group : [],
        rendered_techniques : [],
        rendered_technique_types : [],
        formatted_techniques : [],
        isLoading: true

      };
    }

    componentDidMount() {
      Belt.all().then(belts => {
        this.setState({
          belts: belts,
        });
      });



        Technique.find().then(techniques => {
          this.setState({
            rendered_techniques: [...techniques],
          })
      });
      
      TechniqueType.find().then(technique_types => {
        let result = [];
        result = technique_types.reduce(function (r, a) {
          r[a.belt_id] = r[a.belt_id] || [];
          r[a.belt_id].push(a);
          return r;
      }, Object.create(null))

      console.log("This is the result", result);
      console.log("Final result", Object.values(result))

        this.setState({
          beltColors: result,
          result: Object.values(result),
          rendered_technique_types: 
          technique_types.sort((belt1, belt2) => belt2.belt_id - belt1.belt_id),
          isLoading: false
        })
        this.state.result.map(item => {
          item.map(element => {
            console.log("this is the element", element.belt_id)
          })
        })
    });
    console.log("anything")
  }
      
    deleteTechnique(id) {
        Technique.destroy(id).then(() => {
            this.setState({
            techniques: this.state.techniques.filter(q => q.id !== id)
            });
        });

    }

    string_to_array = function (str) {
      return str.trim().split(" ");
 };

    render() {
        const currentUser = this.props.currentUser;
        const { showAll = false} = this.props;
        
        const filteredTechnique = showAll ? this.state.techniques : this.state.techniques.filter((t, i) => i < 400);
        let previousBeltId = 0;
        let previousTechniqueTypeId = 0;
        let technique_types_array = [];
        console.log("these are the rendered technique types", this.state.rendered_technique_types)

        return (
            <main className="SyllabusIndexPage">
                <br />
                <div className="central">
                <h2 style={{display: "flex", justifyContent:'center'}}>SYLLABUS</h2>
                <br />


                {this.state.result && this.state.result.reverse().map((item, i) => { // Reverse causes it to sort the list from yellow to brown, scrolling down
                  return(
                    <Belts item={item} key={i} />
                  )
                  })}     


                </div>
                <br />
                    <div
                        className="ui list"
                        style={{
                            listStyle: "none",
                            paddingLeft: 0
                        }}
                        >
                        {filteredTechnique.map(technique => {
                          {console.log(technique)}
                            <li className="ui segment" key={technique.id}></li>
                            return(
                                <>
                            {this.state.belts.map(belt => {
                             if(belt.id === technique.belt_id) // Here we need to match the main belt.id with the technique.belt_id which has many different values based on which technique it is
                              if(belt.id === 3){ // Special case for light blue belt with "rd" as a suffix
                                // Store previous belt id (define it first) and only put a new header up if and when the belt id changes for the next colour.
                                if(previousBeltId !== belt.id){
                                  previousBeltId = belt.id;
                                return(
                                  <>
                                  <option className="gradecoloroption" style={{backgroundColor:"lightblue", pointerEvents:"none"}}>3rd kyu (Light Blue) </option>
                                  </>
                                )}}
                              else if(belt.id === 2){ // Special case for dark blue belt with "nd" as a suffix
                                if(previousBeltId !== belt.id){
                                  previousBeltId = belt.id;
                                return(
                                  <>
                                  <option className="gradecoloroption" style={{backgroundColor:"#00008b", color:"white", pointerEvents:"none"}}>2nd kyu (Dark Blue) </option>
                                  </>
                                )}}

                              else if(belt.id === 1){ // Special case for brown belt with "st" as a suffix
                                if(previousBeltId !== belt.id){
                                  previousBeltId = belt.id;
                                return(
                                  <>
                                  <option className="gradecoloroption" style={{backgroundColor:belt.colour, pointerEvents:"none"}}>{belt.id + "st kyu (" + belt.colour.charAt(0).toUpperCase() + belt.colour.slice(1) + ")"} </option>
                                  </>
                                )}}
                              else{
                              console.log("This is the previous belt id: " + previousBeltId)
                              console.log("This is the current belt id: " + belt.id)
                                if(previousBeltId !== belt.id){
                                  previousBeltId = belt.id;
                                  return(
                                    <>
                                    <option className="gradecoloroption" style={{backgroundColor:belt.colour, pointerEvents:"none"}}>{belt.id + "th kyu (" + belt.colour.charAt(0).toUpperCase() + belt.colour.slice(1) + ")"} </option>
                                    </>
                                  )}
                              }}
                             )}
                            <br />
                            {this.state.techniques.map(technique => {
                              // Check if grouped, loop through the belts group and render each group of techniques for a belt
                             if(technique.id && technique.belt_id === previousBeltId){ 
                              const type = this.state.technique_types.filter(item => item.id === technique.technique_type_id)
                              console.log("this is the type", type)
                              console.log("This is the previous technique type id: " + previousTechniqueTypeId)
                              console.log("This is the current technique type id: " + technique.technique_type_id)
                               if(previousTechniqueTypeId !== technique.technique_type_id){ // Attempting here to only print the technique type once per belt; not currently working, but why?
                                  previousTechniqueTypeId = technique.technique_type_id;
                                  console.log("Have we achieved success?" + previousTechniqueTypeId + technique.technique_type_id)
                                  return(
                                      <>
                                        {<text style={{fontStyle:"italic"}}>{type?.length ? type[0].category : ""}</text> }
                                        <br />
                                        {type?.length ? type[0].sub_category : ""}

                              <br />
                              <Nav.Link style={{ paddingLeft: 0, paddingTop: 0 }} href={`/techniques/${technique.id}`}>{technique.summary}</Nav.Link>
                              <br />

                              {/* {technique.videos_id} */}
                              <br />
                              {technique.is_different ? (
                              <>
                              {<text style={{fontWeight:"bold"}}>What's different to the UK syllabus?</text> }
                              <br />
                              {technique.difference_content}
                              <br />
                              <br />
                              <p>Posted on {moment(technique.created_at ).format("MMM Do, YYYY")}</p>

                              </>
                              ) : (

                              <p>Posted on {moment(technique.created_at ).format("MMM Do, YYYY")}</p>
                              )}
    
                                  <Button variant="danger" type="danger" onClick={id => this.deleteTechnique(technique.id)}>
                                      Delete
                                    </Button>
                                    <br />
                                    <br />
                                    <br />

                                    </>
                               )}}
                            })}

                            </>

                            )}
                            )}
                            
                    </div>
            </main>
        );
    }
}

 {/* First fix this page and then adapt it to React Bootstrap */}