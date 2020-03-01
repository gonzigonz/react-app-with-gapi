import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(pros) {
    super(pros)
    this.state = {
      error: null,
      gapiLoaded: false,
      username: "",
      email: "",
      projects: [],
    }
  }
  componentDidMount() {
    window.gapi.load('client:auth2', () => {
      window.gapi.auth2.init({
        client_id: process.env.REACT_APP_GAPI_AUTH_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/cloud-platform.read-only"
      })
        .then(() => {
          this.setState({ gapiLoaded: true })
          this.authenticate(this.onErrors, this.onSuccess, this.loadClient, this.execute)
        }, (e) => this.onErrors(e))
    });
  }
  componentWillUnmount() {
    window.alert("Will unmount!")
  }
  onErrors = (e) => {
    this.setState({ error: e })
  }
  onSuccess = (res) => {
    this.setState({ projects: res.result.projects })
  }
  authenticate = (onErrors, onSuccess, loadClient, task) => {
    return window.gapi.auth2.getAuthInstance().signIn()
      .then(function () {
        console.log("Sign-in successful");
        loadClient(onErrors, onSuccess, task);
      }, function (e) {
        console.error("Error signing in", e);
        onErrors({ error: "signing in error", response: e.error });
      })
  }
  loadClient = (onErrors, onSuccess, task) => {
    window.gapi.client.load("https://content.googleapis.com/discovery/v1/apis/cloudresourcemanager/v1/rest")
      .then(function () {
        console.log("gAPI client loaded for API")
        task(onErrors, onSuccess);
      }, function (e) {
        console.error("Error loading gAPI client for API", e)
        onErrors(e);
      })
  }
  execute = (onErrors, onSuccess) => {
    window.gapi.client.cloudresourcemanager.projects.list()
      .then(function (response) {
        onSuccess(response);
      }, function (response) {
        console.error("gAPI client error", response.result);
        onErrors(response.result);
      })
  }
  render() {
    return (
      <div className="App">
        <h1>React gAPI Sample</h1>
        <header className="App-header">
          {!this.state.gapiLoaded ? (
            <>
              <p>gAPI Loading...</p>
              <img src={logo} className="App-logo" alt="logo" />
            </>
          ) : (
              <>
                {this.state.username && <p>Username: {this.state.username}</p>}
                {this.state.email && <p>Email: {this.state.email}</p>}
                <p>Edit <code>src/App.js</code> and save to reload.</p>
                <a className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer">Learn React</a>
              </>
            )}
          <ProjectsList projects={this.state.projects}></ProjectsList>
          {this.state.error && <pre className="App-errors">{JSON.stringify(this.state.error, null, 2)}</pre>}
        </header>
      </div>
    );
  }
}

function ProjectsList(props) {
  const projects = props.projects;
  return (
    <>
      <p>{projects ? "GCP Projects:" : "No GCP Projects"}</p>
      <ul className="App-projects">
        {projects && projects.map((r) =>
          <li key={r.projectNumber}>{JSON.stringify(r)}</li>
        )}
      </ul>
    </>
  );
}

export default App;
