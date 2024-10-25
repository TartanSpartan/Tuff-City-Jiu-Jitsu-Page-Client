import React, { Component } from 'react';
import * as d3 from "d3";
// import Tree from 'react-d3-tree';
// That dep seems to be breaking, reassess when it comes time to actually complete the mindmap component

// This is a simplified example of an org chart with a depth of 2.
// Note how deeper levels are defined recursively via the `children` property.
const orgChart = {
    name: 'CEO',
    children: [
      {
        name: 'Manager',
        attributes: {
          department: 'Production',
        },
        children: [
          {
            name: 'Foreman',
            attributes: {
              department: 'Fabrication',
            },
            children: [
              {
                name: 'Worker',
              },
            ],
          },
          {
            name: 'Foreman',
            attributes: {
              department: 'Assembly',
            },
            children: [
              {
                name: 'Worker',
              },
            ],
          },
        ],
      },
    ],
  };

// class SyllabusMindmapPage extends Component {
    
// }

// export default SyllabusMindmapPage;

// export default function SyllabusMindmapPage() {
//     return (
//       // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
//       <div id="treeWrapper" style={{ width: '50em', height: '20em' }}>
//         <Tree data={orgChart} />
//       </div>
//     );
//   }