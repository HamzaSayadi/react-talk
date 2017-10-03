import $ from 'jquery';
const React = require("react");

class Chat extends React.Component {

  constructor(props) {
    super(props);
    const SERVER_ADDRESS = 'http://127.0.0.1:3001' ;
    this.state = {
      messages : {},
      socket: window.io(SERVER_ADDRESS),
      user : "unnamed",
      usernames : [],
      chatboxes : [],
    };
  }

  componentDidMount() {


    var self = this ;

    //Initialize listeners for chat server
    this.state.socket.on("receive-private" , function (msg) {
      if (typeof self.state.messages[msg.user] === 'undefined') {
        if(msg.user == self.state.user){
            self.state.messages[msg.to].push(msg);
            self.forceUpdate();
            return null;
        }
        else {
          self.state.messages[msg.user] = [];
        }
      }
      self.state.messages[msg.user].push(msg);
      if ( $.inArray(msg.user, self.state.chatboxes) == -1 ){
        self.state.chatboxes.push(msg.user);
      }
      self.forceUpdate();
    });
    this.state.socket.on("usernames" , function (msg) {
      self.setState({ usernames : msg });
    });
  }


  //pick a username
  pickUser(){
    var user = document.getElementById('username').value;
    this.setState({"user" : user });
    this.state.socket.emit("new user" , user);
  }

  //add a chatbox for user u
  chatWith(u){
    if ( $.inArray(u, this.state.chatboxes) == -1 ){
      this.setState({
        cb : this.state.chatboxes.push(u)
      });
    }
    if(typeof this.state.messages[u] == 'undefined'){
      this.state.messages[u] = [];
    }
  }

  //send private message to user u
  sendTo(u){
    var msg = document.getElementById(u).value;
    document.getElementById(u).value = "";
    this.state.socket.emit("private-message" , {from : this.state.user , to : u , body : msg });
  }

  //minimizing a chatbox
  minmizeChatBox(event){
    if(event.target.parentElement.nextSibling.style.display == "block")
      event.target.parentElement.nextSibling.style.display = "none";
    else {
      event.target.parentElement.nextSibling.style.display = "block";
    }
  }

  //closing a chatbox
  closeChatBox(cb){
    console.log("closing chatbox "+cb);
    const newChatboxes = this.state.chatboxes;
    newChatboxes.splice($.inArray(cb, newChatboxes),1);
    this.setState({
      chatboxes : newChatboxes
    });
  }

  render() {

    var self = this;

    //Render connected users
    let i = 0 ;
    var usernames = this.state.usernames.map(function (users) {
        i++ ;
        return (
          <div key={i} className="sidebar-name">
            <a>
              <img width="30" height="30" src="https://upload.wikimedia.org/wikipedia/commons/d/d3/User_Circle.png" />
           <span onClick={() => self.chatWith(users)}> {users} </span>
          </a>
          </div>
        )
    });
    let j = 1 ;

    //Render Chatboxes
    var chatboxes = self.state.chatboxes.map(function (cb) {
      let divStyle = {
        right : j*220
      };
      j++;
      let privatmessages;
      if (typeof self.state.messages[cb] !== 'undefined'){
        privatmessages = self.state.messages[cb].map(function (msg , index) {
        return <div key={index}> {msg.user} : {msg.body} <br/> </div>;
      });
      }
      else{
        privatmessages = null;
      }
      const chatboxId = "chatbox-"+cb ;
      return (
        <div className="chatbox" style={divStyle} key={j}>
          <div className="head">Chat with {cb}
                <span onClick={() => self.closeChatBox(cb)} style={{marginLeft : "10px"}} className="popup-head-right"> x </span>
                <span onClick={self.minmizeChatBox} className="popup-head-right"> - </span>
          </div>
          <div className="content" style={{display:"block"}}>
            <div> {privatmessages}</div>
            <div className="chat-on">
              <input id={cb} type="text"/>
              <button onClick={() => self.sendTo(cb)}> Send </button>
            </div>
          </div>
        </div>

      );
    })


    return (
      <div>
        <div className="side-bar">
          <div>
            <div className="form-group">
                <label for="usr">Name:</label>
                <input type="text" id="username" className="form-control" />
            </div>

          </div>
          <div className="btn btn-primary" onClick={this.pickUser.bind(this)} >
            choose username
          </div>
          <div className="connected-users">

            <label for="usr">Connected Users ( {this.state.usernames.length} ) :  </label>
            {usernames}
          </div>
        </div>
        <div>
            {chatboxes}
        </div>
      </div>
    );
  }
}

export default Chat;
