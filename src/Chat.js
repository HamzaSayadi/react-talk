import React from 'react';
import config from './config';
import uniqid from 'uniqid';
import './Chat.css';
class Chat extends React.Component {

  constructor(props) {
    super(props);
    const SERVER_ADDRESS = config.SERVER_ADDRESS;
    this.socket = window.io(SERVER_ADDRESS);
    this.state = {
      messages: {},
      user: "unnamed",
      usernames: [],
      chatboxes: []
    };
  }

  checkboxExists(userObj, checkboxes) {
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].id === userObj.id)
        return true
    }
    return false
  }

  componentDidMount() {

    this.socket.on("usernames", (msg) => {
      this.setState({usernames: msg});
    });

    this.socket.on('message', (data) => {

      let newMessages = {
        ...this.state.messages
      }
      let newChatboxes = [...this.state.chatboxes]

      if (newMessages[data.from.name] === undefined) {
        newMessages[data.from.name] = []
      }

      if (data.self) {
        if (newMessages[data.to.name] === undefined) {
          newMessages[data.to.name] = []
        }
        newMessages[data.to.name].push({msg: data.message, from: data.from})
      } else {
        newMessages[data.from.name].push({msg: data.message, from: data.from})

        if (!this.checkboxExists(data.from, this.state.chatboxes) && (data.self !== true)) {
          newChatboxes.push({name: data.from.name, id: data.from.id});
        }

      }

      this.setState({messages: newMessages, chatboxes: newChatboxes})

    });

  }

  //pick a username
  pickUser() {
    const userName = document.getElementById('username').value;
    const userObj = {
      name: userName,
      id: uniqid()
    }

    this.socket.emit("new user", userObj);

    this.setState({user: userObj});

  }

  //add a chatbox for user u
  chatWith(u) {

    if (!this.checkboxExists(u, this.state.chatboxes)) {
      this.setState({cb: this.state.chatboxes.push(u)});
    }

    if (typeof this.state.messages[u] === 'undefined') {
      let newMessages = {...this.state.messages} ;
      newMessages[u] = []
      this.setState({
        messages : newMessages
      })
    }

  }

  //send private message to user u
  sendTo(u) {

    var msg = document.getElementById(u).value;
    document.getElementById(u).value = "";

    this.socket.emit('send', {
      from: this.state.user,
      to: u,
      message: msg
    });

  }

  //minimizing a chatbox
  minmizeChatBox(event) {
    if (event.target.parentElement.nextSibling.style.display === "block")
      event.target.parentElement.nextSibling.style.display = "none";
    else {
      event.target.parentElement.nextSibling.style.display = "block";
    }
  }

  //closing a chatbox
  closeChatBox(cb) {
    let newChatboxes = this.state.chatboxes;
    newChatboxes = newChatboxes.filter((item) => {
        return item.id !== cb.id
    })

    this.setState({
      chatboxes: newChatboxes
    });
  }

  renderConnected() {
    if (this.state.user === "unnamed") {
      return (
        <div>
          <div>
            <div className="form-group">
              <label >Name:</label>
              <input type="text" id="username" className="form-control"/>
            </div>

          </div>
          <div className="btn btn-primary" onClick={this.pickUser.bind(this)}>
            Connect
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <h4>
            Connected as {this.state.user.name} !
          </h4>
        </div>
      )
    }
  }
  render() {

    // Render connected users
    let i = 0;
    var usernames = this.state.usernames.map((user) => {
      i++;
      if (user.id !== this.state.user.id) {
        return (
          <div key={i} className="sidebar-name">
            <a>
              <img width="30" height="30" alt="profile_image" src="https://upload.wikimedia.org/wikipedia/commons/d/d3/User_Circle.png"/>
              <span onClick={() => this.chatWith(user)}>
                {user.name}
              </span>
            </a>
          </div>
        )
      }
      else {
        return null
      }
    });
    let j = 1;

    //Render Chatboxes
    var chatboxes = this.state.chatboxes.map((cb) => {
      let divStyle = {
        right: j*220
      };
      j++;
      let privatmessages;
      if (typeof this.state.messages[cb.name] !== 'undefined') {
        privatmessages = this.state.messages[cb.name].map(function(msg, index) {
          return <div key={index}>
            {msg.from.name}
            : {msg.msg}
            <br/>
          </div>;
        });
      } else {
        privatmessages = null;
      }

      const chatboxId = "chatbox-" + cb;
      return (
        <div key={chatboxId} className="chatbox" style={divStyle}>
          <div className="head">Chat with {cb.name}
            <span onClick={() => this.closeChatBox(cb)} style={{
              marginLeft: "10px"
            }} className="popup-head-right">
              X
            </span>
            <span onClick={this.minmizeChatBox} className="popup-head-right">
              -
            </span>
          </div>
          <div className="content" style={{
            display: "block"
          }}>
            <div>
              {privatmessages}
            </div>
            <div className="chat-on">
              <input id={cb} type="text"/>
              <button onClick={() => this.sendTo(cb)}>
                Send
              </button>
            </div>
          </div>
        </div>

      );
    })

    return (
      <div>
        <div className="side-bar">
          {this.renderConnected()}
          <div className="connected-users">

            <label >Connected Users ( { (this.state.usernames.length === 0) ? 0 : this.state.usernames.length - 1  } ) :
            </label>
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
