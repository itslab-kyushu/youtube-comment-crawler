React = require "react"
ReactDOM = require "react-dom"
request = require "superagent"

URL_REGISTER_IDS = "/lib/register-ids"
URL_REGISTERED_IDS = "/lib/registered-ids"

VideoIDManager = React.createClass

  getInitialState: ->
    registeredIDs: []

  componentDidMount: ->
    @loadRegisteredIDs()

  handleRegister: (ids) ->
    console.log ids
    request
      .post URL_REGISTER_IDS
      .send ids
      .end (err, res) =>
        @loadRegisteredIDs()

  loadRegisteredIDs: ->
    request
      .get URL_REGISTERED_IDS
      .end (err, res) =>
        @setState
          registeredIDs: res.body

  render: ->
    <div>
      <RegisterVideoID onRegister={@handleRegister}/>
      <RegisteredVideoIDs ids={@state.registeredIDs}/>
    </div>


RegisterVideoID = React.createClass

  propTypes:
    onRegister: React.PropTypes.func

  getInitialState: ->
    videoIDs: ""

  handleVideoidsChange: (e) ->
    @setState
      videoIDs: e.target.value

  handleRegisterButton: ->
    if @state.videoIDs isnt ""
      if @props.onRegister?
        @props.onRegister @state.videoIDs.split(",").map (v) ->
          v.replace(/^\s+|\s+$/g, "")
      @setState
        videoIDs: ""

  render: ->
    <div className="container">
      <h2>Register new Video IDs</h2>
      <form>
        <div className="form-group">
          <label htmlFor="video-ids">Video IDs</label>
          <input
            id="video-ids" className="form-control" type="text"
            value={@state.videoIDs} onChange={@handleVideoidsChange}
            placeholder="Comma-separated video IDs"/>
        </div>
        <input type="text" name="dummy" style={{"display": "none"}}/>
        <button
          className="btn btn-default" type="button"
          onClick={@handleRegisterButton}>Register</button>
      </form>
    </div>


RegisteredVideoIDs = React.createClass

  propTypes:
    ids: React.PropTypes.array

  render: ->
    <div className="container">
      <h2>Registered Video IDs</h2>
      <ul>
        {@props.ids.map (v) ->
          <li key={v.key}>{v.value}</li>
        }
      </ul>
    </div>


ReactDOM.render <VideoIDManager />, document.getElementById("react")
