import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col"
import facebook from '../img/facebook.png';
import {
  Box,
  FooterLink,
  Heading,
} from "./FooterStyles";
import { InstagramEmbed } from 'react-social-media-embed';



  
const Footer = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}></div>
        <Box style={{ background: "gray", width: "100%", marginBottom: "-10rem" }}>
          <Row style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="class-name"></div>
          <span className='line' ></span>
            <h1 className="grabber" style={{ paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "4rem" }}>
              Instagram
            </h1>
            <span className='line'></span>
          </Row>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <InstagramEmbed url="https://www.instagram.com/p/CswWk5QJUr4/" width={328} />
        </div>
        {/* This is all well and good for a hardcoded IG post, but do we want a full feed? What about reels? See what the team think. */}
        </Box>
    <Box style={{ width: "100%" }}>
      <h1 style={{ color: "orange", textAlign: "center", marginTop: "-40px" }}>
        Tuff City Jiu Jitsu Club: Teaching practical self defence in Tofino
      </h1>
      <br />
      <div style={{ paddingLeft: "50px" }}>
        <Container fluid>
          <Row xs={1} md={4}>
            {/* <Col xs={{ span: 2, offset: 1 }} md={{ span: 2, offset: 1 }} lg={{ span: 3, offset: 1 }}> */}
            <Col>
              <Heading>Contact Us</Heading>
              <FooterLink href="mailto:tuffcityjitsu@gmail.com ">
                Club Email
              </FooterLink>
              <br />
              <br />
              <FooterLink href="https://t.me/TartanSpartan">Seumas</FooterLink>
              <br />
              <br />
              <FooterLink href="https://github.com/TartanSpartan">
                <span role="img" aria-label="Point Up">
                  &#9757;
                </span>{" "}
                I also designed this website and if anyone is interested e.g. in
                moving between Jiu Jitsu countries, I would be happy to discuss
                my work{" "}
                <br />
                <br />
              </FooterLink>
            </Col>
            {/* <Col xs={{ span: 2, offset: 1 }} md={{ span: 2, offset: 1 }} lg={{ span: 3, offset: 1 }}> */}
            <Col>
              <Heading>
                Facebook
                {/* Try and get scalable logos, in line with the text, with no background colour */}
                {/* <img src={facebook} alt="facebook" className="photo"></img> */}
              </Heading>
              <FooterLink href="https://www.facebook.com/tuffcityjiujitsu">
                <span>Tuff City Jiu Jitsu</span>
              </FooterLink>
              <br />
              <br />
              <FooterLink href="https://www.facebook.com/JitsuCanada">
                <span>Jitsu Canada</span>
              </FooterLink>
              <br />
              <br />
              <FooterLink href="https://www.facebook.com/groups/2406409734">
                <span>The Jiu Jitsu Foundation (UK style)</span>
                <br />
                <br />
              </FooterLink>
            </Col>
            {/* <Col xs={{ span: 2, offset: 1 }} md={{ span: 2, offset: 1 }} lg={{ span: 3, offset: 1 }}> */}
            {/* <Col style={{ maxWidth: "500px"}}> */}
            <Col>
              <Heading>Instagram</Heading>
              <FooterLink href="https://www.instagram.com/tuffcityjiujitsu">
                <span>Tuff City Jiu Jitsu</span>
              </FooterLink>
              <br />
              <br />
              {/* Any other Insta or socials to share? */}
              <FooterLink href="https://www.instagram.com/jitsucanada">
                <span>Jitsu Canada</span>
              </FooterLink>
              <br />
              <br />
              <FooterLink href="https://www.instagram.com/jiu_jitsu_foundation">
                <span>The Jiu Jitsu Foundation</span>
                <br />
                <br />
              </FooterLink>
            </Col>

            <Col>
              <Heading>Other Websites</Heading>
              <FooterLink href="https://jitsucanada.org/">
                <span>Jitsu Canada</span>
              </FooterLink>
              <br />
              <br />
              <FooterLink href="https://www.jitsufoundation.org/">
                <span>The Jiu Jitsu Foundation</span>
              </FooterLink>
              <br />
              <br />
              {/* Check if we should use newer link to JNZ, or both, or what? */}
              <FooterLink href="https://jitsunz.weebly.com/">
                <span>Jitsu New Zealand</span>
              </FooterLink>
            </Col>
            {/* <Col xs={{ span: 2, offset: 1 }} md={{ span: 2, offset: 1 }} lg={{ span: 3, offset: 1 }}> */}
          </Row>
          <Row>
          </Row>
        </Container>
      </div>
      <br />
      <br />
      <br />
      <h1 style={{ color: "orange", textAlign: "center", marginTop: "-40px" }}>
      <hr />

      </h1>
      <hr />
      <div className="horizontal-line" style={{ borderTop: "1px solid white"}}></div>
      <br />
      <br />
      <br />
      <br />
      <h1 style={{ color: "orange", textAlign: "center", marginTop: "-40px" }}>
      We are situated on the traditional, ancestral and unceded territory of the Tla-o-qui-aht First Nation,<br />
and we wish to acknowledge and recognize the lands on which we stand and share.
      </h1>
    </Box>
    </div>
  );
};
export default Footer;