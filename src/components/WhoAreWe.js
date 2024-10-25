import React from "react";
import Card from "react-bootstrap/Card"
import CardGroup from "react-bootstrap/Card"
import Row from "react-bootstrap/Row"
import club_pic_sans_seumas_selina_in_gi from '../img/club_pic_sans_seumas_selina_in_gi.jpg'
import seumas_casual from '../img/seumas_casual.jpg'
import seumas_training from '../img/seumas_training.jpg'
import david_teaching from '../img/david_teaching.jpg'
import david_casual from '../img/david_casual.jpg'
import facebook from '../img/facebook.png'
import current_members from '../img/current_members.jpg'
import "../App.scss";



export class WhoAreWe extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
  
    render() {
      return (
        <Card style={{backgroundColor: "gray", color: "white"}}>
          <Card.Header id="capitalised-header" style={{textTransform: 'uppercase', fontSize: 30}}>Who Are We?</Card.Header>
          <br />
          {/* Ask everyone in this photo for consent to have it on the website */}
          <img src={current_members} alt="currentmembers"></img>

          <Card.Text style={{paddingLeft: 15, paddingRight: 15, fontSize: 20}} >
          <br />
<br />
            We are a Shorinji Kan Jiu Jitsu club based in Tofino, British
            Columbia, Canada! Our instructors hail from the United Kingdom
            but have come to BC to share their passion for jiu jitsu's ability
            to empower self defence within the district of Tofino. They are
            co-equals and both bring their individual experiences and
            skillsets to the table as leaders. We already have a handful of
            earnest students and can't wait to help drive them forward in
            their journey towards better and better belts. We warmly welcome
            more of the community to join the club and become confident not
            just in violent situations but more broadly in life, too. The
            COVID-19 pandemic had held us back for a while, but we came back
            swinging and are once again able to gather closely together to
            throw each other around and perform some cool locks, ground
            fighting bouts or whatever takes our fancy! Outside of the dojo,
            we are also enjoy having fun recreational and social activities
            to help underline our place as a vital component of the local
            community with the virus no longer a worry.
            </Card.Text>

              <Card.Header id="capitalised-header" style={{backgroundColor: "gray", textTransform: 'uppercase', fontSize: 30}}>Seumas Finlayson Sensei (he/him)</Card.Header>

            <CardGroup className="card-group">
              {/* style={{display: 'flex', flexDirection: 'row',}} */}
            {/* @media screen and ( max-width: 500px ) { 
     .row { flex-direction: column; }
   } */}
  {/* <Row xs={1} md={4}>               */}
  <Card style={{backgroundColor: "gray", flex: 1}}>
  <Card.Body>
    <img src={seumas_casual} alt="seumascasual" className="photo"></img>
    </Card.Body>
  </Card>

  <Card style={{backgroundColor: "gray", flex: 1, paddingRight: "5rem"}}>
    <Card.Body>
    <img src={seumas_training} alt="seumastraining" className="photo"></img>
    </Card.Body>
  </Card>
</CardGroup>
<Card.Text style={{paddingLeft: 15, paddingRight: 15, fontSize: 20}} >

<br />
<br />
Seumas started training in 2007 under Bruce Davies, Colin Armstrong
and Ian Lambert in Edinburgh, Scotland. He was drawn to the art
by its dramatic depiction in films and video games, and was
interested in learning an effective martial art when he arrived to
study physics as an undergraduate. The city's clubs were very
welcoming with a mantra of "train hard, then play hard" and the
friendships he made there specifically, then nationally and across
the globe ever since will stay with him for life. He steadily 
climbed up the grades despite a few setbacks and attained dark blue
belt by the time he had graduated. Next up was a stint training in
Reading during a Masters degree, and then in South West England for
work, serving as a "sempai" or senior mentor in these clubs. However
he was soon drawn back to his roots in Edinburgh and started
intensive training for brown belt, which he achieved in December,
2016. Since then he provided some help to teach in the city but was
aching for a chance to take up more responsibilities, and such
opportunities were hard to find in such a talent-rich and
competitive environment. Always drawn to Canada after several
memorable training tours, he connected with David and resolved to
come to work in Tofino and to help run the club. He managed this at
the end of September 2020 despite COVID's best efforts!
<br />
<br />
Even with only one training session in the books before another
wave of the virus had the district's sports and recreation shut
down again, he was happy to be part of the scene and eager to
help develop the club into a flourishing dojo with several keen
members when it opened it’s doors permanently once again in late 
2021. In the short term he has helped grade the first novice
students up to green belt and also directly assisted David in
an impromptu test for light blue belt! Long term he hopes to get a
good pool of new members who will become both proficient in self
defence and willing to oblige the senior members in dishing out
tough beatings to hone them up for subsequent gradings, and to
foster good links with affiliated clubs in the rest of Canada and
overseas. A fond participant of the triennial International
event, he has been present for it in Edinburgh, then in
Collingwood, Ontario, Canada, and most recently in Drakensberg,
South Africa. While he was unable to make the next event in Vienna,
Austria,
in the summer of 2023, he has resolved to attend the following one
wherever it may be held!
<br />
<br />
One of Seumas' major goals in creating this website was to provide
an easily searchable syllabus document, not just for students but
also with a view to allow foreign instructors such as himself and David to 
better understand the Canadian version, which is quite similar to
the UK version but does differ in several key ways with specific
techniques and ordering through the belt grades. He also hopes that
students will engage with it and comment on any techniques they like
or have difficulty with in particular. This syllabus will be featured
on the website in a coming update.
<br />
<br />
</Card.Text>
            
<Card.Header id="capitalised-header" style={{backgroundColor: "gray", textTransform: 'uppercase', fontSize: 30}}>David Corbett Sempai (he/him)</Card.Header>

<CardGroup className = "card-group">
    
<Card style={{backgroundColor: "gray", flex: 1}}>
<Card.Body>
<img src={david_casual} alt="davidcasual" className="photo"></img>
</Card.Body>

</Card>

<Card style={{backgroundColor: "gray", flex: 1, paddingRight: "5rem"}}>
<Card.Body>
<img src={david_teaching} alt="davidteaching" className="photo"></img>
</Card.Body>

</Card>
</CardGroup>
<Card.Text style={{paddingLeft: 15, paddingRight: 15, fontSize: 20}} >
<br />
<br />
David’s start with martial arts started as he was growing up in Almancil,
Portugal where he trained as a junior in <a href="http://www.yamabushiryu.com/">Yamabushi Ryu jiu jitsu</a>
under Prof. Jamie Lee-Barron Hanshi from 7 years old to 11 years old, achieving
his junior brown belt before he left to move back to the UK.
<br />
<br />
Once there David tried karate until settling into Judo at school, achieving his
yellow belt before the school club closed and he found a local martials arts club
teaching <a href="http://www.fuseki.co.uk/">Fuseki Martial Arts Systems</a>.
David regularly trained with the adult’s class, attended courses on eskrima sticks, and even
competed in a national competition.
<br />
<br />
David took a break from martial arts until he found <a href="https://www.jitsufoundation.org/">Shorinji Kan Jiu Jitsu</a>
at University College Birmingham in 2013 when he was studying Hospitality
Business Management there. Something about the finesse of Jiu Jitsu struck him
and he dove in with a passion, always arriving to session early to set up the mats
to eke out the most time learning he could. David graded to green belt in March 2015
and in May of 2015 UCB Jitsu won “Club of the Year” under David’s captaincy.
<br />
<br />
David then headed off to Tofino, BC. to start his placement year and was sad to
discover that the nearest Shorinji Kan Jiu Jitsu club was in Vancouver, around a
6-hour car and ferry journey away. Luckily there was a local Judo club that David
trained at whenever the opportunity presented itself.
<br />
<br />
David returned to the UK and UCB Jitsu in June 2017 and got right back into training,
often training 3-4 times a week with the Birmingham clubs. David was planning on
returning to Canada and wanted to start a club of his own to help him maintain his Jiu
Jitsu skills as well as share his love of the art with others. After sharing this
desire with Max Bauer Sensei, and receiving approval from The Jiu Jitsu Foundation,
David completed his Club Instructor Course and graded to purple belt in March 2018.
He was grateful for other instructors who helped him get there including James Owen,
Eric Lau and Paul Glebioska of University of Birmingham and Aston University, and
perhaps foremost so with the assistance of Pristen Sibanda.
<br />
<br />
He then returned to Canada and with the help of Andy Dobie Shihan, Alex Pappas, and a
whole host of international instructors including Andreas Lerch, David founded the
“study group” Tuff City Jitsu in July of 2018. His passion for Jiu Jitsu attracted a
core group who trained regularly, as well as many drop ins who joined when their
schedules allowed. A grading for his novices was set for March 2020 with the
Vancouver Club until the pandemic halted all Jiu Jitsu plans.
<br />
<br />
Tuff City Jitsu restarted after the pandemic in September 2021 and we held our first
grading in April 2022 when David graded to light blue belt. David continues to manage
the club, as well as teach and train alongside Seumas Sensei and eagerly awaits his
opportunity to grade to dark blue.
<br />
<br />
When David isn’t running the club or training, or thinking about training, he enjoys a
variety of video games, hiking and exploring the local area, Karaoke @ The Maq, as well
as playing Magic: The Gathering with friends.
</Card.Text>
            
        </Card>




        );
    }
}