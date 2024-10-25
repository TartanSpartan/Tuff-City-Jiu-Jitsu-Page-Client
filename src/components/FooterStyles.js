import styled from 'styled-components';
   
export const Box = styled.div`
position: relative;
padding-top: 10rem;
//  5rem;
bottom: 0;
margin: 10rem auto 0 auto;
width: 80%;
background: black;

margin: 10rem auto 0 auto;
  
   
  @media (max-width: 1000px) {
    padding: 50px 30px;
  }
`;
   
export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 1000px;
    margin: 0 auto;
    /* background: red; */
`
   
export const Column = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-left: -4rem;
  padding-left: 10rem;
`;
   
export const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 
                         minmax(185px, 1fr));
  grid-gap: 30px;
   
  @media (max-width: 1000px) {
    grid-template-columns: repeat(auto-fill, 
                           minmax(200px, 1fr));
                      
  }
`;
   
export const FooterLink = styled.a`
  color: #fff;
  margin-bottom: 20px;
  font-size: 18px;
  text-decoration: none;
  text-transform: uppercase;

  &:hover {
      color: green;
      transition: 200ms ease-in;
  }
`;
   
export const Heading = styled.p`
  font-size: 24px;
  color: #fff;
  margin-bottom: 40px;
  padding-right: -10rem;
  font-weight: bold;
  text-transform: uppercase;
`;